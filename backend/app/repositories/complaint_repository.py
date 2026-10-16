import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from app.repositories.authority_repository import authority_repo

# Seed demo records so the dashboard has rich historical context for the hero demo
INITIAL_DEMO_COMPLAINTS: List[Dict[str, Any]] = [
    {
        "id": "c0000001-0000-0000-0000-000000000001",
        "reference_id": "CWA-20260910-001",
        "user_id": "demo-user-1",
        "input_type": "text",
        "original_text": "Shahrah-e-Faisal near Nursery bridge road has severe deep potholes causing traffic accidents.",
        "transcript": None,
        "normalized_english": "Severe deep potholes on the main artery Shahrah-e-Faisal near Nursery bridge causing traffic hazards.",
        "english_complaint": "Subject: Civic Complaint - Roads & Potholes - Shahrah-e-Faisal - Reference CWA-20260910-001\n\nDear Sir/Madam,\nA civic complaint has been submitted regarding:\nIssue: Severe road damage and potholes on main transit artery\nLocation: Shahrah-e-Faisal near Nursery, Karachi\nDescription: Heavy craters and asphalt deterioration posing severe hazard to motorists and rapid transit.\nRequested Action: Immediate asphalt recarpeting and structural road repair.\nReference ID: CWA-20260910-001\n\nPlease review and take appropriate action.\n\nRegards,\nThe City Around You",
        "urdu_complaint": "موضوع: شہری شکایت - سڑک کی خرابی - شاہراہ فیصل\n\nمحترم جناب،\nشاہراہ فیصل نرسری پل کے قریب سڑک پر گہرے گڑھے بن چکے ہیں جن سے ٹریفک جام اور حادثات کا خطرہ ہے۔ فوری استرکاری اور مرمت کی درخواست کی جاتی ہے۔\nشکایت حوالہ: CWA-20260910-001",
        "category": "road_damage",
        "subcategory": "main_road_pothole",
        "severity": "high",
        "ai_confidence": 0.95,
        "status": "sent",
        "duplicate_of": None,
        "duplicate_confidence": 0.0,
        "report_count": 4,
        "location": {
            "latitude": 24.8615,
            "longitude": 67.0658,
            "location_accuracy": 15.0,
            "location_source": "text",
            "location_confidence": 0.96,
            "address": "Shahrah-e-Faisal, Nursery, PECHS, Karachi",
            "area": "PECHS / Shahrah-e-Faisal",
            "town": "Jamshed Town",
            "district": "East",
            "location_text": "Shahrah-e-Faisal near Nursery"
        },
        "authority": {
            "id": "11111111-1111-1111-1111-111111111111",
            "name": "Karachi Metropolitan Corporation",
            "short_name": "KMC",
            "email": "mayor@kmc.gos.pk",
            "phone": "+92 21 99215000",
            "email_configured": True,
            "routing_confidence": 0.96,
            "routing_reason": "Maintenance of main arterial roads and bridges in Karachi is managed by KMC."
        },
        "image_url": None,
        "audio_url": None,
        "email_sent_at": (datetime.now() - timedelta(days=2)).isoformat(),
        "email_error": None,
        "created_at": (datetime.now() - timedelta(days=2)).isoformat(),
        "updated_at": (datetime.now() - timedelta(days=2)).isoformat(),
        "events": [
            {"id": "e1", "event_type": "created", "message": "Report submitted via Text input", "created_at": (datetime.now() - timedelta(days=2)).isoformat()},
            {"id": "e2", "event_type": "location_detected", "message": "Location identified: Shahrah-e-Faisal near Nursery", "created_at": (datetime.now() - timedelta(days=2)).isoformat()},
            {"id": "e3", "event_type": "classified", "message": "Classified as Roads & Potholes (High Severity)", "created_at": (datetime.now() - timedelta(days=2)).isoformat()},
            {"id": "e4", "event_type": "authority_resolved", "message": "Routed to Karachi Metropolitan Corporation (KMC)", "created_at": (datetime.now() - timedelta(days=2)).isoformat()},
            {"id": "e5", "event_type": "email_sent", "message": "Official complaint emailed to mayor@kmc.gos.pk", "created_at": (datetime.now() - timedelta(days=2)).isoformat()}
        ]
    },
    {
        "id": "c0000002-0000-0000-0000-000000000002",
        "reference_id": "CWA-20260911-002",
        "user_id": "demo-user-1",
        "input_type": "text",
        "original_text": "Clifton Block 2 Khayaban-e-Jami streetlights have been completely off for 2 weeks.",
        "transcript": None,
        "normalized_english": "Street lighting outage for 2 weeks on Khayaban-e-Jami, Clifton Block 2.",
        "english_complaint": "Subject: Civic Complaint - Street Lighting - Clifton Block 2 - Reference CWA-20260911-002\n\nDear Sir/Madam,\nA civic complaint has been submitted regarding:\nIssue: Complete streetlight blackout\nLocation: Khayaban-e-Jami, Clifton Block 2, Karachi\nDescription: Non-functional street illumination causing pedestrian safety hazards.\nRequested Action: Replace damaged lamps and restore electrical connection.\nReference ID: CWA-20260911-002\n\nPlease review and take appropriate action.\n\nRegards,\nThe City Around You",
        "urdu_complaint": "موضوع: شہری شکایت - اسٹریٹ لائٹس - کلفٹن بلاک 2\n\nمحترم جناب،\nخیابان جامی کلفٹن بلاک 2 میں پچھلے دو ہفتوں سے اسٹریٹ لائٹس مکمل بند ہیں۔ فوری بحالی کی درخواست ہے۔\nشکایت حوالہ: CWA-20260911-002",
        "category": "street_lighting",
        "subcategory": "dark_street",
        "severity": "medium",
        "ai_confidence": 0.94,
        "status": "sent",
        "duplicate_of": None,
        "duplicate_confidence": 0.0,
        "report_count": 2,
        "location": {
            "latitude": 24.8211,
            "longitude": 67.0321,
            "location_accuracy": 20.0,
            "location_source": "text",
            "location_confidence": 0.97,
            "address": "Khayaban-e-Jami, Clifton Block 2, Karachi",
            "area": "Clifton Block 2",
            "town": "Clifton",
            "district": "South",
            "location_text": "Clifton Block 2 Khayaban-e-Jami"
        },
        "authority": {
            "id": "44444444-4444-4444-4444-444444444444",
            "name": "Cantonment Board Clifton",
            "short_name": "CBC",
            "email": "info@cbc.gov.pk",
            "phone": "+92 21 99251848",
            "email_configured": True,
            "routing_confidence": 0.98,
            "routing_reason": "Clifton and DHA municipal services fall under Cantonment Board Clifton jurisdiction."
        },
        "image_url": None,
        "audio_url": None,
        "email_sent_at": (datetime.now() - timedelta(days=1)).isoformat(),
        "email_error": None,
        "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
        "updated_at": (datetime.now() - timedelta(days=1)).isoformat(),
        "events": [
            {"id": "e11", "event_type": "created", "message": "Report submitted", "created_at": (datetime.now() - timedelta(days=1)).isoformat()},
            {"id": "e12", "event_type": "authority_resolved", "message": "Routed to Cantonment Board Clifton (CBC)", "created_at": (datetime.now() - timedelta(days=1)).isoformat()},
            {"id": "e13", "event_type": "email_sent", "message": "Official complaint emailed to info@cbc.gov.pk", "created_at": (datetime.now() - timedelta(days=1)).isoformat()}
        ]
    }
]

