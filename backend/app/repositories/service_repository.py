import uuid
import math
from datetime import datetime
from typing import List, Dict, Optional, Any
from supabase import create_client
from app.core.config import settings
from app.core.logging import logger

DEMO_SERVICES: List[Dict[str, Any]] = [
    {
        "id": "d1000000-0000-0000-0000-000000000001",
        "category_id": "c2000000-0000-0000-0000-000000000001",
        "category_name": "water_tankers",
        "authority_id": "22222222-2222-2222-2222-222222222222",
        "authority_name": "Karachi Water & Sewerage Corporation",
        "title": "KWSC Sakhi Hassan Water Hydrant Tanker",
        "slug": "kwsc-sakhi-hassan-tanker",
        "service_type": "water_tanker",
        "description": "Official Karachi Water & Sewerage Corporation emergency water tanker supply service serving Central & North districts.",
        "price_amount": 1800,
        "price_currency": "PKR",
        "price_unit": "1000 Gallons",
        "price_verified": True,
        "contact_phone": "+92 21 99245138",
        "contact_email": "info@kwsc.gos.pk",
        "contact_verified": True,
        "source_url": "https://kwsc.gos.pk",
        "source_type": "official",
        "last_verified_at": "2026-09-01T00:00:00Z",
        "required_documents": ["Computerized National Identity Card (CNIC)", "Utility Bill / Consumer No."],
        "procedure_steps": [
            "Submit online or phone request at KWSC Hydrant Cell",
            "Provide consumer account number or residential location",
            "Driver dispatched with official KWSC challan",
            "Payment upon delivery against official KWSC receipt"
        ],
        "processing_time": "2 to 6 hours",
        "availability_status": "available",
        "latitude": 24.9333,
        "longitude": 66.9833,
        "area": "North Nazimabad, Karachi"
    },
    {
        "id": "d1000000-0000-0000-0000-000000000002",
        "category_id": "c2000000-0000-0000-0000-000000000002",
        "category_name": "water_connections",
        "authority_id": "22222222-2222-2222-2222-222222222222",
        "authority_name": "Karachi Water & Sewerage Corporation",
        "title": "KWSC New Residential Water Line Connection",
        "slug": "kwsc-new-water-connection",
        "service_type": "water_connection",
        "description": "Formal process to apply for a new residential main water connection pipeline from Karachi Water & Sewerage Corporation.",
        "price_amount": None,
        "price_currency": "PKR",
        "price_unit": "Based on property plot size",
        "price_verified": False,
        "contact_phone": "+92 21 99245138",
        "contact_email": "info@kwsc.gos.pk",
        "contact_verified": True,
        "source_url": "https://kwsc.gos.pk",
        "source_type": "official",
        "last_verified_at": "2026-09-01T00:00:00Z",
        "required_documents": [
            "Attested Copy of CNIC",
            "Property Title / Allotment Letter",
            "Approved Building Plan",
            "No Objection Certificate (NOC) from Town Admin"
        ],
        "procedure_steps": [
            "Submit Application Form K-1 at nearest KWSC Zonal Executive Engineer Office",
            "Physical inspection by KWSC site officer",
            "Issuance of official demand note / road cutting fee",
            "Payment of demand note at designated bank branch",
            "Pipeline execution and water meter installation"
        ],
        "processing_time": "15 to 30 working days",
        "availability_status": "available",
        "latitude": 24.8607,
        "longitude": 67.0011,
        "area": "Karachi Region Wide"
    },
    {
        "id": "d1000000-0000-0000-0000-000000000003",
        "category_id": "c2000000-0000-0000-0000-000000000003",
        "category_name": "gas_services",
        "authority_id": "99999999-9999-9999-9999-999999999999",
        "authority_name": "Sui Southern Gas Company (SSGC)",
        "title": "SSGC Domestic Gas Connection Application",
        "slug": "ssgc-new-gas-connection",
        "service_type": "gas_connection",
        "description": "Official Sui Southern Gas Company (SSGC) domestic gas connection service for new residential premises in Karachi.",
        "price_amount": None,
        "price_currency": "PKR",
        "price_unit": "Subject to SSGC official tariff schedule",
        "price_verified": False,
        "contact_phone": "+92 21 99021000",
        "contact_email": "info@ssgc.com.pk",
        "contact_verified": True,
        "source_url": "https://www.ssgc.com.pk",
        "source_type": "official",
        "last_verified_at": "2026-09-01T00:00:00Z",
        "required_documents": [
            "Valid CNIC of Applicant",
            "Proof of Property Ownership / Lease Deed",
            "Neighboring SSGC Gas Bill Copy",
            "Affidavit on Rs. 50 Stamp Paper"
        ],
        "procedure_steps": [
            "Register online application on SSGC portal or visit SSGC Customer Care Centre",
            "Obtain Application Tracking ID",
            "Technical site feasibility survey by SSGC engineers",
            "Payment of Demand Draft for connection security deposit",
            "Meter installation and line commissioning"
        ],
        "processing_time": "30 to 60 working days",
        "availability_status": "available",
        "latitude": 24.8607,
        "longitude": 67.0011,
        "area": "Karachi Division"
    },
    {
        "id": "d1000000-0000-0000-0000-000000000004",
        "category_id": "c2000000-0000-0000-0000-000000000001",
        "category_name": "water_tankers",
        "authority_id": "22222222-2222-2222-2222-222222222222",
        "authority_name": "Karachi Water & Sewerage Corporation",
        "title": "KWSC NIPA Clifton & DHA Water Hydrant",
        "slug": "kwsc-clifton-dha-tanker",
        "service_type": "water_tanker",
        "description": "KWSC official emergency water tanker service operating for Clifton, DHA, and South district residents.",
        "price_amount": 2200,
        "price_currency": "PKR",
        "price_unit": "1000 Gallons",
        "price_verified": True,
        "contact_phone": "+92 21 99251848",
        "contact_email": "info@kwsc.gos.pk",
        "contact_verified": True,
        "source_url": "https://kwsc.gos.pk",
        "source_type": "official",
        "last_verified_at": "2026-09-01T00:00:00Z",
        "required_documents": ["CNIC", "Recent CBC Utility Bill / KWSC Bill"],
        "procedure_steps": [
            "Call KWSC Clifton Hydrant helpline or request via app",
            "Provide street address and contact info",
            "Delivery scheduled with SMS tracking"
        ],
        "processing_time": "3 to 8 hours",
        "availability_status": "available",
        "latitude": 24.8211,
        "longitude": 67.0321,
        "area": "Clifton / DHA, Karachi"
    }
]

