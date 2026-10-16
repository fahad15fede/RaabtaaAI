import base64
import binascii
from pathlib import PurePath
import httpx
from fastapi import HTTPException
from typing import Optional
from app.core.config import settings
from app.core.logging import logger

class WhisperService:
    MIME_TYPES = {
        ".webm": "audio/webm",
        ".wav": "audio/wav",
        ".mp3": "audio/mpeg",
        ".mpeg": "audio/mpeg",
        ".mpga": "audio/mpeg",
        ".m4a": "audio/mp4",
        ".mp4": "audio/mp4",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
    }
    EXTENSIONS = {
        "audio/webm": ".webm",
        "audio/wav": ".wav",
        "audio/x-wav": ".wav",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".m4a",
        "audio/ogg": ".ogg",
        "audio/flac": ".flac",
    }

    def __init__(self):
        self.api_keys = [settings.GROQ_API_KEY]
        if settings.GROQ_FALLBACK_API_KEY:
            self.api_keys.append(settings.GROQ_FALLBACK_API_KEY)
        self.endpoint = "https://api.groq.com/openai/v1/audio/transcriptions"

    async def transcribe_audio(self, audio_data: bytes, filename: str = "recording.webm") -> Optional[str]:
        """
        Sends audio bytes to Groq Whisper Large v3 for multilingual transcription
        (Urdu, English, Roman Urdu).
        """
        if not any(self.api_keys):
            raise HTTPException(status_code=503, detail="Voice transcription is not configured. Set GROQ_API_KEY.")

        if len(audio_data) > 24 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Voice recording is too large. Please record a shorter message.")
        mime_type = self.MIME_TYPES.get(PurePath(filename).suffix.lower(), "audio/webm")
        last_status = None
        for key in self.api_keys:
            if not key:
                continue
            headers = {
                "Authorization": f"Bearer {key}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CWA-CivicAI/1.0"
            }
            try:
                files = {
                    "file": (filename, audio_data, mime_type),
                    "model": (None, "whisper-large-v3"),
                    "temperature": (None, "0"),
                    "response_format": (None, "json"),
                    "prompt": (
                        None,
                        "Transcribe a civic issue report from Karachi. The speaker may use English, Urdu, or Roman Urdu. "
                        "Common terms include kachra, gutter, sewer, pani, pipe, sadak, khadda, street light, "
                        "North Nazimabad, Gulshan-e-Iqbal, Clifton, Korangi, and DHA. Preserve the spoken words.",
                    ),
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(self.endpoint, headers=headers, files=files)
                    if response.status_code == 200:
                        data = response.json()
                        text = data.get("text", "").strip()
                        logger.info("Whisper transcription completed")
                        if not text:
                            raise HTTPException(status_code=422, detail="No speech was recognized. Please speak clearly and retry.")
                        return text
                    else:
                        last_status = response.status_code
                        logger.warning("Groq Whisper returned HTTP %s: %s", response.status_code, response.text[:400])
            except HTTPException:
                raise
            except Exception as e:
                logger.warning("Groq Whisper call failed: %s", type(e).__name__)

        if last_status in (401, 403):
            raise HTTPException(status_code=503, detail="Voice provider authentication failed. Check the Groq API key.")
        if last_status == 429:
            raise HTTPException(status_code=503, detail="Voice transcription rate limit reached. Please retry later.")
        if last_status == 413:
            raise HTTPException(status_code=413, detail="Audio exceeds the transcription provider size limit.")
        raise HTTPException(status_code=503, detail=f"Voice transcription failed (provider HTTP {last_status}). Check backend logs.")

    async def transcribe_base64(self, audio_base64: str) -> Optional[str]:
        filename = "recording.webm"
        if "," in audio_base64:
            header, audio_base64 = audio_base64.split(",", 1)
            mime_type = header[5:].split(";", 1)[0].lower() if header.startswith("data:") else ""
            extension = self.EXTENSIONS.get(mime_type)
            if extension:
                filename = f"recording{extension}"
        try:
            raw_bytes = base64.b64decode(audio_base64, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise HTTPException(status_code=422, detail="Invalid audio encoding.") from exc
        if not raw_bytes:
            raise HTTPException(status_code=422, detail="Audio recording is empty.")
        return await self.transcribe_audio(raw_bytes, filename=filename)

whisper_service = WhisperService()
