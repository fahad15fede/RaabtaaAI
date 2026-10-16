from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": "The City Around You - Karachi Civic AI",
        "version": "1.0.0",
        "ai_providers": {
            "gemini": bool(settings.GEMINI_API_KEY),
            "groq": bool(settings.GROQ_API_KEY),
            "smtp": bool(settings.SMTP_USERNAME and settings.SMTP_HOST)
        }
    }

@router.post("/test-email")
def test_email(to_email: str = None):
    from app.services.email_service import send_smtp_message
    recipient = to_email or settings.SMTP_USERNAME
    if not recipient:
        return {"success": False, "message": "No recipient or SMTP_USERNAME configured"}
    
    subject = "Karachi Civic AI - SMTP Test Email"
    body = (
        "Hello,\n\n"
        "This is a test message from The City Around You (Karachi Civic AI).\n"
        "Your Gmail SMTP connection is operational.\n\n"
        "Regards,\nThe City Around You"
    )
    
    try:
        ok = send_smtp_message(to_email=recipient, subject=subject, body=body)
        if ok:
            return {"success": True, "message": f"Test email sent successfully to {recipient}"}
        else:
            return {
                "success": False,
                "message": "SMTP credentials not configured or placeholder detected. Please set your 16-character Gmail App Password in backend/.env"
            }
    except Exception as e:
        return {"success": False, "error": str(e)}

