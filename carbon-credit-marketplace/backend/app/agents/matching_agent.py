"""
Matching Agent - Match buyers with suitable sellers

TODO: Developer 2 will implement:
- Matching algorithm
- Scoring logic (price, vintage, verification, rating)
- Ranking sellers
"""


async def find_matched_sellers(request: dict, db) -> list:
    """
    Find and rank matched sellers
    
    Args:
        request: {"credits_needed", "max_price", "preferred_vintage", "preferred_project_type"}
        db: Database session
    
    Returns:
        list: List of matched sellers with scores
    """
    # TODO: Implement by Developer 2
    pass
