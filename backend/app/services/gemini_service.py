import base64
import json
import httpx
from fastapi import HTTPException
from typing import Dict, Any
from app.core.config import settings
from app.core.logging import logger

SYSTEM_PROMPT = """You are an objective, expert civic infrastructure inspector for Karachi, Pakistan.
Analyze the submitted image of an urban issue.
Rules:
1. Only identify observable facts visible in the image.
2. Do not hallucinate or guess details not visible.
3. Classify into one of these exact categories:
   - water_supply (burst pipes, clean water pooling, dry taps)
   - sewage (black/dirty overflowing wastewater, gutter overflow, open manhole)
   - garbage (accumulated trash, open dumpster overflow, uncollected solid waste)
   - drainage (blocked rainwater nullah, flooded storm drain)
   - road_damage (potholes, broken asphalt, sunken road surface)
   - street_lighting (broken light pole, dangling wires)
   - encroachment (illegal construction, footpath blocked by stalls)
   - sanitation (stagnant debris, hazardous public filth)
   - parks (broken park equipment, unmaintained public green belts)
    - fire_rescue (visible flames or an active fire affecting a building, vehicle, or public infrastructure)
   - other (other civic hazards)
4. Determine severity: 'low', 'medium', 'high', 'critical'.
5. Return strictly valid JSON with no markdown formatting around it:
{
  "category": "sewage",
  "subcategory": "gutter_overflow",
  "visible_problem": "Detailed factual description of what is visible",
  "severity": "high",
  "confidence": 0.94,
  "reasoning": "Factual basis"
}
"""

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        self.models = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-flash-lite-latest"]

    async def analyze_image(self, image_base64: str, mime_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Sends an image to Gemini API and extracts visual problem facts.
        """
        # Clean base64 header if present (e.g. data:image/jpeg;base64,...)
        if "," in image_base64:
            header, image_base64 = image_base64.split(",", 1)
            if "image/png" in header:
                mime_type = "image/png"
            elif "image/webp" in header:
                mime_type = "image/webp"

        if not self.api_key:
            raise HTTPException(status_code=503, detail="Image analysis is not configured. Set GEMINI_API_KEY.")

        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": self.api_key
        }

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": SYSTEM_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": image_base64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 1200,
                "responseMimeType": "application/json"
            }
        }

        allowed = {"water_supply", "sewage", "garbage", "drainage", "road_damage", "street_lighting", "encroachment", "sanitation", "parks", "fire_rescue", "building_control", "other"}
        last_error: Exception | None = None
        async with httpx.AsyncClient(timeout=40.0) as client:
            for model in self.models:
                try:
                    response = await client.post(
                        self.endpoint.format(model=model),
                        headers=headers,
                        json=payload,
                    )
                except httpx.HTTPError as exc:
                    last_error = exc
                    logger.warning("Gemini model %s request failed: %s", model, type(exc).__name__)
                    continue

                if response.status_code in {404, 408, 429, 500, 502, 503, 504}:
                    last_error = RuntimeError(f"Gemini model returned HTTP {response.status_code}")
                    logger.warning("Gemini model %s returned HTTP %s; trying fallback", model, response.status_code)
                    continue
                if response.status_code in {401, 403}:
                    raise HTTPException(status_code=503, detail="Image analysis credentials were rejected. Check GEMINI_API_KEY.")
                if response.is_error:
                    logger.warning("Gemini model %s returned HTTP %s", model, response.status_code)
                    raise HTTPException(status_code=503, detail="Image analysis request was rejected. Please retry later.")

                try:
                    data = response.json()
                    parts = data["candidates"][0]["content"]["parts"]
                    raw_text = "".join(part.get("text", "") for part in parts).strip()
                    if raw_text.startswith("```"):
                        raw_text = raw_text.split("```", 2)[1].removeprefix("json").strip()
                    parsed = json.loads(raw_text)
                    if parsed.get("category") not in allowed or not isinstance(parsed.get("visible_problem"), str) or len(parsed["visible_problem"].strip()) < 18:
                        raise ValueError("Image response missing valid category or visible evidence")
                    if parsed["category"] == "other" or float(parsed.get("confidence", 0)) < 0.65:
                        raise HTTPException(status_code=422, detail="The photograph does not clearly identify a supported civic issue. Add a description or upload a clearer image.")
                    if parsed.get("severity") not in {"low", "medium", "high", "critical"}:
                        raise ValueError("Invalid severity")
                    parsed["confidence"] = min(1.0, max(0.0, float(parsed.get("confidence", 0))))
                    return parsed
                except HTTPException:
                    raise
                except (KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
                    last_error = exc
                    logger.warning("Gemini model %s returned invalid image analysis: %s", model, type(exc).__name__)

        logger.warning("All Gemini image models failed: %s", type(last_error).__name__ if last_error else "unknown error")
        raise HTTPException(status_code=503, detail="Image analysis is temporarily unavailable. Please retry shortly.") from last_error


gemini_service = GeminiService()
