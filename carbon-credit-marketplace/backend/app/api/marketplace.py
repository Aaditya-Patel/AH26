from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
import json

from app.database import get_db
from app.models.models import User, CreditListing
from app.schemas.schemas import ListingCreate, ListingResponse, ListingUpdate
from app.core.security import get_current_user_id
from app.services.credit_verifier import validate_credit_listing

router = APIRouter()


def parse_co_benefits(co_benefits_str: str) -> List[str]:
    """Parse co-benefits from JSON string"""
    if not co_benefits_str:
        return []
    try:
        return json.loads(co_benefits_str)
    except:
        return []


def format_listing_response(listing, seller) -> dict:
    """Format a listing response with all fields"""
    co_benefits = parse_co_benefits(listing.co_benefits) if listing.co_benefits else None
    
    return {
        "id": listing.id,
        "seller_id": listing.seller_id,
        "seller_name": seller.company_name,
        "quantity": listing.quantity,
        "available_quantity": listing.available_quantity or listing.quantity,
        "price_per_credit": listing.price_per_credit,
        "vintage": listing.vintage,
        "project_type": listing.project_type,
        "verification_status": listing.verification_status,
        "is_active": listing.is_active,
        "description": listing.description,
        "methodology": listing.methodology,
        "project_location": listing.project_location,
        "serial_number_start": listing.serial_number_start,
        "serial_number_end": listing.serial_number_end,
        "co_benefits": co_benefits,
        "additionality_score": listing.additionality_score,
        "permanence_score": listing.permanence_score,
        "created_at": listing.created_at
    }


@router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    vintage: Optional[int] = Query(None),
    project_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    methodology: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all active credit listings with optional filters"""
    
    query = select(CreditListing, User).join(User, CreditListing.seller_id == User.id).where(
        and_(
            CreditListing.is_active == True,
            CreditListing.available_quantity > 0
        )
    )
    
    # Apply filters
    if vintage:
        query = query.where(CreditListing.vintage == vintage)
    if project_type:
        query = query.where(CreditListing.project_type == project_type)
    if min_price:
        query = query.where(CreditListing.price_per_credit >= min_price)
    if max_price:
        query = query.where(CreditListing.price_per_credit <= max_price)
    if methodology:
        query = query.where(CreditListing.methodology == methodology)
    if verification_status:
        query = query.where(CreditListing.verification_status == verification_status)
    
    query = query.order_by(CreditListing.created_at.desc())
    
    result = await db.execute(query)
    listings_with_sellers = result.all()
    
    # Format response
    response = []
    for listing, seller in listings_with_sellers:
        listing_dict = format_listing_response(listing, seller)
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
    
    # Verify seller has sufficient credits
    validation = await validate_credit_listing(db, UUID(user_id), float(listing_data.quantity))
    if not validation.get("is_valid"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation.get("error", "Credit verification failed")
        )
    
    # Convert co_benefits list to JSON string
    co_benefits_json = None
    if listing_data.co_benefits:
        co_benefits_json = json.dumps(listing_data.co_benefits)
    
    # Create listing
    new_listing = CreditListing(
        seller_id=UUID(user_id),
        quantity=listing_data.quantity,
        available_quantity=listing_data.quantity,  # Initially all credits are available
        price_per_credit=listing_data.price_per_credit,
        vintage=listing_data.vintage,
        project_type=listing_data.project_type,
        description=listing_data.description,
        methodology=listing_data.methodology,
        project_location=listing_data.project_location,
        co_benefits=co_benefits_json,
        verification_status="pending"
    )
    
    db.add(new_listing)
    await db.commit()
    await db.refresh(new_listing)
    
    listing_dict = format_listing_response(new_listing, user)
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
    listing_dict = format_listing_response(listing, seller)
    return ListingResponse(**listing_dict)


@router.patch("/listings/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: UUID,
    listing_data: ListingUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update a listing (owner only)"""
    
    result = await db.execute(
        select(CreditListing, User)
        .join(User, CreditListing.seller_id == User.id)
        .where(
            and_(
                CreditListing.id == listing_id,
                CreditListing.seller_id == user_id
            )
        )
    )
    listing_seller = result.first()
    
    if not listing_seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you don't have permission to edit it"
        )
    
    listing, seller = listing_seller
    
    # Update fields
    if listing_data.quantity is not None:
        # Adjust available quantity proportionally
        if listing.quantity > 0:
            sold_quantity = listing.quantity - listing.available_quantity
            listing.quantity = listing_data.quantity
            listing.available_quantity = max(0, listing_data.quantity - sold_quantity)
        else:
            listing.quantity = listing_data.quantity
            listing.available_quantity = listing_data.quantity
    
    if listing_data.price_per_credit is not None:
        listing.price_per_credit = listing_data.price_per_credit
    
    if listing_data.description is not None:
        listing.description = listing_data.description
    
    if listing_data.is_active is not None:
        listing.is_active = listing_data.is_active
    
    await db.commit()
    await db.refresh(listing)
    
    listing_dict = format_listing_response(listing, seller)
    return ListingResponse(**listing_dict)


@router.delete("/listings/{listing_id}")
async def deactivate_listing(
    listing_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate a listing (owner only)"""
    
    result = await db.execute(
        select(CreditListing).where(
            and_(
                CreditListing.id == listing_id,
                CreditListing.seller_id == user_id
            )
        )
    )
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you don't have permission to delete it"
        )
    
    listing.is_active = False
    await db.commit()
    
    return {"message": "Listing deactivated successfully"}


@router.get("/my-listings", response_model=List[ListingResponse])
async def get_my_listings(
    include_inactive: bool = Query(False),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all listings for the current user (sellers only)"""
    
    # Verify user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    query = select(CreditListing).where(CreditListing.seller_id == user_id)
    
    if not include_inactive:
        query = query.where(CreditListing.is_active == True)
    
    query = query.order_by(CreditListing.created_at.desc())
    
    result = await db.execute(query)
    listings = result.scalars().all()
    
    response = []
    for listing in listings:
        listing_dict = format_listing_response(listing, user)
        response.append(ListingResponse(**listing_dict))
    
    return response
