from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.security import get_current_user_id
from app.repositories.profile_repository import profile_repo
from app.repositories.service_repository import service_repo
from app.repositories.complaint_repository import complaint_repo

router = APIRouter(prefix="/api/me", tags=["user"])

@router.get("")
@router.get("/profile")
def get_user_profile(user_id: Optional[str] = Depends(get_current_user_id)):
    uid = user_id or "demo-user-1"
    profile = profile_repo.get_profile(uid)
    complaints = complaint_repo.get_user_complaints(uid)
    saved_services = service_repo.list_saved_services(uid)
    return {
        "profile": profile,
        "complaints_count": len(complaints),
        "saved_services_count": len(saved_services)
    }

@router.patch("/profile")
def update_user_profile(
    updates: Dict[str, Any] = Body(...),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    uid = user_id or "demo-user-1"
    updated = profile_repo.update_profile(uid, updates)
    return {"success": True, "profile": updated}

@router.get("/saved-services")
def get_saved_services(user_id: Optional[str] = Depends(get_current_user_id)):
    uid = user_id or "demo-user-1"
    return service_repo.list_saved_services(uid)

@router.post("/saved-services")
def save_service(
    payload: Dict[str, str] = Body(...),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    uid = user_id or "demo-user-1"
    service_id = payload.get("service_id")
    if not service_id:
        raise HTTPException(status_code=400, detail="service_id required")
    service_repo.save_service(uid, service_id)
    return {"success": True, "message": "Service saved to your profile."}

@router.delete("/saved-services/{id}")
def remove_saved_service(
    id: str,
    user_id: Optional[str] = Depends(get_current_user_id)
):
    uid = user_id or "demo-user-1"
    service_repo.remove_saved_service(uid, id)
    return {"success": True, "message": "Service removed from saved services."}
