"""
Seed database with mock data for demo
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User, CreditListing
from app.core.security import get_password_hash
import random


async def seed_database(db: AsyncSession):
    """Seed database with mock data"""
    
    # Check if data already exists
    result = await db.execute(select(User))
    existing_users = result.scalars().all()
    
    if existing_users:
        print("⚠️  Database already seeded, skipping...")
        return
    
    print("🌱 Seeding database with demo data...")
    
    # Create demo buyers
    buyers = [
        {
            "email": "buyer@demo.com",
            "password": "demo123",
            "user_type": "buyer",
            "company_name": "Green Manufacturing Co.",
            "sector": "cement"
        },
        {
            "email": "buyer2@demo.com",
            "password": "demo123",
            "user_type": "buyer",
            "company_name": "Sustainable Textiles Ltd.",
            "sector": "textiles"
        }
    ]
    
    buyer_users = []
    for buyer_data in buyers:
        buyer = User(
            email=buyer_data["email"],
            password_hash=get_password_hash(buyer_data["password"]),
            user_type=buyer_data["user_type"],
            company_name=buyer_data["company_name"],
            sector=buyer_data["sector"]
        )
        db.add(buyer)
        buyer_users.append(buyer)
    
    # Create demo sellers
    sellers = [
        {
            "email": "seller@demo.com",
            "password": "demo123",
            "user_type": "seller",
            "company_name": "Solar Energy Solutions",
            "sector": None
        },
        {
            "email": "seller2@demo.com",
            "password": "demo123",
            "user_type": "seller",
            "company_name": "Forest Conservation Trust",
            "sector": None
        },
        {
            "email": "seller3@demo.com",
            "password": "demo123",
            "user_type": "seller",
            "company_name": "Green Hydrogen Ventures",
            "sector": None
        }
    ]
    
    seller_users = []
    for seller_data in sellers:
        seller = User(
            email=seller_data["email"],
            password_hash=get_password_hash(seller_data["password"]),
            user_type=seller_data["user_type"],
            company_name=seller_data["company_name"],
            sector=seller_data["sector"]
        )
        db.add(seller)
        seller_users.append(seller)
    
    await db.commit()
    
    # Refresh to get IDs
    for buyer in buyer_users:
        await db.refresh(buyer)
    for seller in seller_users:
        await db.refresh(seller)
    
    # Create credit listings
    project_types = ["Renewable Energy", "Forestry", "Energy Efficiency", "Green Hydrogen"]
    vintages = [2022, 2023, 2024]
    
    listings_data = [
        {"quantity": 150, "price": 2500, "vintage": 2024, "project_type": "Renewable Energy", "seller_idx": 0},
        {"quantity": 200, "price": 3000, "vintage": 2023, "project_type": "Forestry", "seller_idx": 1},
        {"quantity": 100, "price": 2800, "vintage": 2024, "project_type": "Energy Efficiency", "seller_idx": 0},
        {"quantity": 75, "price": 2200, "vintage": 2022, "project_type": "Renewable Energy", "seller_idx": 2},
        {"quantity": 180, "price": 3200, "vintage": 2024, "project_type": "Forestry", "seller_idx": 1},
        {"quantity": 120, "price": 2700, "vintage": 2023, "project_type": "Green Hydrogen", "seller_idx": 2},
        {"quantity": 90, "price": 2400, "vintage": 2023, "project_type": "Energy Efficiency", "seller_idx": 0},
        {"quantity": 160, "price": 3100, "vintage": 2024, "project_type": "Renewable Energy", "seller_idx": 0},
        {"quantity": 140, "price": 2900, "vintage": 2022, "project_type": "Forestry", "seller_idx": 1},
        {"quantity": 110, "price": 2600, "vintage": 2024, "project_type": "Green Hydrogen", "seller_idx": 2},
    ]
    
    for listing_data in listings_data:
        listing = CreditListing(
            seller_id=seller_users[listing_data["seller_idx"]].id,
            quantity=listing_data["quantity"],
            price_per_credit=listing_data["price"],
            vintage=listing_data["vintage"],
            project_type=listing_data["project_type"],
            verification_status="verified",
            is_active=True,
            description=f"High-quality carbon credits from {listing_data['project_type']} project"
        )
        db.add(listing)
    
    await db.commit()
    print(f"✅ Seeded {len(buyers)} buyers, {len(sellers)} sellers, and {len(listings_data)} listings")
