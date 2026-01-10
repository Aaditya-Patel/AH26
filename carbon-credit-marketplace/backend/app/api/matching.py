from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import MatchingRequest, MatchingResponse
# from app.agents.matching_agent import find_matched_sellers

router = APIRouter()


@router.post("/find", response_model=MatchingResponse)
async def find_matches(
    request: MatchingRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Find matched sellers based on buyer requirements
    
    TODO: Implement matching agent logic
    - Developer 2 will implement the matching algorithm
    - Scores sellers based on price, vintage, project type, etc.
    """
    
    # Placeholder response
    # Real implementation by Developer 2
    return MatchingResponse(
        matches=[]
    )
