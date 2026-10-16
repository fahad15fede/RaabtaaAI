import pytest
from app.services.routing_service import routing_service
from app.services.location_service import location_service
from app.services.duplicate_service import duplicate_service
from app.services.email_service import email_service
from app.repositories.complaint_repository import complaint_repo
from app.repositories.authority_repository import authority_repo
from app.schemas.complaint import LocationInfo

def test_authorities_and_categories_seeded():
    authorities = authority_repo.get_all_authorities()
    assert len(authorities) >= 9

    # Check SSWMB has no email configured per prompt instruction
    sswmb = authority_repo.get_authority_by_short_name("SSWMB")
    assert sswmb is not None
    assert sswmb["email"] is None
    assert sswmb["phone"] == "+92 3181030851"

    # Check KWSB email
    kwsb = authority_repo.get_authority_by_short_name("KWSB")
    assert kwsb is not None
    assert kwsb["email"] == "info@kwsc.gos.pk"

    # Check KMC email
    kmc = authority_repo.get_authority_by_short_name("KMC")
    assert kmc is not None
    assert kmc["email"] == "mayor@kmc.gos.pk"

    # Check Cantonment boards
    cbc = authority_repo.get_authority_by_short_name("CBC")
    assert cbc["email"] == "info@cbc.gov.pk"

    categories = authority_repo.get_all_categories()
    assert len(categories) == 14

def test_routing_engine():
    # 1. Sewage -> KWSB
    r1 = routing_service.route_complaint(category="sewage", area="North Nazimabad")
    assert r1.short_name == "KWSB"
    assert r1.email == "info@kwsc.gos.pk"
    assert r1.email_configured is True

    # 2. Garbage -> SSWMB
    r2 = routing_service.route_complaint(category="garbage", area="Gulshan-e-Iqbal")
    assert r2.short_name == "SSWMB"
    assert r2.email is None
    assert r2.email_configured is False

    # 3. Clifton / DHA issue -> CBC
    r3 = routing_service.route_complaint(category="road_damage", area="DHA Phase 6")
    assert r3.short_name == "CBC"
    assert r3.email == "info@cbc.gov.pk"

    # 4. Main artery / Shahrah-e-Faisal road -> KMC
    r4 = routing_service.route_complaint(category="road_damage", location_text="Shahrah-e-Faisal near Nursery bridge")
    assert r4.short_name == "KMC"
    assert r4.email == "mayor@kmc.gos.pk"

    # 5. Local street pothole in residential town -> Town Admin
    r5 = routing_service.route_complaint(category="road_damage", area="Nazimabad internal street")
    assert r5.short_name == "Town Admin"

def test_location_priority():
    # Manual selection must take priority over browser and text
    loc = location_service.resolve_location(
        manual_lat=24.8211,
        manual_lon=67.0321,
        browser_lat=24.9333,
        browser_lon=67.0392,
        extracted_area="North Nazimabad"
    )
    assert loc.location_source in ["manual", "map"]
    assert loc.latitude == 24.8211

    # Text extraction when no GPS
    loc_text = location_service.resolve_location(extracted_area="North Nazimabad")
    assert loc_text.location_source == "text"
    assert "North Nazimabad" in loc_text.address

def test_duplicate_detection():
    # Insert test complaint
    test_c = {
        "id": "dup-test-1",
        "reference_id": "CWA-TEST-001",
        "category": "sewage",
        "created_at": "2026-09-12T00:00:00",
        "location": {"latitude": 24.9333, "longitude": 67.0392, "area": "North Nazimabad"},
        "report_count": 1
    }
    complaint_repo.create(test_c)

    # Nearby complaint with same category (within 200m)
    dup = duplicate_service.check_duplicate(
        category="sewage",
        latitude=24.9335,
        longitude=67.0393
    )
    assert dup.is_duplicate is True
    assert dup.duplicate_of is not None

    # Different category at same coordinates
    no_dup = duplicate_service.check_duplicate(
        category="street_lighting",
        latitude=24.9335,
        longitude=67.0393
    )
    assert no_dup.is_duplicate is False

@pytest.mark.asyncio
async def test_email_pending_for_missing_authority_email():
    # Create complaint routed to SSWMB (which has no email)
    c_data = {
        "id": "sswmb-test-c",
        "reference_id": "CWA-20260912-999",
        "category": "garbage",
        "authority": {
            "name": "Sindh Solid Waste Management Board",
            "short_name": "SSWMB",
            "email": None,
            "phone": "+92 3181030851"
        },
        "status": "ready",
        "location": {"address": "Gulshan-e-Iqbal, Karachi"}
    }
    complaint_repo.create(c_data)

    res = await email_service.send_complaint_email("sswmb-test-c")
    assert res["success"] is False
    assert res["status"] == "email_pending"
    assert "an email contact is not currently configured" in res["message"].lower()
    # Check repository state was updated to email_pending
    stored = complaint_repo.get_by_id("sswmb-test-c")
    assert stored["status"] == "email_pending"
