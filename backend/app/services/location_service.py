import httpx
from typing import Optional, Dict, Any, Tuple
from app.schemas.complaint import LocationInfo
from app.core.logging import logger

# Karachi Boundary Box
KARACHI_BOUNDS = {
    "min_lat": 24.70,
    "max_lat": 25.20,
    "min_lon": 66.85,
    "max_lon": 67.45
}

# Major Karachi Area Geocoding Knowledge Base
KARACHI_AREAS: Dict[str, Dict[str, Any]] = {
    "north nazimabad": {
        "lat": 24.9333, "lon": 67.0392,
        "town": "North Nazimabad Town", "district": "Central",
        "display_name": "North Nazimabad, Karachi"
    },
    "nazimabad": {
        "lat": 24.9142, "lon": 67.0315,
        "town": "Liaquatabad Town", "district": "Central",
        "display_name": "Nazimabad, Karachi"
    },
    "clifton": {
        "lat": 24.8211, "lon": 67.0321,
        "town": "Clifton Cantonment", "district": "South",
        "display_name": "Clifton, Karachi"
    },
    "dha": {
        "lat": 24.8115, "lon": 67.0544,
        "town": "Cantonment Board Clifton", "district": "South",
        "display_name": "DHA, Karachi"
    },
    "defence": {
        "lat": 24.8115, "lon": 67.0544,
        "town": "Cantonment Board Clifton", "district": "South",
        "display_name": "DHA, Karachi"
    },
    "shahrah-e-faisal": {
        "lat": 24.8615, "lon": 67.0658,
        "town": "Jamshed Town / Faisal Cantt", "district": "East",
        "display_name": "Shahrah-e-Faisal, Karachi"
    },
    "gulshan-e-iqbal": {
        "lat": 24.9207, "lon": 67.0982,
        "town": "Gulshan Town", "district": "East",
        "display_name": "Gulshan-e-Iqbal, Karachi"
    },
    "gulshan": {
        "lat": 24.9207, "lon": 67.0982,
        "town": "Gulshan Town", "district": "East",
        "display_name": "Gulshan-e-Iqbal, Karachi"
    },
    "gulistan-e-jauhar": {
        "lat": 24.9180, "lon": 67.1350,
        "town": "Gulshan Town", "district": "East",
        "display_name": "Gulistan-e-Jauhar, Karachi"
    },
    "jauhar": {
        "lat": 24.9180, "lon": 67.1350,
        "town": "Gulshan Town", "district": "East",
        "display_name": "Gulistan-e-Jauhar, Karachi"
    },
    "korangi": {
        "lat": 24.8340, "lon": 67.1265,
        "town": "Korangi Town", "district": "Korangi",
        "display_name": "Korangi, Karachi"
    },
    "korangi cantt": {
        "lat": 24.8190, "lon": 67.1300,
        "town": "Cantonment Board Korangi & Landhi", "district": "Korangi",
        "display_name": "Korangi Cantonment, Karachi"
    },
    "landhi": {
        "lat": 24.8433, "lon": 67.1950,
        "town": "Landhi Town", "district": "Malir",
        "display_name": "Landhi, Karachi"
    },
    "malir cantt": {
        "lat": 24.9250, "lon": 67.2000,
        "town": "Malir Cantonment", "district": "Malir",
        "display_name": "Malir Cantt, Karachi"
    },
    "malir": {
        "lat": 24.8980, "lon": 67.1850,
        "town": "Malir Town", "district": "Malir",
        "display_name": "Malir, Karachi"
    },
    "faisal cantt": {
        "lat": 24.8800, "lon": 67.1100,
        "town": "Faisal Cantonment", "district": "East",
        "display_name": "Faisal Cantt, Karachi"
    },
    "manora": {
        "lat": 24.7972, "lon": 66.9744,
        "town": "Manora Cantonment", "district": "Keamari",
        "display_name": "Manora Island, Karachi"
    },
    "saddar": {
        "lat": 24.8580, "lon": 67.0180,
        "town": "Saddar Town", "district": "South",
        "display_name": "Saddar, Karachi"
    },
    "pechs": {
        "lat": 24.8670, "lon": 67.0600,
        "town": "Jamshed Town", "district": "East",
        "display_name": "PECHS, Karachi"
    },
    "liaquatabad": {
        "lat": 24.9080, "lon": 67.0420,
        "town": "Liaquatabad Town", "district": "Central",
        "display_name": "Liaquatabad, Karachi"
    },
    "federal b area": {
        "lat": 24.9350, "lon": 67.0700,
        "town": "Gulberg Town", "district": "Central",
        "display_name": "Federal B Area, Karachi"
    },
    "fb area": {
        "lat": 24.9350, "lon": 67.0700,
        "town": "Gulberg Town", "district": "Central",
        "display_name": "Federal B Area, Karachi"
    },
    "gulberg": {
        "lat": 24.9380, "lon": 67.0650,
        "town": "Gulberg Town", "district": "Central",
        "display_name": "Gulberg, Karachi"
    },
    "north karachi": {
        "lat": 24.9850, "lon": 67.0620,
        "town": "New Karachi Town", "district": "Central",
        "display_name": "North Karachi, Karachi"
    },
    "new karachi": {
        "lat": 24.9850, "lon": 67.0620,
        "town": "New Karachi Town", "district": "Central",
        "display_name": "New Karachi, Karachi"
    },
    "surjani": {
        "lat": 25.0250, "lon": 67.0500,
        "town": "Gadab Town", "district": "West",
        "display_name": "Surjani Town, Karachi"
    },
    "orangi": {
        "lat": 24.9450, "lon": 66.9850,
        "town": "Orangi Town", "district": "West",
        "display_name": "Orangi Town, Karachi"
    },
    "baldia": {
        "lat": 24.9150, "lon": 66.9700,
        "town": "Baldia Town", "district": "Keamari",
        "display_name": "Baldia Town, Karachi"
    },
    "keamari": {
        "lat": 24.8150, "lon": 66.9850,
        "town": "Keamari Town", "district": "Keamari",
        "display_name": "Keamari, Karachi"
    },
    "tariq road": {
        "lat": 24.8710, "lon": 67.0590,
        "town": "Jamshed Town", "district": "East",
        "display_name": "Tariq Road, PECHS, Karachi"
    },
    "bahadurabad": {
        "lat": 24.8820, "lon": 67.0680,
        "town": "Jamshed Town", "district": "East",
        "display_name": "Bahadurabad, Karachi"
    },
    "burns road": {
        "lat": 24.8560, "lon": 67.0190,
        "town": "Saddar Town", "district": "South",
        "display_name": "Burns Road, Saddar, Karachi"
    },
    "garden": {
        "lat": 24.8750, "lon": 67.0200,
        "town": "Saddar Town", "district": "South",
        "display_name": "Garden, Karachi"
    }
}

