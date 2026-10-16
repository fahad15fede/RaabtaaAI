import base64
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends

from app.schemas.complaint import (
    AnalyzeRequest,
    AnalyzeResponse,
    ComplaintClassification,
    ComplaintDetail,
    ComplaintText,
    SendEmailRequest,
    SendEmailResponse,
    DuplicateInfo
)
from app.services.gemini_service import gemini_service
from app.services.groq_service import groq_service
from app.services.whisper_service import whisper_service
from app.services.location_service import location_service
from app.services.routing_service import routing_service
from app.services.duplicate_service import duplicate_service
from app.services.email_service import email_service
from app.repositories.complaint_repository import complaint_repo
from app.repositories.authority_repository import authority_repo
from app.utils.exif import extract_gps_from_bytes
from app.core.logging import logger

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

from app.core.security import get_current_user_id

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_complaint(req: AnalyzeRequest, user_id: Optional[str] = Depends(get_current_user_id)):
    """
    Unified Master Analysis Pipeline:
    INPUT -> UNDERSTAND -> LOCATE -> CLASSIFY -> ROUTE -> CHECK DUPLICATES -> GENERATE
    """
    complaint_id = str(uuid.uuid4())
    try:
        reference_id = complaint_repo.next_reference_id()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    original_text = req.text
    transcript = None
    exif_lat = None
    exif_lon = None
    image_url = None
    audio_url = None

    # Step 1: Input handling
    # A. Voice Input
    if req.input_type == "voice" and req.audio_base64:
        logger.info("Transcribing audio input via Whisper...")
        transcript = await whisper_service.transcribe_base64(req.audio_base64)
        recognized_text = (transcript or "").strip()
        if len(recognized_text) >= 4 and len(recognized_text.split()) >= 2:
            original_text = recognized_text
        elif req.text and len(req.text.strip().split()) >= 2:
            original_text = req.text.strip()
        elif req.transcript and len(req.transcript.strip().split()) >= 2:
            original_text = req.transcript.strip()
        else:
            raise HTTPException(
                status_code=422,
                detail="We only recognized a very short phrase. Please record the issue in a complete sentence or switch to text input."
            )
        audio_url = req.audio_base64 if req.audio_base64.startswith("data:") else "data:audio/webm;base64," + req.audio_base64

    # B. Photo Input
    elif req.input_type == "photo" and req.image_base64:
        logger.info("Processing photo input: extracting EXIF metadata...")
        clean_b64 = req.image_base64.split(",")[-1]
        try:
            raw_bytes = base64.b64decode(clean_b64, validate=True)
        except (ValueError, base64.binascii.Error):
            raise HTTPException(status_code=422, detail="Invalid image encoding")
        if len(raw_bytes) > 10 * 1024 * 1024 or len(raw_bytes) < 100:
            raise HTTPException(status_code=422, detail="Image must be between 100 bytes and 10 MB")
        if raw_bytes.startswith(b"\xff\xd8\xff"):
            image_mime = "image/jpeg"
        elif raw_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            image_mime = "image/png"
        elif raw_bytes[:4] == b"RIFF" and raw_bytes[8:12] == b"WEBP":
            image_mime = "image/webp"
        else:
            raise HTTPException(status_code=422, detail="Unsupported or corrupted image; use JPEG, PNG, or WebP")
        image_url = f"data:{image_mime};base64," + clean_b64

        # Extract EXIF GPS
        gps_tuple = extract_gps_from_bytes(raw_bytes)
        if gps_tuple:
            exif_lat, exif_lon = gps_tuple
            logger.info(f"EXIF GPS discovered: lat={exif_lat}, lon={exif_lon}")

    # Step 2: Understand & Classify (Gemini for visual facts / Groq for text)
    if req.input_type == "photo" and req.image_base64:
        vision_result = await gemini_service.analyze_image(req.image_base64, mime_type=image_mime)
        category_name = vision_result.get("category", "other")
        subcategory = vision_result.get("subcategory", "general")
        severity = vision_result.get("severity", "medium")
        problem_desc = vision_result.get("visible_problem", req.text or "Civic issue captured in photograph.")
        confidence = float(vision_result.get("confidence", 0.92))
        normalized_english = problem_desc
        extracted_area = req.area or ""
        reasoning = vision_result.get("reasoning", "Identified observable civic disruption via visual inspection.")
    else:
        text_to_process = original_text or req.text
        if not text_to_process or not text_to_process.strip():
            raise HTTPException(
                status_code=400,
                detail="Please describe the issue or speak a voice note before analyzing."
            )
        text_analysis = await groq_service.normalize_and_classify_text(text_to_process)
        category_name = text_analysis.get("category", "other")
        subcategory = text_analysis.get("subcategory", "general")
        severity = text_analysis.get("severity", "medium")
        normalized_english = text_analysis.get("normalized_english", text_to_process)
        confidence = float(text_analysis.get("confidence", 0.90))
        extracted_area = text_analysis.get("location", {}).get("area", "")
        reasoning = text_analysis.get("reasoning_summary", "Extracted semantic intent from citizen report.")
        problem_desc = normalized_english

    classification = ComplaintClassification(
        category=category_name,
        subcategory=subcategory,
        severity=severity,
        description=problem_desc,
        location_text=extracted_area,
        confidence=confidence,
        reasoning_summary=reasoning
    )

    # Step 3: Location Resolution
    location = location_service.resolve_location(
        manual_lat=req.latitude if req.location_source in ["map", "manual"] else None,
        manual_lon=req.longitude if req.location_source in ["map", "manual"] else None,
        location_source=req.location_source,
        browser_lat=req.latitude if req.location_source == "gps" else None,
        browser_lon=req.longitude if req.location_source == "gps" else None,
        exif_lat=exif_lat,
        exif_lon=exif_lon,
        extracted_text=original_text,
        extracted_area=req.area or extracted_area
    )

    # Step 4: Authority Routing (Database-driven)
    authority = routing_service.route_complaint(
        category=category_name,
        subcategory=subcategory,
        area=location.area,
        town=location.town,
        location_text=location.location_text,
        description=problem_desc
    )

    # Step 5: Duplicate Detection
    duplicate = duplicate_service.check_duplicate(
        category=category_name,
        latitude=location.latitude,
        longitude=location.longitude,
        area=location.area
    )

    # Step 6: Dual Complaint Generation (English for Authority, Urdu for Citizen)
    location_summary = location.address or location.area or "Karachi, Pakistan"
    complaint_texts = await groq_service.generate_dual_complaint(
        category_name=category_name,
        issue_description=problem_desc,
        location_str=location_summary,
        authority_name=authority.name,
        reference_id=reference_id
    )

    complaint_data = {
        "id": complaint_id,
        "reference_id": reference_id,
        "user_id": user_id,
        "input_type": req.input_type,
        "original_text": original_text,
        "transcript": transcript,
        "normalized_english": normalized_english,
        "english_complaint": complaint_texts["english"],
        "urdu_complaint": complaint_texts["urdu"],
        "category": category_name,
        "subcategory": subcategory,
        "authority": authority.model_dump(),
        "severity": severity,
        "ai_confidence": confidence,
        "status": "ready",
        "duplicate_of": duplicate.duplicate_of,
        "duplicate_confidence": duplicate.duplicate_confidence,
        "report_count": duplicate.report_count,
        "location": location.model_dump(),
        "image_url": image_url,
        "audio_url": audio_url,
        "email_sent_at": None,
        "email_error": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "events": [
            {
                "id": str(uuid.uuid4())[:8],
                "event_type": "created",
                "message": f"Complaint report received via {req.input_type.title()} input.",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4())[:8],
                "event_type": "location_detected",
                "message": f"Location identified: {location.address} (Source: {location.location_source.upper()})",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4())[:8],
                "event_type": "classified",
                "message": f"Classified as {category_name.replace('_', ' ').title()} ({severity.title()} severity, {round(confidence * 100)}% confidence).",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4())[:8],
                "event_type": "authority_resolved",
                "message": f"Assigned to {authority.name} ({authority.short_name}).",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4())[:8],
                "event_type": "duplicate_checked",
                "message": "Similar complaint nearby found." if duplicate.is_duplicate else "No duplicate complaints detected nearby.",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4())[:8],
                "event_type": "complaint_generated",
                "message": "Professional bilingual complaint drafts prepared.",
                "created_at": datetime.now().isoformat()
            }
        ]
    }

    if not user_id:
        raise HTTPException(status_code=401, detail="Sign in to save a complaint.")
    try:
        complaint_repo.create(complaint_data)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return AnalyzeResponse(
        complaint_id=complaint_id,
        reference_id=reference_id,
        input_type=req.input_type,
        original_text=original_text,
        normalized_english=normalized_english,
        classification=classification,
        location=location,
        authority=authority,
        duplicate=duplicate,
        complaint=ComplaintText(**complaint_texts),
        status="ready",
        created_at=complaint_data["created_at"],
        image_url=image_url,
        audio_url=audio_url
    )

