from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import MatchingRequest, MatchingResponse, SellerMatch
from app.agents.matching_agent import find_matched_sellers

router = APIRouter()


@router.post("/find", response_model=MatchingResponse)
async def find_matches(
    request: MatchingRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Find matched sellers based on buyer requirements
    
    Scores sellers based on:
    - Price match (40% weight)
    - Quantity available (30% weight)
    - Vintage match (20% weight)
    - Project type match (10% weight)
    
    Returns top 5 matches ranked by score.
    """
    
    request_dict = {
        "credits_needed": request.credits_needed,
        "max_price": request.max_price,
        "preferred_vintage": request.preferred_vintage,
        "preferred_project_type": request.preferred_project_type
    }
    
    matches = await find_matched_sellers(request_dict, db)
    
    # Convert to SellerMatch schema
    seller_matches = [
        SellerMatch(**match) for match in matches
    ]
    
    return MatchingResponse(matches=seller_matches)
