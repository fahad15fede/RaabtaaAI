from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ComplaintClassification(BaseModel):
    category: str = Field(..., description="Category name (e.g. sewage, garbage, road_damage)")
    subcategory: str = Field(default="general", description="Specific subcategory")
    severity: str = Field(default="medium", description="Severity level: low, medium, high, critical")
    description: str = Field(..., description="Clean description of the detected civic issue")
    location_text: str = Field(default="", description="Extracted textual location description")
    confidence: float = Field(default=0.9, description="AI classification confidence score between 0.0 and 1.0")
    reasoning_summary: str = Field(default="", description="Concise explanation of the classification")

class LocationInfo(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_accuracy: Optional[float] = None
    location_source: str = "manual" # 'gps', 'exif', 'text', 'voice', 'map', 'manual', 'geocoded'
    location_confidence: float = 0.8
    address: Optional[str] = "Karachi, Sindh, Pakistan"
    area: Optional[str] = ""
    town: Optional[str] = ""
    district: Optional[str] = ""
    location_text: Optional[str] = ""

class AuthorityInfo(BaseModel):
    id: str
    name: str
    short_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    email_configured: bool = False
    routing_confidence: float = 0.95
    routing_reason: str = ""

class DuplicateInfo(BaseModel):
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None
    duplicate_confidence: float = 0.0
    report_count: int = 1
    existing_complaint_id: Optional[str] = None
    message: Optional[str] = None

class ComplaintText(BaseModel):
    english: str
    urdu: str

class AnalyzeRequest(BaseModel):
    input_type: str = "text" # 'photo', 'voice', 'text'
    text: Optional[str] = None
    transcript: Optional[str] = None
    image_base64: Optional[str] = None
    audio_base64: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None
    location_accuracy: Optional[float] = None
    address: Optional[str] = None
    area: Optional[str] = None
    town: Optional[str] = None
    district: Optional[str] = None
    user_id: Optional[str] = None

class AnalyzeResponse(BaseModel):
    complaint_id: str
    reference_id: str
    input_type: str
    original_text: Optional[str] = None
    normalized_english: Optional[str] = None
    classification: ComplaintClassification
    location: LocationInfo
    authority: AuthorityInfo
    duplicate: DuplicateInfo
    complaint: ComplaintText
    status: str
    created_at: str
    image_url: Optional[str] = None
    audio_url: Optional[str] = None

class SendEmailRequest(BaseModel):
    complaint_id: str

class SendEmailResponse(BaseModel):
    success: bool
    status: str
    message: str
    email_sent_at: Optional[str] = None
    reference_id: str
    authority_name: str
    authority_email: Optional[str] = None

class ComplaintEvent(BaseModel):
    id: str
    event_type: str
    message: str
    created_at: str
    metadata: Optional[Dict[str, Any]] = None

class ComplaintDetail(BaseModel):
    id: str
    reference_id: str
    user_id: Optional[str] = None
    input_type: str
    original_text: Optional[str] = None
    transcript: Optional[str] = None
    normalized_english: Optional[str] = None
    english_complaint: Optional[str] = None
    urdu_complaint: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    authority: AuthorityInfo
    severity: str
    ai_confidence: float
    status: str
    duplicate_of: Optional[str] = None
    duplicate_confidence: float = 0.0
    report_count: int = 1
    location: LocationInfo
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    email_sent_at: Optional[str] = None
    email_error: Optional[str] = None
    created_at: str
    updated_at: str
    events: List[ComplaintEvent] = []