from supabase import create_client
from app.core.config import settings
from app.core.logging import logger

class ComplaintRepository:
    def __init__(self):
        self._complaints: Dict[str, Dict[str, Any]] = {}
        self.supabase = None
        try:
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
            if settings.SUPABASE_URL and key:
                self.supabase = create_client(settings.SUPABASE_URL, key)
                logger.info("Connected ComplaintRepository to Supabase client.")
        except Exception as e:
            logger.warning(f"Could not connect to Supabase: {e}")

    def next_reference_id(self) -> str:
        today_str = datetime.now().strftime("%Y%m%d")
        prefix = f"CWA-{today_str}-"
        sequence = 0

        if self.supabase:
            try:
                response = (
                    self.supabase.table("complaints")
                    .select("reference_id")
                    .like("reference_id", f"{prefix}%")
                    .limit(10000)
                    .execute()
                )
                for row in response.data:
                    suffix = row.get("reference_id", "").rsplit("-", 1)[-1]
                    if suffix.isdigit():
                        sequence = max(sequence, int(suffix))
            except Exception as exc:
                logger.error("Complaint reference lookup failed: %s", type(exc).__name__)
                raise RuntimeError("A complaint reference could not be allocated.") from exc
        else:
            sequence = len(self._complaints)

        return f"{prefix}{sequence + 1:03d}"

    def create(self, complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        c_id = complaint_data.get("id") or str(uuid.uuid4())
        complaint_data["id"] = c_id
        if not complaint_data.get("reference_id"):
            today_str = datetime.now().strftime("%Y%m%d")
            seq = len(self._complaints) + 1
            complaint_data["reference_id"] = f"CWA-{today_str}-{seq:03d}"
        if not complaint_data.get("created_at"):
            complaint_data["created_at"] = datetime.now().isoformat()
        complaint_data["updated_at"] = datetime.now().isoformat()
        if "events" not in complaint_data:
            complaint_data["events"] = []

        # Persist directly into Supabase 'complaints' table
        if not self.supabase:
            raise RuntimeError("Complaint database is not configured; no complaint was saved.")
        if self.supabase:
            try:
                db_row = {
                    "id": c_id,
                    "reference_id": complaint_data.get("reference_id"),
                    "user_id": complaint_data.get("user_id", "demo-user-1"),
                    "input_type": complaint_data.get("input_type", "text"),
                    "original_text": complaint_data.get("original_text"),
                    "transcript": complaint_data.get("transcript"),
                    "normalized_english": complaint_data.get("normalized_english"),
                    "english_complaint": complaint_data.get("english_complaint"),
                    "urdu_complaint": complaint_data.get("urdu_complaint"),
                    "category": complaint_data.get("category"),
                    "subcategory": complaint_data.get("subcategory"),
                    "authority": complaint_data.get("authority", {}),
                    "severity": complaint_data.get("severity", "medium"),
                    "ai_confidence": float(complaint_data.get("ai_confidence", 0.9)),
                    "status": complaint_data.get("status", "ready"),
                    "duplicate_of": complaint_data.get("duplicate_of"),
                    "duplicate_confidence": float(complaint_data.get("duplicate_confidence", 0.0)),
                    "report_count": int(complaint_data.get("report_count", 1)),
                    "location": complaint_data.get("location", {}),
                    "latitude": complaint_data.get("location", {}).get("latitude"),
                    "longitude": complaint_data.get("location", {}).get("longitude"),
                    "location_source": complaint_data.get("location", {}).get("location_source"),
                    "image_url": complaint_data.get("image_url"),
                    "audio_url": complaint_data.get("audio_url"),
                    "created_at": complaint_data.get("created_at"),
                    "updated_at": complaint_data.get("updated_at")
                }
                self.supabase.table("complaints").insert(db_row).execute()
                logger.info(f"Complaint {c_id} ({complaint_data.get('reference_id')}) successfully written to Supabase DB.")
            except Exception as e:
                logger.error("Complaint database insert failed: %s", type(e).__name__)
                raise RuntimeError("Complaint could not be saved to the database.") from e

        self._complaints[c_id] = complaint_data
        return complaint_data

    def get_by_id(self, complaint_id: str) -> Optional[Dict[str, Any]]:
        if complaint_id in self._complaints:
            return self._complaints[complaint_id]
        if not self.supabase:
            return None
        response = self.supabase.table("complaints").select("*").eq("id", complaint_id).limit(1).execute()
        return self._hydrate(response.data[0]) if response.data else None

    def get_by_reference_id(self, reference_id: str) -> Optional[Dict[str, Any]]:
        for c in self._complaints.values():
            if c.get("reference_id") == reference_id:
                return c
        return None

    def update(self, complaint_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if complaint_id in self._complaints:
            self._complaints[complaint_id].update(updates)
            self._complaints[complaint_id]["updated_at"] = datetime.now().isoformat()
            if self.supabase:
                try:
                    db_updates = {k: v for k, v in updates.items() if k in [
                        "status", "email_sent_at", "email_message_id", "email_error",
                        "report_count", "updated_at", "english_complaint", "urdu_complaint"
                    ]}
                    db_updates["updated_at"] = self._complaints[complaint_id]["updated_at"]
                    self.supabase.table("complaints").update(db_updates).eq("id", complaint_id).execute()
                except Exception as e:
                    logger.debug(f"Supabase update sync: {e}")
            return self._complaints[complaint_id]
        return None

    def add_event(self, complaint_id: str, event_type: str, message: str, metadata: Optional[Dict[str, Any]] = None):
        if complaint_id in self._complaints:
            event = {
                "id": str(uuid.uuid4())[:8],
                "event_type": event_type,
                "message": message,
                "metadata": metadata or {},
                "created_at": datetime.now().isoformat()
            }
            self._complaints[complaint_id].setdefault("events", []).append(event)
            if self.supabase:
                try:
                    self.supabase.table("complaint_events").insert({
                        "complaint_id": complaint_id,
                        "event_type": event_type,
                        "message": message,
                        "metadata": metadata or {},
                        "created_at": event["created_at"]
                    }).execute()
                except Exception as e:
                    logger.debug(f"Supabase event sync: {e}")

    def increment_report_count(self, complaint_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if complaint_id in self._complaints:
            # Check user support tracking
            if not hasattr(self, "_supporters"):
                self._supporters = set()
            key = f"{complaint_id}:{user_id or 'anon'}"
            if user_id and key in self._supporters:
                return self._complaints[complaint_id] # already supported
            if user_id:
                self._supporters.add(key)

            self._complaints[complaint_id]["report_count"] = self._complaints[complaint_id].get("report_count", 1) + 1
            self.add_event(complaint_id, "report_incremented", f"Resident supported this civic report (Total: {self._complaints[complaint_id]['report_count']})")
            return self._complaints[complaint_id]
        return None

    def list_nearby(
        self,
        latitude: float = 24.9333,
        longitude: float = 66.9833,
        radius_meters: float = 2000.0,
        category: Optional[str] = None,
        sort: str = "nearest", # 'nearest', 'newest', 'most_reported', 'most_severe'
        page: int = 1,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        import math
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0 # Radius of Earth in km
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        results = []
        radius_km = radius_meters / 1000.0
        for c in self._complaints.values():
            loc = c.get("location", {})
            c_lat = loc.get("latitude") or c.get("latitude")
            c_lon = loc.get("longitude") or c.get("longitude")
            if c_lat is None or c_lon is None:
                c_lat, c_lon = 24.9333, 66.9833
            
            dist = haversine(latitude, longitude, c_lat, c_lon)
            if dist <= radius_km:
                item = dict(c)
                item["distance_km"] = round(dist, 2)
                item["distance_m"] = int(dist * 1000)
                results.append(item)

        if category and category != "all":
            results = [c for c in results if c.get("category") == category]

        severity_rank = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        if sort == "nearest":
            results.sort(key=lambda x: x.get("distance_km", 999))
        elif sort == "newest":
            results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        elif sort == "most_reported":
            results.sort(key=lambda x: x.get("report_count", 1), reverse=True)
        elif sort == "most_severe":
            results.sort(key=lambda x: severity_rank.get(x.get("severity", "medium"), 0), reverse=True)

        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        return results[start_idx:end_idx]

    def get_hotspots(self, latitude: float = 24.9333, longitude: float = 66.9833) -> List[Dict[str, Any]]:
        nearby = self.list_nearby(latitude=latitude, longitude=longitude, radius_meters=15000.0, limit=100)
        clusters: Dict[str, Dict[str, Any]] = {}
        for c in nearby:
            area = c.get("location", {}).get("area") or c.get("location", {}).get("town") or "Karachi"
            if area not in clusters:
                clusters[area] = {
                    "area": area,
                    "report_count": 0,
                    "complaint_count": 0,
                    "categories": set(),
                    "latitude": c.get("location", {}).get("latitude", latitude),
                    "longitude": c.get("location", {}).get("longitude", longitude)
                }
            clusters[area]["complaint_count"] += 1
            clusters[area]["report_count"] += c.get("report_count", 1)
            clusters[area]["categories"].add(c.get("category", "other"))

        hotspots = []
        for area, data in clusters.items():
            if data["report_count"] >= 2 or data["complaint_count"] >= 2:
                hotspots.append({
                    "area": area,
                    "report_count": data["report_count"],
                    "active_complaints": data["complaint_count"],
                    "categories": list(data["categories"]),
                    "latitude": data["latitude"],
                    "longitude": data["longitude"],
                    "is_hotspot": True
                })
        hotspots.sort(key=lambda x: x["report_count"], reverse=True)
        return hotspots

    def _hydrate(self, row: Dict[str, Any]) -> Dict[str, Any]:
        item = dict(row)
        item.setdefault("events", [])
        item.setdefault("authority", {})
        item.setdefault("location", {})
        item.setdefault("report_count", 1)
        return item

    def get_user_complaints(self, user_id: str) -> List[Dict[str, Any]]:
        if self.supabase:
            response = self.supabase.table("complaints").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return [self._hydrate(row) for row in response.data]
        results = [c for c in self._complaints.values() if c.get("user_id") == user_id]
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results

    def delete_complaint(self, complaint_id: str, user_id: str) -> Dict[str, Any]:
        c = self.get_by_id(complaint_id)
        if not c:
            return {"success": False, "status_code": 404, "detail": "Complaint not found."}

        # Ownership validation
        if c.get("user_id") != user_id and user_id != "admin":
            return {"success": False, "status_code": 403, "detail": "You do not have permission to delete this complaint."}

        # Dispatch state check (cannot delete once sent)
        if c.get("email_sent_at") is not None or c.get("status") in ["sent", "resolved"]:
            return {"success": False, "status_code": 400, "detail": "This complaint has already been sent and cannot be deleted."}

        # Perform deletion
        del self._complaints[complaint_id]

        if self.supabase:
            try:
                self.supabase.table("complaints").delete().eq("id", complaint_id).execute()
            except Exception as e:
                logger.debug(f"Supabase complaint delete sync: {e}")

        return {"success": True, "status_code": 200, "detail": "Complaint deleted successfully."}

    def list_all(
        self,
        date_filter: str = "all", # 'all', 'today', 'last_week', 'last_month'
        category: Optional[str] = None,
        authority_id: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        sort: str = "newest", # 'newest', 'oldest'
        user_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = list(self._complaints.values())
        now = datetime.now()

        if user_id:
            results = [c for c in results if c.get("user_id") == user_id]

        # Date filtering
        if date_filter == "today":
            start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            results = [c for c in results if datetime.fromisoformat(c["created_at"]) >= start_of_today]
        elif date_filter == "last_week":
            cutoff = now - timedelta(days=7)
            results = [c for c in results if datetime.fromisoformat(c["created_at"]) >= cutoff]
        elif date_filter == "last_month":
            cutoff = now - timedelta(days=30)
            results = [c for c in results if datetime.fromisoformat(c["created_at"]) >= cutoff]

        # Category filtering
        if category and category != "all":
            results = [c for c in results if c.get("category") == category]

        # Authority filtering
        if authority_id and authority_id != "all":
            results = [c for c in results if c.get("authority", {}).get("id") == authority_id or c.get("authority", {}).get("short_name") == authority_id]

        # Status filtering
        if status and status != "all":
            results = [c for c in results if c.get("status") == status]

        # Search query across category, location, authority, reference_id, text
        if search:
            q = search.lower().strip()
            results = [
                c for c in results
                if q in c.get("reference_id", "").lower()
                or q in c.get("category", "").lower()
                or q in c.get("original_text", "").lower()
                or q in c.get("authority", {}).get("name", "").lower()
                or q in c.get("authority", {}).get("short_name", "").lower()
                or q in c.get("location", {}).get("address", "").lower()
                or q in c.get("location", {}).get("area", "").lower()
            ]

        # Sorting
        results.sort(
            key=lambda x: x["created_at"],
            reverse=(sort == "newest")
        )
        return results

complaint_repo = ComplaintRepository()

