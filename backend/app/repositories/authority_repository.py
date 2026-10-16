from typing import List, Dict, Optional, Any

AUTHORITIES: List[Dict[str, Any]] = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Karachi Metropolitan Corporation",
        "short_name": "KMC",
        "authority_type": "metropolitan",
        "description": "Planning, main roads, bridges, storm water drains, abattoirs, major parks, fire & rescue, land control and encroachment removal.",
        "email": "mayor@kmc.gos.pk",
        "phone": "+92 21 99215000",
        "functions": [
            "Planning & Development and Maintenance of Main Roads",
            "Bridges",
            "Storm Water Drains",
            "Coordination and Supervision of development schemes in KMC jurisdiction",
            "Maintenance of Abattoir and Cattle Colonies",
            "Zoological Garden / Safari Park",
            "52 Parks / Green Belts on Major Roads",
            "Aquarium, Sports Complexes and Playgrounds",
            "University and Hospitals",
            "Land Control & Removal of encroachment",
            "Municipal watch and ward",
            "Fire & Rescue",
            "Charged Parking on KMC Roads",
            "Art Gallery and Museum in jurisdiction of Denso Hall",
            "Municipal Utility Charges/Tax",
            "Advertisement on underpasses and pedestrian bridges"
        ]
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Karachi Water & Sewerage Corporation",
        "short_name": "KWSB",
        "authority_type": "water_sewerage",
        "description": "Clean water supply, water filtration, sewerage network management, sewage overflows, and water pipe leakages.",
        "email": "info@kwsc.gos.pk",
        "phone": "+92 21 99245138",
        "functions": [
            "Water Filtration Process",
            "Water Supply Services",
            "Sewerage network management",
            "Sewerage blockages and overflow",
            "Water leakage and related water-service issues"
        ]
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "Sindh Solid Waste Management Board",
        "short_name": "SSWMB",
        "authority_type": "waste_management",
        "description": "Residential & commercial garbage collection, waste transport, landfill operation, and municipal cleanliness.",
        "email": None, # Provided contact is phone number only. Do NOT invent an email!
        "phone": "+92 3181030851",
        "functions": [
            "Garbage collection from residential and commercial areas",
            "Transportation of waste from collection points to disposal facilities",
            "Waste recycling and treatment initiatives",
            "Management/operation of waste facilities and landfill sites",
            "Cleaning and sanitation-related solid-waste operations",
            "Monitoring waste collection operations and contractors",
            "Receiving and handling garbage-related complaints from citizens",
            "Environmental and public-awareness activities related to waste management",
            "Outsourcing municipal solid-waste functions to contractors/service providers"
        ]
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "name": "Cantonment Board Clifton",
        "short_name": "CBC",
        "authority_type": "cantonment",
        "description": "Roads, streetlights, water supply, sanitation, parks, and building control in Clifton and DHA jurisdictions.",
        "email": "info@cbc.gov.pk",
        "phone": "+92 21 99251848",
        "functions": [
            "Roads & infrastructure — construction, maintenance and development",
            "Street lights — installation and maintenance",
            "Water supply — provision and management of water services",
            "Sanitation & cleanliness — cleaning of streets, public places and drains",
            "Parks & horticulture — maintenance of parks, green areas and landscaping",
            "Building control — regulation and approval of construction and development",
            "Health services — public health facilities and related services",
            "Revenue collection — property taxes, fees and municipal charges",
            "Fire services — assistance in extinguishing fires and protecting life and property",
            "Civic/development works"
        ],
        "jurisdiction_keywords": ["dha", "clifton", "phase 1", "phase 2", "phase 4", "phase 5", "phase 6", "phase 7", "phase 8", "gizri", "boat basin", "sea view", "zamzama", "badar"]
    },
    {
        "id": "55555555-5555-5555-5555-555555555555",
        "name": "Cantonment Board Korangi & Landhi",
        "short_name": "CBKC",
        "authority_type": "cantonment",
        "description": "Roads, sanitation, water, streetlights, and civic works in Korangi and Landhi Cantonment areas.",
        "email": "newceo.cbkc@gmail.com",
        "phone": "+92 21 35061611",
        "functions": [
            "Roads & infrastructure",
            "Street lights",
            "Water supply",
            "Sanitation & cleanliness",
            "Parks & horticulture",
            "Building control",
            "Health services",
            "Revenue collection",
            "Fire services",
            "Civic/development works"
        ],
        "jurisdiction_keywords": ["korangi cantt", "korangi creek", "landhi cantt", "cbkc"]
    },
    {
        "id": "66666666-6666-6666-6666-666666666666",
        "name": "Faisal Cantonment Board",
        "short_name": "FCB",
        "authority_type": "cantonment",
        "description": "Civic services, roads, streetlights, water, and sanitation in Faisal Cantonment and Shahrah-e-Faisal zone.",
        "email": "faisalcantonmentboard@gmail.com",
        "phone": "+92 21 99240317",
        "functions": [
            "Roads & infrastructure",
            "Street lights",
            "Water supply",
            "Sanitation & cleanliness",
            "Parks & horticulture",
            "Building control",
            "Health services",
            "Revenue collection",
            "Fire services",
            "Civic/development works"
        ],
        "jurisdiction_keywords": ["faisal cantt", "shahrah-e-faisal cantt", "drigh road cantt", "karsaz cantt", "falaknaz", "gulshan-e-jamal cantt"]
    },
    {
        "id": "77777777-7777-7777-7777-777777777777",
        "name": "Malir Cantonment Board",
        "short_name": "MCB",
        "authority_type": "cantonment",
        "description": "Civic maintenance, roads, water, streetlights, and sanitation in Malir Cantonment jurisdiction.",
        "email": "pa.cbmalir@gmail.com",
        "phone": "+92 21 99247201",
        "functions": [
            "Roads & infrastructure",
            "Street lights",
            "Water supply",
            "Sanitation & cleanliness",
            "Parks & horticulture",
            "Building control",
            "Health services",
            "Revenue collection",
            "Fire services",
            "Civic/development works"
        ],
        "jurisdiction_keywords": ["malir cantt", "cantt checkpost", "airport road cantt", "safoora cantt", "askari 4", "askari 5", "cantt bazar"]
    },
    {
        "id": "88888888-8888-8888-8888-888888888888",
        "name": "Manora Cantonment Board",
        "short_name": "MNCB",
        "authority_type": "cantonment",
        "description": "Municipal and development services for Manora island cantonment.",
        "email": "cbmanora75@gmail.com",
        "phone": "+92 21 32470001",
        "functions": [
            "Roads & infrastructure",
            "Street lights",
            "Water supply",
            "Sanitation & cleanliness",
            "Parks & horticulture",
            "Building control",
            "Health services",
            "Revenue collection",
            "Fire services",
            "Civic/development works"
        ],
        "jurisdiction_keywords": ["manora", "manora island", "keamari naval", "manora cantt"]
    },
    {
        "id": "99999999-9999-9999-9999-999999999999",
        "name": "Town Administration",
        "short_name": "Town Admin",
        "authority_type": "town_municipal",
        "description": "Maintenance of local roads, repair of potholes, streetlights, local street cleaning, and neighborhood sanitation.",
        "email": "mayor@kmc.gos.pk",
        "phone": "+92 21 99215000",
        "functions": [
            "Maintenance of local roads and streets",
            "Repair of potholes and minor local infrastructure",
            "Maintenance of streetlights",
            "Street cleaning and local sanitation"
        ],
        "jurisdiction_keywords": ["town", "uc", "union committee", "gali", "mohalla", "internal road", "block street"]
    }
]

