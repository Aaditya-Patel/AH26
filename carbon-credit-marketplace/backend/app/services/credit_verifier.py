"""
Credit balance verification service for sellers
"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models.models import CreditAccount, User


async def verify_seller_has_credits(
    db: AsyncSession,
    seller_id: UUID,
    quantity: float
) -> bool:
    """
    Verify that seller has sufficient available credits
    
    Args:
        db: Database session
        seller_id: Seller user ID
        quantity: Required credit quantity
    
    Returns:
        True if seller has sufficient credits, False otherwise
    """
    try:
        # Get seller's credit account
        result = await db.execute(
            select(CreditAccount).where(CreditAccount.user_id == seller_id)
        )
        account = result.scalar_one_or_none()
        
        if not account:
            return False
        
        # Check if available balance is sufficient
        return account.available_balance >= quantity
    except Exception as e:
        # On error, return False (conservative approach)
        return False


async def check_credit_availability(
    db: AsyncSession,
    seller_id: UUID
) -> Dict[str, Any]:
    """
    Get detailed credit availability breakdown for seller
    
    Args:
        db: Database session
        seller_id: Seller user ID
    
    Returns:
        Dictionary with credit balance breakdown
    """
    try:
        result = await db.execute(
            select(CreditAccount).where(CreditAccount.user_id == seller_id)
        )
        account = result.scalar_one_or_none()
        
        if not account:
            return {
                "has_account": False,
                "total_balance": 0.0,
                "available_balance": 0.0,
                "locked_balance": 0.0,
                "retired_balance": 0.0
            }
        
        return {
            "has_account": True,
            "total_balance": account.total_balance or 0.0,
            "available_balance": account.available_balance or 0.0,
            "locked_balance": account.locked_balance or 0.0,
            "retired_balance": account.retired_balance or 0.0
        }
    except Exception as e:
        return {
            "has_account": False,
            "total_balance": 0.0,
            "available_balance": 0.0,
            "locked_balance": 0.0,
            "retired_balance": 0.0,
            "error": str(e)
        }


async def validate_credit_listing(
    db: AsyncSession,
    seller_id: UUID,
    listing_quantity: float
) -> Dict[str, Any]:
    """
    Full validation for credit listing creation
    
    Args:
        db: Database session
        seller_id: Seller user ID
        listing_quantity: Quantity of credits to list
    
    Returns:
        Dictionary with validation results
    """
    # Verify seller exists and is a seller
    result = await db.execute(
        select(User).where(User.id == seller_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return {
            "is_valid": False,
            "error": "Seller not found"
        }
    
    if user.user_type != "seller":
        return {
            "is_valid": False,
            "error": "User is not a seller"
        }
    
    # Check credit availability
    availability = await check_credit_availability(db, seller_id)
    
    if not availability.get("has_account"):
        return {
            "is_valid": False,
            "error": "Seller does not have a credit account",
            "availability": availability
        }
    
    available = availability.get("available_balance", 0.0)
    
    if available < listing_quantity:
        return {
            "is_valid": False,
            "error": f"Insufficient credits. Available: {available}, Required: {listing_quantity}",
            "available_balance": available,
            "required_quantity": listing_quantity,
            "availability": availability
        }
    
    return {
        "is_valid": True,
        "available_balance": available,
        "required_quantity": listing_quantity,
        "availability": availability
    }
