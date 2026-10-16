from typing import Dict, Any, Optional
from app.repositories.authority_repository import authority_repo
from app.schemas.complaint import AuthorityInfo
from app.core.logging import logger

class RoutingService:
    def route_complaint(
        self,
        category: str,
        subcategory: Optional[str] = None,
        area: Optional[str] = None,
        town: Optional[str] = None,
        location_text: Optional[str] = None,
        description: Optional[str] = None
    ) -> AuthorityInfo:
        """
        Deterministic database-driven routing engine:
        1. Check geographic Cantonment jurisdiction first (CBC, CBKC, FCB, MCB, MNCB)
        2. Category & function matching (KWSB, SSWMB, KMC, Town Administration)
        """
        combined_text = f"{area or ''} {town or ''} {location_text or ''} {description or ''}".lower()

        # 1. Geographic Cantonment Jurisdictions
        # CBC (Clifton & DHA)
        if any(k in combined_text for k in ["dha", "defence", "clifton", "phase 1", "phase 2", "phase 5", "phase 6", "phase 7", "phase 8", "boat basin", "sea view"]):
            cbc = authority_repo.get_authority_by_short_name("CBC")
            if cbc:
                return AuthorityInfo(
                    id=cbc["id"],
                    name=cbc["name"],
                    short_name=cbc["short_name"],
                    email=cbc["email"],
                    phone=cbc["phone"],
                    email_configured=bool(cbc["email"]),
                    routing_confidence=0.98,
                    routing_reason="Geographic location falls within Cantonment Board Clifton (CBC / DHA) municipal jurisdiction."
                )

        # Malir Cantt
        if any(k in combined_text for k in ["malir cantt", "askari 4", "askari 5", "safoora cantt"]):
            mcb = authority_repo.get_authority_by_short_name("MCB")
            if mcb:
                return AuthorityInfo(
                    id=mcb["id"],
                    name=mcb["name"],
                    short_name=mcb["short_name"],
                    email=mcb["email"],
                    phone=mcb["phone"],
                    email_configured=bool(mcb["email"]),
                    routing_confidence=0.98,
                    routing_reason="Location falls within Malir Cantonment Board jurisdiction."
                )

        # Faisal Cantt
        if any(k in combined_text for k in ["faisal cantt", "drigh road cantt", "karsaz cantt", "gulshan-e-jamal cantt"]):
            fcb = authority_repo.get_authority_by_short_name("FCB")
            if fcb:
                return AuthorityInfo(
                    id=fcb["id"],
                    name=fcb["name"],
                    short_name=fcb["short_name"],
                    email=fcb["email"],
                    phone=fcb["phone"],
                    email_configured=bool(fcb["email"]),
                    routing_confidence=0.98,
                    routing_reason="Location falls within Faisal Cantonment Board jurisdiction."
                )

        # Korangi & Landhi Cantt
        if any(k in combined_text for k in ["korangi cantt", "korangi creek", "landhi cantt"]):
            cbkc = authority_repo.get_authority_by_short_name("CBKC")
            if cbkc:
                return AuthorityInfo(
                    id=cbkc["id"],
                    name=cbkc["name"],
                    short_name=cbkc["short_name"],
                    email=cbkc["email"],
                    phone=cbkc["phone"],
                    email_configured=bool(cbkc["email"]),
                    routing_confidence=0.98,
                    routing_reason="Location falls within Cantonment Board Korangi & Landhi jurisdiction."
                )

        # Manora Cantt
        if any(k in combined_text for k in ["manora", "manora island", "keamari naval"]):
            mncb = authority_repo.get_authority_by_short_name("MNCB")
            if mncb:
                return AuthorityInfo(
                    id=mncb["id"],
                    name=mncb["name"],
                    short_name=mncb["short_name"],
                    email=mncb["email"],
                    phone=mncb["phone"],
                    email_configured=bool(mncb["email"]),
                    routing_confidence=0.98,
                    routing_reason="Location falls within Manora Cantonment Board jurisdiction."
                )

        # 2. Category & Specific Municipal Function Rules

        # KWSB / KWSC: Clean Water, Water Leaks, Sewerage Network, Sewage Overflows
        if category in ["sewage", "water_supply"]:
            kwsb = authority_repo.get_authority_by_short_name("KWSB")
            if kwsb:
                return AuthorityInfo(
                    id=kwsb["id"],
                    name=kwsb["name"],
                    short_name=kwsb["short_name"],
                    email=kwsb["email"],
                    phone=kwsb["phone"],
                    email_configured=bool(kwsb["email"]),
                    routing_confidence=0.96,
                    routing_reason="Water supply networks, sewerage lines, and wastewater overflows are under Karachi Water & Sewerage Corporation (KWSC/KWSB)."
                )

        # SSWMB: Garbage collection, waste transportation, landfills, solid waste
        if category in ["garbage", "sanitation"]:
            sswmb = authority_repo.get_authority_by_short_name("SSWMB")
            if sswmb:
                return AuthorityInfo(
                    id=sswmb["id"],
                    name=sswmb["name"],
                    short_name=sswmb["short_name"],
                    email=sswmb["email"], # Will be None
                    phone=sswmb["phone"],
                    email_configured=False,
                    routing_confidence=0.96,
                    routing_reason="Solid waste management, garbage collection, and municipal cleanliness are handled by Sindh Solid Waste Management Board (SSWMB)."
                )

        # KMC: Main roads, bridges, storm drains, major parks, safari park, zoo, encroachments, fire & rescue
        is_kmc_scope = (
            category in ["drainage", "parks", "fire_rescue", "encroachment", "building_control"]
            or any(w in combined_text for w in ["shahrah", "main road", "arterial", "expressway", "bridge", "flyover", "nullah", "safari park", "zoo", "major road"])
        )
        if is_kmc_scope:
            kmc = authority_repo.get_authority_by_short_name("KMC")
            if kmc:
                return AuthorityInfo(
                    id=kmc["id"],
                    name=kmc["name"],
                    short_name=kmc["short_name"],
                    email=kmc["email"],
                    phone=kmc["phone"],
                    email_configured=bool(kmc["email"]),
                    routing_confidence=0.94,
                    routing_reason="Major municipal infrastructure, arterial transit routes, storm water drains, and encroachment control are managed by KMC."
                )

        # Town Administration: Local neighborhood roads, potholes, streetlights, local sanitation
        town_admin = authority_repo.get_authority_by_short_name("Town Admin")
        if town_admin:
            return AuthorityInfo(
                id=town_admin["id"],
                name=town_admin["name"],
                short_name=town_admin["short_name"],
                email=town_admin["email"],
                phone=town_admin["phone"],
                email_configured=bool(town_admin["email"]),
                routing_confidence=0.90,
                routing_reason="Maintenance of neighborhood streets, local potholes, and residential streetlights falls under Town Administration."
            )

        # Fallback to KMC
        kmc = authority_repo.get_authority_by_short_name("KMC")
        return AuthorityInfo(
            id=kmc["id"],
            name=kmc["name"],
            short_name=kmc["short_name"],
            email=kmc["email"],
            phone=kmc["phone"],
            email_configured=bool(kmc["email"]),
            routing_confidence=0.85,
            routing_reason="Karachi Metropolitan Corporation is the apex municipal authority."
        )

routing_service = RoutingService()
