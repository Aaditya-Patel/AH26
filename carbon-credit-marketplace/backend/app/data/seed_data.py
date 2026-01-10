"""
Seed database with mock data for demo

TODO: Developer 1 will implement:
- Create demo users (2 buyers, 3 sellers)
- Create credit listings
- Add to startup event in main.py
"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import User, CreditListing
from app.core.security import get_password_hash


async def seed_database(db: AsyncSession):
    """Seed database with mock data"""
    
    # TODO: Implement by Developer 1
    # Create demo buyers
    # Create demo sellers
    # Create credit listings
    
    pass
