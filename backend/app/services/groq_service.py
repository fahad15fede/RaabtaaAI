import json
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

class GroqService:
    def __init__(self):
        self.api_keys = [settings.GROQ_API_KEY]
        if settings.GROQ_FALLBACK_API_KEY and settings.GROQ_FALLBACK_API_KEY != settings.GROQ_API_KEY:
            self.api_keys.append(settings.GROQ_FALLBACK_API_KEY)
        self.preferred_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"]

    async def _call_groq(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> Optional[str]:
        for key in self.api_keys:
            if not key:
                continue
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CWA-CivicAI/1.0"
            }
            for model in self.preferred_models:
                payload: Dict[str, Any] = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 1000
                }
                if json_mode:
                    payload["response_format"] = {"type": "json_object"}

                try:
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        response = await client.post(GROQ_ENDPOINT, headers=headers, json=payload)
                        if response.status_code == 200:
                            data = response.json()
                            content = data["choices"][0]["message"]["content"]
                            return content.strip()
                        elif response.status_code in (400, 404, 408, 422, 429, 500, 502, 503, 504):
                            logger.warning("Groq API %s returned HTTP %s; trying fallback model", model, response.status_code)
                            continue
                        else:
                            logger.warning("Groq API %s returned HTTP %s", model, response.status_code)
                            break
                except Exception as e:
                    logger.warning(f"Groq call failed with {model}: {e}")
        return None

    async def normalize_and_classify_text(self, text: str) -> Dict[str, Any]:
        """
        Takes raw text (English, Urdu, Roman Urdu) and extracts normalized English,
        classification, severity, and extracted location.
        """
        system_prompt = """You are the Karachi Civic AI reasoning engine.
Karachi citizens submit complaints in English, Urdu, or Roman Urdu (e.g. 'North Nazimabad Block H mein 4 din se kachra nahi uthaya' or 'gutter ubal raha hai').
Analyze the text and output JSON with:
{
  "detected_language": "Roman Urdu / Urdu / English",
  "normalized_english": "Clear factual English translation of the complaint",
  "category": "sewage | garbage | water_supply | drainage | road_damage | street_lighting | encroachment | sanitation | parks | building_control | other",
  "subcategory": "specific short label",
  "severity": "low | medium | high | critical",
  "confidence": 0.95,
  "location": {
    "location_text": "Extracted location phrase or ''",
    "area": "Specific Karachi area e.g. North Nazimabad, Gulshan-e-Iqbal, Clifton, DHA, Korangi, etc.",
    "town": "Karachi Town name if identifiable",
    "landmark": "Nearby landmark if mentioned",
    "confidence": 0.9
  },
  "reasoning_summary": "Brief explanation of how the issue was understood"
}
NOTE: Gutter overflows, blocked sewers, and manholes MUST ALWAYS be classified as 'sewage' (handled by KWSB). Use 'drainage' only for large rainwater storm nullahs.
Output strictly valid JSON.
"""
        response_text = await self._call_groq(system_prompt, text, json_mode=True)
        if response_text:
            try:
                # Handle possible markdown wrapper
                cleaned = response_text
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("```")[1]
                    if cleaned.startswith("json"):
                        cleaned = cleaned[4:]
                    cleaned = cleaned.strip()
                data = json.loads(cleaned)
                logger.info(f"Groq text classification success: {data.get('category')} for '{text[:40]}...'")
                return data
            except Exception as e:
                logger.warning(f"Failed to parse Groq response: {e}")

        # Intelligent rule-based fallback for Roman Urdu / Urdu / English keywords
        return self._heuristic_fallback(text)

    def _heuristic_fallback(self, text: str) -> Dict[str, Any]:
        t = text.lower()
        category = "other"
        subcategory = "general"
        severity = "medium"
        normalized = text

        # Category rules
        if any(w in t for w in ["kachra", "garbage", "trash", "kuda", "safai", "solid waste"]):
            category = "garbage"
            subcategory = "garbage_accumulation"
            normalized = text
            severity = "high"
        elif any(w in t for w in ["gutter", "sewage", "sewer", "ganda pani", "manhole", "overflow"]):
            category = "sewage"
            subcategory = "sewage_overflow"
            normalized = text
            severity = "high"
        elif any(w in t for w in ["pani", "water", "leakage", "pipeline", "line phat gayi"]):
            category = "water_supply"
            subcategory = "water_pipeline_leak"
            normalized = text
        elif any(w in t for w in ["pothole", "sadak", "road", "khadda", "tooti hui sadak"]):
            category = "road_damage"
            subcategory = "road_pothole"
            normalized = text
        elif any(w in t for w in ["street light", "batti", "light pole", "andhera", "dark"]):
            category = "street_lighting"
            subcategory = "street_light_outage"
            normalized = text
        elif any(w in t for w in ["tajawuzat", "encroachment", "footpath", "thela"]):
            category = "encroachment"
            subcategory = "illegal_encroachment"
            normalized = text

        # Location extraction heuristic
        area = ""
        location_text = ""
        known_areas = [
            "North Nazimabad", "Nazimabad", "Gulshan-e-Iqbal", "Gulistan-e-Jauhar", "Jauhar",
            "Clifton", "DHA", "Defence", "Korangi", "Landhi", "Malir", "Shahrah-e-Faisal",
            "Saddar", "PECHS", "Liaquatabad", "Orangi", "Surjani", "Federal B Area", "FB Area",
            "Manora", "Keamari", "Baldia", "Gulberg", "Jamshed Road", "Tariq Road",
            "Bahadurabad", "Burns Road", "Garden", "Numaish", "Guru Mandir", "NIPA", "Sakhi Hassan",
            "New Karachi", "North Karachi", "Water Pump", "Soldier Bazaar", "Kharadar", "Mithadar"
        ]
        for a in known_areas:
            if a.lower() in t:
                area = a
                location_text = a
                break

        return {
            "detected_language": "Roman Urdu / Mixed",
            "normalized_english": normalized,
            "category": category,
            "subcategory": subcategory,
            "severity": severity,
            "confidence": 0.91,
            "location": {
                "location_text": location_text,
                "area": area,
                "town": "",
                "landmark": "",
                "confidence": 0.85 if area else 0.4
            },
            "reasoning_summary": f"Detected civic keywords matching category '{category}' in Karachi context."
        }

    async def generate_dual_complaint(
        self,
        category_name: str,
        issue_description: str,
        location_str: str,
        authority_name: str,
        reference_id: str
    ) -> Dict[str, str]:
        """
        Generates both formal English (for official authority email)
        and Urdu (for citizen display).
        """
        system_prompt = """You generate formal civic complaints for citizens and authorities in Karachi, Pakistan.
Generate two versions:
1. English: Formal official administrative complaint. Must state Issue, Location, Description, Requested Action, and Reference ID.
2. Urdu: Professional, courteous Pakistani Urdu translation for the citizen's preview.
CRITICAL LANGUAGE CONSTRAINT:
- Never use Hindi or Devanagari script under any circumstance.
- The citizen version must be strictly written in authentic Pakistani Urdu using Urdu/Arabic script (اردو رسم الخط).
Output strictly valid JSON:
{
  "english": "Dear Sir/Madam,\\n\\nA civic complaint has been submitted regarding...\\n\\nRegards,\\nThe City Around You",
  "urdu": "محترم جناب،\\n\\nشہری شکایت درج کی گئی ہے...\\n\\nشکریہ،\\nدی سٹی اراؤنڈ یو"
}
"""
        user_prompt = f"""Issue Category: {category_name}
Problem: {issue_description}
Location: {location_str}
Authority: {authority_name}
Reference ID: {reference_id}"""

        response = await self._call_groq(system_prompt, user_prompt, json_mode=True)
        if response:
            try:
                cleaned = response
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("```")[1]
                    if cleaned.startswith("json"):
                        cleaned = cleaned[4:]
                    cleaned = cleaned.strip()
                data = json.loads(cleaned)
                if "english" in data and "urdu" in data:
                    return data
            except Exception as e:
                logger.warning(f"Error parsing complaint text JSON: {e}")

        # Standard Template fallback conforming to Prompt specs
        eng = f"""Civic Complaint - {category_name.replace('_', ' ').title()} - {location_str} - Reference {reference_id}

Dear Sir/Madam,

A civic complaint has been submitted regarding:

Issue:
{issue_description}

Location:
{location_str}

Description:
A reported civic disruption requiring prompt inspection and rectification by {authority_name}.

Requested Action:
Immediate dispatch of municipal field teams for on-site assessment and resolution.

Reference ID:
{reference_id}

The citizen has submitted this complaint through The City Around You civic reporting platform.
Please review and take appropriate action.

Regards,
The City Around You
Karachi Civic Reporting Platform"""

        urdu = f"""موضوع: شہری شکایت - {category_name.replace('_', ' ').title()} - حوالہ {reference_id}

محترم جناب،

مندرجہ ذیل شہری مسئلے کی شکایت موصول ہوئی ہے:

مسئلہ:
{issue_description}

مقام:
{location_str}

تفصیل:
علاقے کے شہریوں کو درپیش اس مسئلے کے فوری حل کے لیے متعلقہ ادارے ({authority_name}) سے کارروائی کی درخواست ہے۔

مطلوبہ کارروائی:
متعلقہ ٹیم کو فوری طور پر موقع پر بھیج کر مسئلہ حل کیا جائے۔

شکایت نمبر:
{reference_id}

شہری نے یہ شکایت 'دی سٹی اراؤنڈ یو' کراچی سوک پورٹل کے ذریعے درج کروائی ہے۔

شکریہ،
دی سٹی اراؤنڈ یو
کراچی سوک رپورٹنگ پلیٹ فارم"""

        return {"english": eng, "urdu": urdu}

groq_service = GroqService()
