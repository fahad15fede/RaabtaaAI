from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.repositories.service_repository import service_repo

router = APIRouter(prefix="/api/services", tags=["services"])

@router.get("/categories")
def list_service_categories():
    return service_repo.list_categories()

@router.get("")
def list_services(
    category: Optional[str] = None,
    service_type: Optional[str] = None,
    search: Optional[str] = None,
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    sort: str = Query("nearest", pattern="^(nearest|price_low)$")
):
    return service_repo.list_services(
        category=category,
        service_type=service_type,
        search=search,
        lat=latitude,
        lon=longitude,
        sort=sort
    )

@router.get("/nearby")
def list_nearby_services(
    latitude: float = Query(24.9333),
    longitude: float = Query(66.9833),
    service_type: Optional[str] = None
):
    return service_repo.list_services(
        service_type=service_type,
        lat=latitude,
        lon=longitude,
        sort="nearest"
    )

@router.get("/{id}")
def get_service_detail(id: str):
    service = service_repo.get_by_id(id)
    if not service:
        raise HTTPException(status_code=404, detail="Civic service not found")
    return service

@router.get("/{id}/pricing")
def get_service_pricing(id: str):
    service = service_repo.get_by_id(id)
    if not service:
        raise HTTPException(status_code=404, detail="Civic service not found")
    return {
        "service_id": service["id"],
        "title": service["title"],
        "price_amount": service.get("price_amount"),
        "price_currency": service.get("price_currency", "PKR"),
        "price_unit": service.get("price_unit"),
        "price_verified": service.get("price_verified", False),
        "verified_text": f"{service.get('price_currency')} {service.get('price_amount')}" if service.get("price_verified") else "Price currently unavailable.",
        "last_verified_at": service.get("last_verified_at")
    }

@router.get("/{id}/contacts")
def get_service_contacts(id: str):
    service = service_repo.get_by_id(id)
    if not service:
        raise HTTPException(status_code=404, detail="Civic service not found")
    return {
        "service_id": service["id"],
        "authority_name": service.get("authority_name"),
        "contact_phone": service.get("contact_phone"),
        "contact_email": service.get("contact_email"),
        "contact_verified": service.get("contact_verified", False),
        "source_url": service.get("source_url")
    }