ISSUE_CATEGORIES: List[Dict[str, Any]] = [
    {
        "id": "c1000000-0000-0000-0000-000000000001",
        "name": "water_supply",
        "display_name": "Water Supply",
        "description": "Issues related to shortage, contamination, water pipe leaks, low pressure, or filtration.",
        "keywords": ["pani", "water", "supply", "pipeline", "leakage", "filtration", "tanker", "boring"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000002",
        "name": "sewage",
        "display_name": "Sewage & Sanitation",
        "description": "Overflowing gutters, blocked manholes, contaminated wastewater, and sewage leaks.",
        "keywords": ["gutter", "sewer", "sewage", "overflow", "drainage blockage", "ganda pani", "manhole", "gutters"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000003",
        "name": "garbage",
        "display_name": "Garbage & Waste",
        "description": "Uncollected garbage piles, overflowing dumpsters, waste transport, and dumping.",
        "keywords": ["kachra", "garbage", "trash", "kuda", "dump", "safai", "solid waste", "kura karkat", "debris"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000004",
        "name": "drainage",
        "display_name": "Storm Water Drains",
        "description": "Blocked nullahs, rainwater drain clogs, seasonal flooding risks, and drain covers.",
        "keywords": ["nullah", "drain", "rainwater", "storm drain", "barsati nala", "stormwater"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000005",
        "name": "road_damage",
        "display_name": "Roads & Potholes",
        "description": "Damaged road surface, potholes, broken asphalt, sunken utility cuts, bridge issues.",
        "keywords": ["sadak", "road", "pothole", "khadda", "broken street", "bridge", "asphalt", "flyover"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000006",
        "name": "street_lighting",
        "display_name": "Street Lighting",
        "description": "Broken streetlights, unlit dark streets, faulty electric poles, missing bulbs.",
        "keywords": ["street light", "batti", "light pole", "dark street", "bijli ka khamba", "lights", "lamp"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000007",
        "name": "encroachment",
        "display_name": "Encroachment & Land Control",
        "description": "Illegal construction, footpaths blocked by vendors/stalls, unauthorized parking barriers.",
        "keywords": ["tajawuzat", "encroachment", "footpath", "illegal occupation", "thela", "pathara", "stall"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000008",
        "name": "sanitation",
        "display_name": "Public Sanitation",
        "description": "Lack of public cleanliness, open debris, hazardous dumping, foul odors.",
        "keywords": ["sanitation", "badboo", "malba", "debris", "public toilet", "filth"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000009",
        "name": "parks",
        "display_name": "Parks & Playgrounds",
        "description": "Broken park benches, unattended green belts, neglected safari park or zoological garden.",
        "keywords": ["park", "playground", "green belt", "safari park", "zoo", "benches", "trees", "garden"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000010",
        "name": "fire_rescue",
        "display_name": "Fire & Rescue Safety",
        "description": "Fire hazards, blocked fire hydrants, emergency municipal safety risks.",
        "keywords": ["aag", "fire", "rescue", "emergency", "fire hydrant", "hazard"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000011",
        "name": "municipal_charges",
        "display_name": "Municipal Charges & Taxes",
        "description": "Disputed municipal utility tax, charged parking fraud, billboard violations.",
        "keywords": ["tax", "utility charges", "charged parking", "billboard", "advertisement"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000012",
        "name": "building_control",
        "display_name": "Building Control & Safety",
        "description": "Dangerous cracked buildings, illegal floor additions, hazardous constructions.",
        "keywords": ["building", "illegal construction", "dangerous structure", "crack", "plaza"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000013",
        "name": "health_services",
        "display_name": "Public Health & Stray Animals",
        "description": "Dog bites, stray animal nuisance, municipal health clinic issues, pest fumigation.",
        "keywords": ["kutte", "stray dogs", "fumigation", "mosquitoes", "hospital", "dispensary"]
    },
    {
        "id": "c1000000-0000-0000-0000-000000000014",
        "name": "other",
        "display_name": "General Civic Issue",
        "description": "Other unclassified municipal service complaints.",
        "keywords": ["shikayat", "complaint", "general", "other"]
    }
]

class AuthorityRepository:
    def get_all_authorities(self) -> List[Dict[str, Any]]:
        return AUTHORITIES

    def get_authority_by_id(self, authority_id: str) -> Optional[Dict[str, Any]]:
        for a in AUTHORITIES:
            if a["id"] == authority_id:
                return a
        return None

    def get_authority_by_short_name(self, short_name: str) -> Optional[Dict[str, Any]]:
        for a in AUTHORITIES:
            if a["short_name"].lower() == short_name.lower():
                return a
        return None

    def get_all_categories(self) -> List[Dict[str, Any]]:
        return ISSUE_CATEGORIES

    def get_category_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        for c in ISSUE_CATEGORIES:
            if c["name"].lower() == name.lower():
                return c
        return None

authority_repo = AuthorityRepository()
