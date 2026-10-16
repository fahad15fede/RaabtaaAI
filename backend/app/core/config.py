from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=ENV_FILE)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    # App
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    FRONTEND_URL: str = "http://localhost:5173"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # AI Keys
    GROQ_API_KEY: str = ""
    GROQ_FALLBACK_API_KEY: Optional[str] = None
    GEMINI_API_KEY: str = ""
 
    # Gmail SMTP Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    EMAIL_FROM_NAME: str = "The City Around You"
    SMTP_USE_TLS: bool = True
    AUTHORITY_TEST_EMAIL: Optional[str] = None

    # Geocoding
    GEOCODING_API_KEY: Optional[str] = None

settings = Settings()
