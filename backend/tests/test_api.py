import base64
import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.gemini_service import GeminiService
from app.services.whisper_service import WhisperService


@pytest.mark.asyncio
async def test_gemini_falls_back_to_available_model(monkeypatch):
    calls = []
    result = {
        "category": "road_damage",
        "visible_problem": "A large pothole is visible in the road surface.",
        "severity": "high",
        "confidence": 0.9,
        "reasoning": "The road surface has a visible depression.",
    }

    class FakeResponse:
        def __init__(self, status_code, body):
            self.status_code = status_code
            self.body = body
            self.is_error = status_code >= 400

        def json(self):
            return self.body

    class FakeClient:
        def __init__(self, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def post(self, url, **kwargs):
            calls.append(url)
            if len(calls) == 1:
                return FakeResponse(503, {})
            return FakeResponse(200, {"candidates": [{"content": {"parts": [{"text": json.dumps(result)}]}}]})

    monkeypatch.setattr("app.services.gemini_service.httpx.AsyncClient", FakeClient)
    service = GeminiService()
    service.api_key = "test-key"

    response = await service.analyze_image(base64.b64encode(b"test image").decode(), "image/png")

    assert response["category"] == "road_damage"
    assert len(calls) == 2
    assert "gemini-3.6-flash" in calls[0]
    assert "gemini-3.8-flash" in calls[1]


@pytest.mark.asyncio
async def test_whisper_preserves_audio_data_uri_format(monkeypatch):
    service = WhisperService()
    captured = {}

    async def fake_transcribe(audio_data, filename="recording.webm"):
        captured["audio_data"] = audio_data
        captured["filename"] = filename
        return "transcribed audio"

    monkeypatch.setattr(service, "transcribe_audio", fake_transcribe)
    encoded_audio = base64.b64encode(b"test audio").decode()

    result = await service.transcribe_base64(f"data:audio/mp4;codecs=mp4a.40.2;base64,{encoded_audio}")

    assert result == "transcribed audio"
    assert captured["audio_data"] == b"test audio"
    assert captured["filename"] == "recording.m4a"


@pytest.mark.asyncio
async def test_voice_rejects_unusable_short_transcript(monkeypatch):
    async def fake_transcribe(_audio_base64):
        return "you"

    monkeypatch.setattr("app.api.routes.complaints.whisper_service.transcribe_base64", fake_transcribe)
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/complaints/analyze",
            json={"input_type": "voice", "audio_base64": "data:audio/webm;base64,dGVzdA=="},
        )

    assert response.status_code == 422
    assert "very short phrase" in response.json()["detail"]

@pytest.mark.asyncio
async def test_api_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Karachi Civic AI" in data["app"]

@pytest.mark.asyncio
async def test_api_authorities_and_categories():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        auth_resp = await ac.get("/api/authorities")
        cat_resp = await ac.get("/api/categories")
    assert auth_resp.status_code == 200
    assert len(auth_resp.json()) >= 9
    assert cat_resp.status_code == 200
    assert len(cat_resp.json()) == 14

@pytest.mark.asyncio
async def test_api_analyze_and_send_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Submit a Roman Urdu sewage complaint
        payload = {
            "input_type": "text",
            "text": "North Nazimabad Block H main gutter ka ganda pani sadak par beh raha hai",
            "area": "North Nazimabad"
        }
        res = await ac.post("/api/complaints/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "complaint_id" in data
        assert data["classification"]["category"] in ["sewage", "drainage"]
        assert data["authority"]["short_name"] in ["KWSB", "KMC"]
        assert "@" in data["authority"]["email"]
        assert data["reference_id"].startswith("CWA-")
        c_id = data["complaint_id"]

        c_id = data["complaint_id"]

        # Fetch complaint details
        get_res = await ac.get(f"/api/complaints/{c_id}")
        assert get_res.status_code == 200
        detail = get_res.json()
        assert detail["id"] == c_id
        assert len(detail["events"]) >= 5

@pytest.mark.asyncio
async def test_my_complaints_and_delete_rules():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        headers_user_a = {"X-User-ID": "user-test-a"}
        headers_user_b = {"X-User-ID": "user-test-b"}

        # User A creates a complaint
        payload = {
            "input_type": "text",
            "text": "Broken streetlight in Clifton Block 5 near park",
            "user_id": "user-test-a"
        }
        res_a = await ac.post("/api/complaints/analyze", json=payload, headers=headers_user_a)
        assert res_a.status_code == 200
        c_id_a = res_a.json()["complaint_id"]

        # User A fetches my complaints
        my_res_a = await ac.get("/api/complaints/my", headers=headers_user_a)
        assert my_res_a.status_code == 200
        ids_a = [c["id"] for c in my_res_a.json()]
        assert c_id_a in ids_a

        # User B fetches my complaints -> should NOT see User A's complaint
        my_res_b = await ac.get("/api/complaints/my", headers=headers_user_b)
        assert my_res_b.status_code == 200
        ids_b = [c["id"] for c in my_res_b.json()]
        assert c_id_a not in ids_b

        # User B attempts to delete User A's complaint -> Forbidden 403
        del_b = await ac.delete(f"/api/complaints/{c_id_a}", headers=headers_user_b)
        assert del_b.status_code == 403

        # User A deletes their unsent complaint -> Success 200
        del_a = await ac.delete(f"/api/complaints/{c_id_a}", headers=headers_user_a)
        assert del_a.status_code == 200
        assert del_a.json()["success"] is True

        # User A creates another complaint and dispatches/sends it
        res_a2 = await ac.post("/api/complaints/analyze", json=payload, headers=headers_user_a)
        c_id_a2 = res_a2.json()["complaint_id"]
        send_res = await ac.post(f"/api/complaints/{c_id_a2}/send")
        assert send_res.status_code == 200

        # User A attempts to delete dispatched complaint -> Bad Request 400
        del_a2 = await ac.delete(f"/api/complaints/{c_id_a2}", headers=headers_user_a)
        assert del_a2.status_code == 400
        assert "already been sent" in del_a2.json()["detail"]

@pytest.mark.asyncio
async def test_nearby_2000m_filtering():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Request nearby problems with default 2000m radius
        res = await ac.get("/api/nearby/problems?latitude=24.9333&longitude=66.9833&radius=2000")
        assert res.status_code == 200
        problems = res.json()
        assert isinstance(problems, list)
        for p in problems:
            assert p["distance_m"] <= 2000
            # Ensure private reporter information is sanitized
            assert "user_id" not in p
            assert "email" not in p
