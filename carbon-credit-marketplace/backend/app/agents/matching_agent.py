"""
Matching Agent - Match buyers with suitable sellers
"""

from sqlalchemy import select
from app.models.models import CreditListing, User
from typing import List, Dict, Any


async def find_matched_sellers(request: dict, db) -> List[Dict[str, Any]]:
    """
    Find and rank matched sellers
    
    Args:
        request: {
            "credits_needed": int,
            "max_price": Optional[float],
            "preferred_vintage": Optional[int],
            "preferred_project_type": Optional[str]
        }
        db: Database session
    
    Returns:
        list: List of matched sellers with scores and reasons
    """
    credits_needed = request.get("credits_needed", 0)
    max_price = request.get("max_price")
    preferred_vintage = request.get("preferred_vintage")
    preferred_project_type = request.get("preferred_project_type")
    
    # Query active listings
    query = select(CreditListing, User).join(
        User, CreditListing.seller_id == User.id
    ).where(
        CreditListing.is_active == True
    )
    
    # Apply filters
    if max_price:
        query = query.where(CreditListing.price_per_credit <= max_price)
    if preferred_vintage:
        query = query.where(CreditListing.vintage == preferred_vintage)
    if preferred_project_type:
        query = query.where(CreditListing.project_type == preferred_project_type)
    
    result = await db.execute(query)
    listings_with_sellers = result.all()
    
    if not listings_with_sellers:
        return []
    
    # Score each listing
    scored_listings = []
    
    # Find max and min values for normalization
    prices = [listing.price_per_credit for listing, _ in listings_with_sellers]
    quantities = [listing.quantity for listing, _ in listings_with_sellers]
    
    max_price_val = max(prices) if prices else 1
    min_price_val = min(prices) if prices else 1
    max_quantity_val = max(quantities) if quantities else 1
    
    for listing, seller in listings_with_sellers:
        # Skip if quantity is insufficient
        if listing.quantity < credits_needed:
            continue
        
        reasons = []
        score = 0.0
        
        # Price match (40% weight) - Lower price = higher score
        if max_price_val != min_price_val:
            price_score = 1.0 - ((listing.price_per_credit - min_price_val) / (max_price_val - min_price_val))
        else:
            price_score = 1.0
        score += price_score * 0.4
        if listing.price_per_credit <= (max_price or max_price_val):
            reasons.append(f"Price ₹{listing.price_per_credit:,.0f} within budget")
        
        # Quantity available (30% weight) - More available = higher score
        if max_quantity_val > 0:
            quantity_score = min(listing.quantity / max_quantity_val, 1.0)
        else:
            quantity_score = 1.0
        score += quantity_score * 0.3
        reasons.append(f"Quantity {listing.quantity} credits available")
        
        # Vintage match (20% weight)
        vintage_score = 0.0
        if preferred_vintage:
            if listing.vintage == preferred_vintage:
                vintage_score = 1.0
                reasons.append(f"Exact vintage match ({listing.vintage})")
            elif abs(listing.vintage - preferred_vintage) == 1:
                vintage_score = 0.8
                reasons.append(f"Vintage {listing.vintage} (within 1 year)")
            elif abs(listing.vintage - preferred_vintage) == 2:
                vintage_score = 0.5
                reasons.append(f"Vintage {listing.vintage} (within 2 years)")
            else:
                vintage_score = 0.2
                reasons.append(f"Vintage {listing.vintage}")
        else:
            vintage_score = 0.5  # Neutral score if no preference
        score += vintage_score * 0.2
        
        # Project type match (10% weight)
        project_type_score = 0.0
        if preferred_project_type:
            if listing.project_type == preferred_project_type:
                project_type_score = 1.0
                reasons.append(f"Project type: {listing.project_type}")
            else:
                project_type_score = 0.3
                reasons.append(f"Project type: {listing.project_type}")
        else:
            project_type_score = 0.5  # Neutral score if no preference
        score += project_type_score * 0.1
        
        # Normalize score to 0-100
        normalized_score = round(score * 100, 2)
        
        scored_listings.append({
            "seller_id": str(seller.id),
            "seller_name": seller.company_name,
            "listing_id": str(listing.id),
            "quantity": listing.quantity,
            "price_per_credit": listing.price_per_credit,
            "vintage": listing.vintage,
            "project_type": listing.project_type,
            "match_score": normalized_score,
            "reasons": reasons
        })
    
    # Sort by score descending
    scored_listings.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Return top 5 matches
    return scored_listings[:5]