class LocationService:
    def is_within_karachi(self, lat: float, lon: float) -> bool:
        return (
            KARACHI_BOUNDS["min_lat"] <= lat <= KARACHI_BOUNDS["max_lat"]
            and KARACHI_BOUNDS["min_lon"] <= lon <= KARACHI_BOUNDS["max_lon"]
        )

    def geocode_area_text(self, area_text: str) -> Optional[Dict[str, Any]]:
        """Finds closest area match in Karachi Area dictionary."""
        q = area_text.lower()
        for key, data in KARACHI_AREAS.items():
            if key in q or q in key:
                return data
        return None

    async def reverse_geocode_osm(self, lat: float, lon: float) -> Optional[str]:
        """Performs reverse geocoding via OpenStreetMap Nominatim."""
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=16&addressdetails=1"
        headers = {"User-Agent": "KarachiCivicAI/1.0 (contact: support@thecityaroundyou.pk)"}
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    res = resp.json()
                    return res.get("display_name")
        except Exception:
            pass
        return None

    def resolve_location(
        self,
        manual_lat: Optional[float] = None,
        manual_lon: Optional[float] = None,
        location_source: Optional[str] = None,
        browser_lat: Optional[float] = None,
        browser_lon: Optional[float] = None,
        exif_lat: Optional[float] = None,
        exif_lon: Optional[float] = None,
        extracted_text: Optional[str] = None,
        extracted_area: Optional[str] = None
    ) -> LocationInfo:
        """
        Implements strict dynamic priority:
        1. EXIF GPS (if photo provided and has metadata)
        2. Dynamic text/voice extraction (e.g. 'North Nazimabad Block H')
        3. Browser GPS (if user clicked 'Use My Location')
        4. Explicit user map pin (if user actually pinned/moved marker)
        5. General Karachi Metropolitan fallback (so lat/lon are NEVER null)
        """
        # 1. EXIF GPS from Photo Metadata
        if exif_lat is not None and exif_lon is not None and self.is_within_karachi(exif_lat, exif_lon):
            area_match = self.find_nearest_known_area(exif_lat, exif_lon)
            return LocationInfo(
                latitude=round(exif_lat, 6),
                longitude=round(exif_lon, 6),
                location_source="exif",
                location_confidence=0.95,
                address=f"{area_match.get('display_name', 'Karachi')} (from Photo GPS)",
                area=area_match.get("display_name", "").split(",")[0].strip(),
                town=area_match.get("town", ""),
                district=area_match.get("district", ""),
                location_text=area_match.get("display_name", "")
            )

        # 2. Explicit User Map Pin / Manual coordinates (When user intentionally pinned/selected an area)
        if manual_lat is not None and manual_lon is not None and self.is_within_karachi(manual_lat, manual_lon):
            area_match = self.find_nearest_known_area(manual_lat, manual_lon)
            return LocationInfo(
                latitude=round(manual_lat, 6),
                longitude=round(manual_lon, 6),
                location_source=location_source or "manual",
                location_confidence=0.99,
                address=area_match.get("display_name", "Selected on Map, Karachi"),
                area=area_match.get("display_name", "").split(",")[0].strip(),
                town=area_match.get("town", ""),
                district=area_match.get("district", ""),
                location_text=area_match.get("display_name", "")
            )

        # 3. Browser GPS
        if location_source == "gps" and browser_lat is not None and browser_lon is not None:
            if self.is_within_karachi(browser_lat, browser_lon):
                area_match = self.find_nearest_known_area(browser_lat, browser_lon)
                return LocationInfo(
                    latitude=round(browser_lat, 6),
                    longitude=round(browser_lon, 6),
                    location_source="gps",
                    location_confidence=0.95,
                    address=area_match.get("display_name", "Browser GPS Location, Karachi"),
                    area=area_match.get("display_name", "").split(",")[0].strip(),
                    town=area_match.get("town", ""),
                    district=area_match.get("district", ""),
                    location_text=area_match.get("display_name", "")
                )

        # 4. Extracted text / voice (e.g. "North Nazimabad", "Clifton", "Korangi", "Shahrah-e-Faisal")
        text_query = extracted_area or extracted_text or ""
        matched = self.geocode_area_text(text_query)
        if matched:
            return LocationInfo(
                latitude=matched["lat"],
                longitude=matched["lon"],
                location_source="text",
                location_confidence=0.90,
                address=matched["display_name"],
                area=matched["display_name"].split(",")[0].strip(),
                town=matched["town"],
                district=matched["district"],
                location_text=text_query
            )

        # 5. Default when no location has been given yet: Gracefully default to Karachi Metropolitan Area
        return LocationInfo(
            latitude=24.8607,
            longitude=67.0011,
            location_source="estimated_city",
            location_confidence=0.60,
            address="Karachi Metropolitan Area, Sindh, Pakistan",
            area="Karachi Central",
            town="Karachi",
            district="Karachi",
            location_text="Karachi (General)"
        )

    def find_nearest_known_area(self, lat: float, lon: float) -> Dict[str, Any]:
        """Finds closest known Karachi area by Euclidean distance."""
        best_match = {
            "display_name": "Karachi, Pakistan",
            "town": "Karachi",
            "district": "Karachi"
        }
        min_dist = float("inf")
        for data in KARACHI_AREAS.values():
            dist = (data["lat"] - lat) ** 2 + (data["lon"] - lon) ** 2
            if dist < min_dist:
                min_dist = dist
                best_match = data
        return best_match

location_service = LocationService()