@router.post("/{id}/send", response_model=SendEmailResponse)
async def send_complaint(id: str):
    """
    Dispatches the official English complaint to the configured authority email.
    """
    result = await email_service.send_complaint_email(id)
    return SendEmailResponse(
        success=result["success"],
        status=result["status"],
        message=result["message"],
        email_sent_at=result.get("email_sent_at"),
        reference_id=result.get("reference_id", id),
        authority_name=result.get("authority_name", "Authority"),
        authority_email=result.get("authority_email")
    )

@router.post("/{id}/retry-email", response_model=SendEmailResponse)
async def retry_email(id: str):
    return await send_complaint(id)

from fastapi import APIRouter, HTTPException, Query, Depends, Depends
@router.post("/{id}/support")
def support_existing_complaint(id: str, user_id: Optional[str] = Depends(get_current_user_id)):
    uid = user_id or "demo-user-1"
    updated = complaint_repo.increment_report_count(id, user_id=uid)
    if not updated:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {
        "success": True,
        "message": "Your support report was successfully recorded for this civic complaint.",
        "report_count": updated["report_count"]
    }

@router.get("/{id}/support-status")
def get_support_status(id: str, user_id: Optional[str] = Depends(get_current_user_id)):
    complaint = complaint_repo.get_by_id(id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    uid = user_id or "demo-user-1"
    key = f"{id}:{uid}"
    supported = hasattr(complaint_repo, "_supporters") and key in complaint_repo._supporters
    return {
        "complaint_id": id,
        "report_count": complaint.get("report_count", 1),
        "user_supported": supported
    }


@router.get("/my", response_model=List[ComplaintDetail])
def get_my_complaints(user_id: Optional[str] = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Sign in to view your complaints.")
    try:
        return complaint_repo.get_user_complaints(user_id)
    except Exception as exc:
        logger.error("Complaint history query failed: %s", type(exc).__name__)
        raise HTTPException(status_code=503, detail="Unable to load complaints from the database.") from exc

@router.delete("/{id}")
def delete_complaint(id: str, user_id: Optional[str] = Depends(get_current_user_id)):
    uid = user_id or "demo-user-1"
    res = complaint_repo.delete_complaint(id, uid)
    if not res["success"]:
        raise HTTPException(
            status_code=res.get("status_code", 400),
            detail=res.get("detail", "Error deleting complaint.")
        )
    return {"success": True, "message": res.get("detail", "Complaint deleted successfully.")}

@router.get("", response_model=List[ComplaintDetail])
def list_complaints(
    date_filter: str = Query("all", pattern="^(all|today|last_week|last_month)$"),
    category: Optional[str] = None,
    authority_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query("newest", pattern="^(newest|oldest)$")
):
    complaints = complaint_repo.list_all(
        date_filter=date_filter,
        category=category,
        authority_id=authority_id,
        status=status,
        search=search,
        sort=sort
    )
    return complaints

@router.get("/{id}", response_model=ComplaintDetail)
def get_complaint(id: str):
    complaint = complaint_repo.get_by_id(id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint
