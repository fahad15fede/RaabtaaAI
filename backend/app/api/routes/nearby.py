from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query
from app.repositories.complaint_repository import complaint_repo

router = APIRouter(prefix="/api/nearby", tags=["nearby"])

@router.get("/problems")
def get_nearby_problems(
    latitude: float = Query(24.9333, description="Citizen latitude"),
    longitude: float = Query(66.9833, description="Citizen longitude"),
    radius: float = Query(2000.0, description="Radius in meters, default 2000m"),
    radius_km: Optional[float] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    sort: str = Query("nearest", pattern="^(nearest|newest|most_reported|most_severe)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Returns public civic complaints geographically near the user's selected location (default 2000m).
    Private reporter information (user_id, email, phone) is strictly omitted.
    """
    effective_radius_m = radius
    if radius_km is not None:
        effective_radius_m = radius_km * 1000.0

    problems = complaint_repo.list_nearby(
        latitude=latitude,
        longitude=longitude,
        radius_meters=effective_radius_m,
        category=category,
        sort=sort,
        page=page,
        limit=limit
    )

    if status and status != "all":
        problems = [p for p in problems if p.get("status") == status]
    if severity and severity != "all":
        problems = [p for p in problems if p.get("severity") == severity]
    # Sanitize private reporter attributes before returning to public client
    sanitized = []
    for p in problems:
        safe_item = {
            "id": p.get("id"),
            "reference_id": p.get("reference_id"),
            "input_type": p.get("input_type"),
            "category": p.get("category"),
            "subcategory": p.get("subcategory"),
            "severity": p.get("severity"),
            "status": p.get("status"),
            "report_count": p.get("report_count", 1),
            "created_at": p.get("created_at"),
            "distance_km": p.get("distance_km"),
            "distance_m": p.get("distance_m"),
            "authority": {
                "name": p.get("authority", {}).get("name"),
                "short_name": p.get("authority", {}).get("short_name")
            },
            "location": {
                "address": p.get("location", {}).get("address"),
                "area": p.get("location", {}).get("area"),
                "town": p.get("location", {}).get("town"),
                "latitude": p.get("location", {}).get("latitude"),
                "longitude": p.get("location", {}).get("longitude")
            },
            "description": p.get("normalized_english") or p.get("original_text") or "Civic issue reported."
        }
        sanitized.append(safe_item)
    return sanitized

@router.get("/hotspots")
def get_nearby_hotspots(
    latitude: float = Query(24.9333),
    longitude: float = Query(66.9833)
):
    """
    Returns geographic civic complaint hotspots for the selected location area.
    """
    return complaint_repo.get_hotspots(latitude=latitude, longitude=longitude)
