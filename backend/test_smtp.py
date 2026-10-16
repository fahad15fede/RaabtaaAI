import os
import sys
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Load backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def test_smtp_connection(recipient: str = None):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME", "shahmanjamal9@gmail.com")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    email_from = os.getenv("EMAIL_FROM", smtp_username)
    email_from_name = os.getenv("EMAIL_FROM_NAME", "The City Around You")

    print("=" * 60)
    print(" Karachi Civic AI - Gmail SMTP Diagnostic Tool")
    print("=" * 60)
    print(f"SMTP Host:     {smtp_host}")
    print(f"SMTP Port:     {smtp_port}")
    print(f"SMTP Username: {smtp_username}")
    print(f"From Address:  {email_from_name} <{email_from}>")
    print(f"Password Set:  {'YES (Length: ' + str(len(smtp_password)) + ')' if smtp_password and smtp_password != 'YOUR_GMAIL_APP_PASSWORD' else 'NO / PLACEHOLDER'}")
    print("-" * 60)

    if not smtp_password or smtp_password == "YOUR_GMAIL_APP_PASSWORD":
        print("\n[!] WARNING: SMTP_PASSWORD is not set or still contains 'YOUR_GMAIL_APP_PASSWORD'.")
        print("To generate your Gmail App Password:")
        print("1. Go to your Google Account (https://myaccount.google.com/)")
        print("2. Ensure 2-Step Verification is turned ON.")
        print("3. Search for 'App passwords' or visit https://myaccount.google.com/apppasswords")
        print("4. Name it 'Civic App' and click 'Create'.")
        print("5. Copy the 16-character code (e.g. 'abcd efgh ijkl mnop') and paste it into backend/.env as:")
        print("   SMTP_PASSWORD=abcdefghijklmnop\n")
        return False

    target = recipient or smtp_username
    print(f"Attempting SMTP STARTTLS handshake with {smtp_host}:{smtp_port}...")
    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.set_debuglevel(1)
            print("Connecting & starting TLS...")
            server.starttls()
            print("Authenticating with Gmail...")
            server.login(smtp_username, smtp_password)
            print("\n[OK] SUCCESS: SMTP Authentication successful!")

            # Prepare test message
            msg = EmailMessage()
            msg["From"] = f"{email_from_name} <{email_from}>"
            msg["To"] = target
            msg["Subject"] = "Karachi Civic AI - SMTP Test Verification"
            msg.set_content(
                "Hello!\n\nThis is an automated test message from The City Around You (Karachi Civic AI).\n"
                "Your Gmail SMTP host configuration is active and working properly!\n\n"
                "Official civic complaint emails will be dispatched to responsible municipal authorities using this connection.\n\n"
                "Regards,\nThe City Around You Team"
            )
            print(f"Sending test email to {target}...")
            server.send_message(msg)
            print(f"\n[OK] SUCCESS: Test email delivered to {target}!")
            return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"\n[X] AUTHENTICATION FAILED: {e}")
        print("Make sure you are using a 16-character Google App Password, NOT your regular Gmail account password.")
        print("Generate it at: https://myaccount.google.com/apppasswords")
        return False
    except Exception as e:
        print(f"\n[X] SMTP ERROR: {e}")
        return False

if __name__ == "__main__":
    to = sys.argv[1] if len(sys.argv) > 1 else None
    test_smtp_connection(to)