DEMO_CATEGORIES = [
    {"id": "c2000000-0000-0000-0000-000000000001", "name": "water_tankers", "display_name": "Water Tankers", "icon": "Droplets", "description": "Emergency and commercial water supply tanker services across Karachi."},
    {"id": "c2000000-0000-0000-0000-000000000002", "name": "water_connections", "display_name": "Water Connections", "icon": "Pipette", "description": "New water line connection, meter installation, and pipeline repair services."},
    {"id": "c2000000-0000-0000-0000-000000000003", "name": "gas_services", "display_name": "Gas Services", "icon": "Flame", "description": "SSGC gas line connection, meter testing, and gas emergency repairs."},
    {"id": "c2000000-0000-0000-0000-000000000004", "name": "sewerage_services", "display_name": "Sewerage & Sanitation", "icon": "Waves", "description": "Main sewer line cleanout, suction machine dispatch, and drain maintenance."},
    {"id": "c2000000-0000-0000-0000-000000000005", "name": "waste_management", "display_name": "Waste Management", "icon": "Trash2", "description": "Bulk waste pickup, municipal container requests, and debris clearing."}
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class ServiceRepository:
    def __init__(self):
        self.services = DEMO_SERVICES
        self.categories = DEMO_CATEGORIES
        self.saved_services: Dict[str, List[str]] = {} # user_id -> list of service_ids
        self.supabase = None
        try:
            key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
            if settings.SUPABASE_URL and key:
                self.supabase = create_client(settings.SUPABASE_URL, key)
        except Exception as e:
            logger.debug(f"ServiceRepository Supabase init note: {e}")

    def list_categories(self) -> List[Dict[str, Any]]:
        return self.categories

    def list_services(
        self,
        category: Optional[str] = None,
        service_type: Optional[str] = None,
        search: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        sort: str = "nearest"
    ) -> List[Dict[str, Any]]:
        results = list(self.services)

        if category and category != "all":
            results = [s for s in results if s.get("category_name") == category or s.get("category_id") == category]

        if service_type and service_type != "all":
            results = [s for s in results if s.get("service_type") == service_type]

        if search:
            q = search.lower().strip()
            results = [
                s for s in results
                if q in s["title"].lower()
                or q in s["description"].lower()
                or q in s.get("area", "").lower()
                or q in s.get("authority_name", "").lower()
            ]

        user_lat = lat if lat is not None else 24.9333
        user_lon = lon if lon is not None else 66.9833

        for s in results:
            s_lat = s.get("latitude", 24.8607)
            s_lon = s.get("longitude", 67.0011)
            dist = haversine_km(user_lat, user_lon, s_lat, s_lon)
            s["distance_km"] = round(dist, 1)

        if sort == "nearest":
            results.sort(key=lambda x: x.get("distance_km", 999))
        elif sort == "price_low":
            results.sort(key=lambda x: (x.get("price_amount") is None, x.get("price_amount", 999999)))

        return results

    def get_by_id(self, service_id: str) -> Optional[Dict[str, Any]]:
        for s in self.services:
            if s["id"] == service_id or s.get("slug") == service_id:
                return s
        return None

    def list_saved_services(self, user_id: str) -> List[Dict[str, Any]]:
        saved_ids = self.saved_services.get(user_id, [])
        return [s for s in self.services if s["id"] in saved_ids]

    def save_service(self, user_id: str, service_id: str) -> bool:
        if user_id not in self.saved_services:
            self.saved_services[user_id] = []
        if service_id not in self.saved_services[user_id]:
            self.saved_services[user_id].append(service_id)
        return True

    def remove_saved_service(self, user_id: str, service_id: str) -> bool:
        if user_id in self.saved_services and service_id in self.saved_services[user_id]:
            self.saved_services[user_id].remove(service_id)
        return True

service_repo = ServiceRepository()
