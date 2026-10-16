from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.location_service import location_service
from app.schemas.complaint import LocationInfo

router = APIRouter(prefix="/api/location", tags=["location"])

class LocationResolveRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    area_text: Optional[str] = None

@router.post("/resolve", response_model=LocationInfo)
async def resolve_location(req: LocationResolveRequest):
    if req.latitude is not None and req.longitude is not None:
        if not location_service.is_within_karachi(req.latitude, req.longitude):
            # Still accept, but note outside bounds
            pass
        return location_service.resolve_location(
            manual_lat=req.latitude,
            manual_lon=req.longitude,
            extracted_area=req.area_text
        )
    elif req.area_text:
        return location_service.resolve_location(extracted_area=req.area_text)

    return location_service.resolve_location()
