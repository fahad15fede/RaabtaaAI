from fastapi import APIRouter
from typing import List, Dict, Any
from app.repositories.authority_repository import authority_repo

router = APIRouter(prefix="/api", tags=["authorities"])

@router.get("/authorities")
def get_authorities() -> List[Dict[str, Any]]:
    return authority_repo.get_all_authorities()

@router.get("/categories")
def get_categories() -> List[Dict[str, Any]]:
    return authority_repo.get_all_categories()
