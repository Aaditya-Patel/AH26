from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.models import User, CreditListing
from app.schemas.schemas import ListingCreate, ListingResponse
from app.core.security import get_current_user_id

router = APIRouter()


@router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    vintage: Optional[int] = Query(None),
    project_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all active credit listings with optional filters"""
    
    query = select(CreditListing, User).join(User, CreditListing.seller_id == User.id).where(CreditListing.is_active == True)
    
    # Apply filters
    if vintage:
        query = query.where(CreditListing.vintage == vintage)
    if project_type:
        query = query.where(CreditListing.project_type == project_type)
    if min_price:
        query = query.where(CreditListing.price_per_credit >= min_price)
    if max_price:
        query = query.where(CreditListing.price_per_credit <= max_price)
    
    result = await db.execute(query)
    listings_with_sellers = result.all()
    
    # Format response
    response = []
    for listing, seller in listings_with_sellers:
        listing_dict = {
            "id": listing.id,
            "seller_id": listing.seller_id,
            "seller_name": seller.company_name,
            "quantity": listing.quantity,
            "price_per_credit": listing.price_per_credit,
            "vintage": listing.vintage,
            "project_type": listing.project_type,
            "verification_status": listing.verification_status,
            "is_active": listing.is_active,
            "description": listing.description,
            "created_at": listing.created_at
        }
        response.append(ListingResponse(**listing_dict))
    
    return response


@router.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new credit listing (sellers only)"""
    
    # Verify user is a seller
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or user.user_type != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can create listings"
        )
    
    # Create listing
    new_listing = CreditListing(
        seller_id=UUID(user_id),
        quantity=listing_data.quantity,
        price_per_credit=listing_data.price_per_credit,
        vintage=listing_data.vintage,
        project_type=listing_data.project_type,
        description=listing_data.description
    )
    
    db.add(new_listing)
    await db.commit()
    await db.refresh(new_listing)
    
    # Return with seller name
    listing_dict = {
        "id": new_listing.id,
        "seller_id": new_listing.seller_id,
        "seller_name": user.company_name,
        "quantity": new_listing.quantity,
        "price_per_credit": new_listing.price_per_credit,
        "vintage": new_listing.vintage,
        "project_type": new_listing.project_type,
        "verification_status": new_listing.verification_status,
        "is_active": new_listing.is_active,
        "description": new_listing.description,
        "created_at": new_listing.created_at
    }
    
    return ListingResponse(**listing_dict)


@router.get("/listings/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a specific listing by ID"""
    
    result = await db.execute(
        select(CreditListing, User)
        .join(User, CreditListing.seller_id == User.id)
        .where(CreditListing.id == listing_id)
    )
    listing_seller = result.first()
    
    if not listing_seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    listing, seller = listing_seller
    
    listing_dict = {
        "id": listing.id,
        "seller_id": listing.seller_id,
        "seller_name": seller.company_name,
        "quantity": listing.quantity,
        "price_per_credit": listing.price_per_credit,
        "vintage": listing.vintage,
        "project_type": listing.project_type,
        "verification_status": listing.verification_status,
        "is_active": listing.is_active,
        "description": listing.description,
        "created_at": listing.created_at
    }
    
    return ListingResponse(**listing_dict)
