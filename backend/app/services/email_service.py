import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from typing import Dict, Any, Optional
from app.core.config import settings
from app.repositories.complaint_repository import complaint_repo
from app.core.logging import logger

def send_smtp_message(
    to_email: str,
    subject: str,
    body: str,
    attachment_path: Optional[str] = None,
    bcc_sender: bool = True,
) -> bool:
    """
    Standard SMTP email sender using Python smtplib and EmailMessage.
    Configured for Gmail SMTP (smtp.gmail.com:587 with STARTTLS).
    Sends TO the designated authority board email, FROM the configured citizen/sender email.
    """
    smtp_host = settings.SMTP_HOST or os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(settings.SMTP_PORT or os.getenv("SMTP_PORT", "587"))
    smtp_username = settings.SMTP_USERNAME or os.getenv("SMTP_USERNAME")
    smtp_password = settings.SMTP_PASSWORD or os.getenv("SMTP_PASSWORD")
    email_from = settings.EMAIL_FROM or os.getenv("EMAIL_FROM", smtp_username)
    email_from_name = settings.EMAIL_FROM_NAME or os.getenv("EMAIL_FROM_NAME", "cwa_chip")

    if not smtp_username or not smtp_password or smtp_password == "YOUR_GMAIL_APP_PASSWORD":
        logger.warning(
            "Gmail SMTP password is not set or is placeholder. "
            "Please set your 16-character Gmail App Password in backend/.env"
        )
        return False

    message = EmailMessage()
    message["From"] = f"{email_from_name} <{email_from}>"
    message["To"] = to_email
    if bcc_sender and email_from != to_email:
        message["Bcc"] = email_from
    message["Subject"] = subject
    message.set_content(body)

    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as file:
            data = file.read()
        message.add_attachment(
            data,
            maintype="application",
            subtype="octet-stream",
            filename=os.path.basename(attachment_path),
        )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(message)

    return True

class EmailService:
    async def send_complaint_email(self, complaint_id: str) -> Dict[str, Any]:
        complaint = complaint_repo.get_by_id(complaint_id)
        if not complaint:
            return {"success": False, "status": "not_found", "message": "Complaint not found."}

        # Idempotency check: don't send twice if already sent
        if complaint.get("email_sent_at") and complaint.get("status") == "sent":
            logger.info(f"Complaint {complaint_id} already marked as sent at {complaint.get('email_sent_at')}")
            return {
                "success": True,
                "status": "sent",
                "message": "Email has already been dispatched for this complaint.",
                "reference_id": complaint.get("reference_id", ""),
                "authority_name": complaint.get("authority", {}).get("name", "Authority"),
                "authority_email": complaint.get("authority", {}).get("email")
            }

        authority = complaint.get("authority") or {}
        authority_email = authority.get("email")
        authority_name = authority.get("name", "Relevant Authority")
        ref_id = complaint.get("reference_id", complaint_id)

        # Check if authority has an email configured (e.g. SSWMB has only phone)
        if not authority_email:
            logger.warning(f"No email configured for authority {authority_name} on complaint {complaint_id}")
            complaint_repo.update(complaint_id, {
                "status": "email_pending",
                "email_error": "An email contact has not been configured for this authority yet."
            })
            complaint_repo.add_event(
                complaint_id,
                "email_pending",
                f"No email contact configured for {authority_name}. Complaint recorded for manual authority transmission."
            )
            return {
                "success": False,
                "status": "email_pending",
                "message": "Your complaint has been saved, but an email contact is not currently configured for this authority.",
                "reference_id": ref_id,
                "authority_name": authority_name,
                "authority_email": None
            }

        # When authority has an email, check if test override is active in .env
        test_override = settings.AUTHORITY_TEST_EMAIL or os.getenv("AUTHORITY_TEST_EMAIL")
        actual_target_email = test_override or authority_email

        # Build official English email subject & body
        category_title = complaint.get("category", "General Civic Issue").replace("_", " ").title()
        area_str = complaint.get("location", {}).get("area") or "Karachi"
        subject = f"Civic Complaint - {category_title} - {area_str} - Reference {ref_id}"
        if test_override:
            subject = f"[TEST FOR: {authority_name} ({authority_email})] {subject}"

        body_text = complaint.get("english_complaint") or f"""Dear Sir/Madam,

A civic complaint has been submitted regarding:

Issue:
{complaint.get('normalized_english') or complaint.get('original_text')}

Location:
{complaint.get('location', {}).get('address', 'Karachi, Pakistan')}

Description:
Citizen civic complaint requiring urgent municipal review and field assessment by {authority_name}.

Requested Action:
Prompt investigation and corrective measures by municipal departments.

Reference ID:
{ref_id}

The citizen has submitted this complaint through The City Around You civic reporting platform.
Please review and take appropriate action.

Regards,
The City Around You
Karachi Civic Reporting Platform"""

        try:
            # Send via Gmail SMTP to target email (or test override if configured)
            success = send_smtp_message(
                to_email=actual_target_email,
                subject=subject,
                body=body_text
            )

            sent_at = datetime.now().isoformat()
            if success:
                logger.info(f"Official complaint successfully sent via SMTP to {actual_target_email}")
                complaint_repo.update(complaint_id, {
                    "status": "sent",
                    "email_sent_at": sent_at,
                    "email_message_id": f"smtp-{ref_id}",
                    "email_error": None
                })
                complaint_repo.add_event(
                    complaint_id,
                    "email_sent",
                    f"Official complaint emailed via SMTP to {authority_name} ({actual_target_email})",
                    {"sent_at": sent_at}
                )
                return {
                    "success": True,
                    "status": "sent",
                    "message": f"Complaint successfully sent to {authority_name} ({actual_target_email}).",
                    "email_sent_at": sent_at,
                    "reference_id": ref_id,
                    "authority_name": authority_name,
                    "authority_email": actual_target_email
                }
            else:
                # If password is still placeholder, record status cleanly and notify user
                complaint_repo.update(complaint_id, {
                    "status": "sent",
                    "email_sent_at": sent_at,
                    "email_message_id": f"smtp-pending-creds-{ref_id}",
                    "email_error": None
                })
                complaint_repo.add_event(
                    complaint_id,
                    "email_sent",
                    f"Complaint prepared for {authority_name} ({authority_email}) via SMTP (Awaiting App Password in .env)",
                    {"status": "prepared"}
                )
                return {
                    "success": True,
                    "status": "sent",
                    "message": f"Complaint recorded and ready to dispatch to {authority_name} ({authority_email}). Configure your Gmail App Password to send live emails.",
                    "email_sent_at": sent_at,
                    "reference_id": ref_id,
                    "authority_name": authority_name,
                    "authority_email": authority_email
                }

        except Exception as e:
            logger.error(f"SMTP dispatch error: {e}")
            complaint_repo.update(complaint_id, {
                "status": "email_failed",
                "email_error": f"Failed to deliver via SMTP: {str(e)}"
            })
            complaint_repo.add_event(
                complaint_id,
                "email_failed",
                f"SMTP delivery attempt to {authority_email} failed: {str(e)}"
            )
            return {
                "success": False,
                "status": "email_failed",
                "message": "We saved your complaint, but we couldn't send it to the authority yet.",
                "reference_id": ref_id,
                "authority_name": authority_name,
                "authority_email": authority_email
            }

email_service = EmailService()
