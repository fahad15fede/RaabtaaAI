from typing import Dict, Optional, Any
from supabase import create_client
from app.core.config import settings
from app.core.logging import logger

DEMO_PROFILES: Dict[str, Dict[str, Any]] = {
    "demo-user-1": {
        "id": "demo-user-1",
        "user_id": "demo-user-1",
        "full_name": "Karachi Resident",
        "username": "karachicitizen",
        "email": "citizen@karachi.pk",
        "phone": "+92 300 1234567",
        "preferred_language": "en",
        "location": "North Nazimabad, Karachi",
        "current_area": "North Nazimabad, Karachi",
        "home_area": "North Nazimabad, Karachi",
        "latitude": 24.9333,
        "longitude": 66.9833,
        "created_at": "2026-09-10T10:00:00Z"
    }
}

class ProfileRepository:
    def __init__(self):
        self.profiles = DEMO_PROFILES
        self.supabase = None
        try:
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
            if settings.SUPABASE_URL and key:
                self.supabase = create_client(settings.SUPABASE_URL, key)
        except Exception as e:
            logger.debug(f"ProfileRepository Supabase init note: {e}")

    def get_profile(self, user_id: str) -> Dict[str, Any]:
        if user_id in self.profiles:
            return self.profiles[user_id]
        
        # Try fetching from Supabase DB
        if self.supabase:
            try:
                res = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    prof = res.data[0]
                    self.profiles[user_id] = prof
                    return prof
            except Exception as e:
                logger.debug(f"Supabase profile query: {e}")

        # Default profile for authenticated user ID
        default_profile = {
            "id": user_id,
            "user_id": user_id,
            "full_name": "Karachi Citizen",
            "username": f"user_{user_id[:8]}",
            "email": f"{user_id[:8]}@citizen.karachi.pk" if len(user_id) > 8 else "citizen@karachi.pk",
            "location": "North Nazimabad, Karachi",
            "current_area": "North Nazimabad, Karachi",
            "home_area": "North Nazimabad, Karachi",
            "latitude": 24.9333,
            "longitude": 66.9833,
            "preferred_language": "en",
            "created_at": "2026-09-13T00:00:00Z"
        }
        self.profiles[user_id] = default_profile
        return default_profile

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        profile = self.get_profile(user_id)
        profile.update({k: v for k, v in updates.items() if v is not None})
        if "location" in updates:
            profile["current_area"] = updates["location"]
            profile["home_area"] = updates["location"]
        self.profiles[user_id] = profile
        if self.supabase:
            try:
                db_updates = {k: v for k, v in updates.items() if k in [
                    "full_name", "username", "email", "location", "latitude", "longitude", "preferred_language"
                ]}
                self.supabase.table("profiles").upsert({"id": user_id, **db_updates}).execute()
            except Exception as e:
                logger.debug(f"Supabase profile update sync: {e}")
        return profile

profile_repo = ProfileRepository()
