import math
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from app.repositories.complaint_repository import complaint_repo
from app.schemas.complaint import DuplicateInfo
from app.core.logging import logger

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two coordinates in meters."""
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DuplicateService:
    def __init__(self, max_distance_meters: float = 600.0, time_window_days: int = 14):
        self.max_distance_meters = max_distance_meters
        self.time_window_days = time_window_days

    def check_duplicate(
        self,
        category: str,
        latitude: Optional[float],
        longitude: Optional[float],
        area: Optional[str] = None,
        exclude_id: Optional[str] = None
    ) -> DuplicateInfo:
        """
        Checks for existing nearby complaints with the same category reported
        within the active time window.
        """
        if latitude is None or longitude is None:
            return DuplicateInfo(is_duplicate=False, duplicate_confidence=0.0, report_count=1)

        recent_cutoff = datetime.now() - timedelta(days=self.time_window_days)
        all_complaints = complaint_repo.list_all(date_filter="all")

        closest_match: Optional[Dict[str, Any]] = None
        min_dist = float("inf")

        for c in all_complaints:
            if exclude_id and c["id"] == exclude_id:
                continue

            # Must match same category
            if c.get("category") != category:
                continue

            # Check time window
            created_at = datetime.fromisoformat(c["created_at"])
            if created_at < recent_cutoff:
                continue

            loc = c.get("location") or {}
            c_lat = loc.get("latitude")
            c_lon = loc.get("longitude")

            if c_lat is not None and c_lon is not None:
                dist = haversine_distance_meters(latitude, longitude, c_lat, c_lon)
                if dist <= self.max_distance_meters and dist < min_dist:
                    min_dist = dist
                    closest_match = c

        if closest_match:
            report_cnt = closest_match.get("report_count", 1)
            confidence = max(0.70, round(1.0 - (min_dist / self.max_distance_meters) * 0.3, 2))
            logger.info(f"Duplicate found for category {category} within {round(min_dist, 1)}m: {closest_match['reference_id']}")
            return DuplicateInfo(
                is_duplicate=True,
                duplicate_of=closest_match["id"],
                existing_complaint_id=closest_match["id"],
                duplicate_confidence=confidence,
                report_count=report_cnt + 1,
                message=f"Similar issue already reported nearby ({round(min_dist)}m away). {report_cnt} residents have already reported this."
            )

        return DuplicateInfo(
            is_duplicate=False,
            duplicate_confidence=0.0,
            report_count=1,
            message="No similar complaints found in this immediate area."
        )

duplicate_service = DuplicateService()
