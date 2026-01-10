"""
Seed database with mock data for demo
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User, CreditListing, CreditAccount
from app.core.security import get_password_hash
import random
import json


# Approved methodologies as per CCTS
APPROVED_METHODOLOGIES = [
    "Renewable Energy (including hydro and pumped storage)",
    "Green Hydrogen Production",
    "Industrial Energy Efficiency",
    "Landfill Methane Recovery",
    "Mangrove Afforestation and Reforestation",
    "Renewable Energy with Storage",
    "Offshore Wind",
    "Compressed Biogas"
]


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
            "sector": "cement",
            "gci_registration_id": "GCI-BYR-001",
            "pan_number": "AABCG1234A",
            "gstin": "29AABCG1234A1ZV"
        },
        {
            "email": "buyer2@demo.com",
            "password": "demo123",
            "user_type": "buyer",
            "company_name": "Sustainable Textiles Ltd.",
            "sector": "textiles",
            "gci_registration_id": "GCI-BYR-002",
            "pan_number": "AABCS5678B",
            "gstin": "29AABCS5678B1ZW"
        }
    ]
    
    buyer_users = []
    for buyer_data in buyers:
        buyer = User(
            email=buyer_data["email"],
            password_hash=get_password_hash(buyer_data["password"]),
            user_type=buyer_data["user_type"],
            company_name=buyer_data["company_name"],
            sector=buyer_data["sector"],
            gci_registration_id=buyer_data.get("gci_registration_id"),
            pan_number=buyer_data.get("pan_number"),
            gstin=buyer_data.get("gstin"),
            is_kyc_verified=True
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
            "sector": None,
            "gci_registration_id": "GCI-SLR-001",
            "pan_number": "AABCS9876C",
            "gstin": "29AABCS9876C1ZX"
        },
        {
            "email": "seller2@demo.com",
            "password": "demo123",
            "user_type": "seller",
            "company_name": "Forest Conservation Trust",
            "sector": None,
            "gci_registration_id": "GCI-SLR-002",
            "pan_number": "AABCF4321D",
            "gstin": "29AABCF4321D1ZY"
        },
        {
            "email": "seller3@demo.com",
            "password": "demo123",
            "user_type": "seller",
            "company_name": "Green Hydrogen Ventures",
            "sector": None,
            "gci_registration_id": "GCI-SLR-003",
            "pan_number": "AABCG8765E",
            "gstin": "29AABCG8765E1ZZ"
        }
    ]
    
    seller_users = []
    for seller_data in sellers:
        seller = User(
            email=seller_data["email"],
            password_hash=get_password_hash(seller_data["password"]),
            user_type=seller_data["user_type"],
            company_name=seller_data["company_name"],
            sector=seller_data["sector"],
            gci_registration_id=seller_data.get("gci_registration_id"),
            pan_number=seller_data.get("pan_number"),
            gstin=seller_data.get("gstin"),
            is_kyc_verified=True
        )
        db.add(seller)
        seller_users.append(seller)
    
    await db.commit()
    
    # Refresh to get IDs
    for buyer in buyer_users:
        await db.refresh(buyer)
    for seller in seller_users:
        await db.refresh(seller)
    
    # Create credit accounts for all users
    all_users = buyer_users + seller_users
    credit_accounts = []
    for idx, user in enumerate(all_users):
        # Sellers get initial credit balance
        initial_balance = 500 if user.user_type == "seller" else 0
        account = CreditAccount(
            user_id=user.id,
            total_balance=initial_balance,
            available_balance=initial_balance,
            locked_balance=0,
            retired_balance=0
        )
        db.add(account)
        credit_accounts.append(account)
    
    await db.commit()
    
    # Create credit listings with enhanced metadata
    listings_data = [
        {
            "quantity": 150, 
            "price": 2500, 
            "vintage": 2024, 
            "project_type": "Renewable Energy", 
            "seller_idx": 0,
            "methodology": "Renewable Energy (including hydro and pumped storage)",
            "project_location": "Rajasthan, India",
            "co_benefits": ["Local employment", "Grid stability", "Air quality improvement"],
            "additionality_score": 85,
            "permanence_score": 95
        },
        {
            "quantity": 200, 
            "price": 3000, 
            "vintage": 2023, 
            "project_type": "Forestry", 
            "seller_idx": 1,
            "methodology": "Mangrove Afforestation and Reforestation",
            "project_location": "Sundarbans, West Bengal, India",
            "co_benefits": ["Biodiversity protection", "Coastal protection", "Community livelihood"],
            "additionality_score": 90,
            "permanence_score": 80
        },
        {
            "quantity": 100, 
            "price": 2800, 
            "vintage": 2024, 
            "project_type": "Energy Efficiency", 
            "seller_idx": 0,
            "methodology": "Industrial Energy Efficiency",
            "project_location": "Gujarat, India",
            "co_benefits": ["Reduced energy costs", "Technology transfer"],
            "additionality_score": 75,
            "permanence_score": 90
        },
        {
            "quantity": 75, 
            "price": 2200, 
            "vintage": 2022, 
            "project_type": "Renewable Energy", 
            "seller_idx": 2,
            "methodology": "Offshore Wind",
            "project_location": "Tamil Nadu Coast, India",
            "co_benefits": ["Marine ecosystem protection", "Energy independence"],
            "additionality_score": 88,
            "permanence_score": 92
        },
        {
            "quantity": 180, 
            "price": 3200, 
            "vintage": 2024, 
            "project_type": "Forestry", 
            "seller_idx": 1,
            "methodology": "Mangrove Afforestation and Reforestation",
            "project_location": "Kerala Backwaters, India",
            "co_benefits": ["Biodiversity", "Tourism", "Fisheries support"],
            "additionality_score": 92,
            "permanence_score": 78
        },
        {
            "quantity": 120, 
            "price": 2700, 
            "vintage": 2023, 
            "project_type": "Green Hydrogen", 
            "seller_idx": 2,
            "methodology": "Green Hydrogen Production",
            "project_location": "Maharashtra, India",
            "co_benefits": ["Clean fuel production", "Industrial decarbonization"],
            "additionality_score": 95,
            "permanence_score": 98
        },
        {
            "quantity": 90, 
            "price": 2400, 
            "vintage": 2023, 
            "project_type": "Energy Efficiency", 
            "seller_idx": 0,
            "methodology": "Industrial Energy Efficiency",
            "project_location": "Karnataka, India",
            "co_benefits": ["Operational savings", "Skill development"],
            "additionality_score": 72,
            "permanence_score": 88
        },
        {
            "quantity": 160, 
            "price": 3100, 
            "vintage": 2024, 
            "project_type": "Renewable Energy", 
            "seller_idx": 0,
            "methodology": "Renewable Energy with Storage",
            "project_location": "Andhra Pradesh, India",
            "co_benefits": ["Grid reliability", "Peak load management"],
            "additionality_score": 87,
            "permanence_score": 94
        },
        {
            "quantity": 140, 
            "price": 2900, 
            "vintage": 2022, 
            "project_type": "Forestry", 
            "seller_idx": 1,
            "methodology": "Mangrove Afforestation and Reforestation",
            "project_location": "Odisha Coast, India",
            "co_benefits": ["Storm protection", "Fish nursery habitat"],
            "additionality_score": 88,
            "permanence_score": 75
        },
        {
            "quantity": 110, 
            "price": 2600, 
            "vintage": 2024, 
            "project_type": "Green Hydrogen", 
            "seller_idx": 2,
            "methodology": "Green Hydrogen Production",
            "project_location": "Gujarat, India",
            "co_benefits": ["Industrial transition support", "Export potential"],
            "additionality_score": 93,
            "permanence_score": 97
        },
    ]
    
    for idx, listing_data in enumerate(listings_data):
        serial_start = f"CCC-{listing_data['vintage']}-{idx+1:04d}-0001"
        serial_end = f"CCC-{listing_data['vintage']}-{idx+1:04d}-{listing_data['quantity']:04d}"
        
        listing = CreditListing(
            seller_id=seller_users[listing_data["seller_idx"]].id,
            quantity=listing_data["quantity"],
            available_quantity=listing_data["quantity"],
            price_per_credit=listing_data["price"],
            vintage=listing_data["vintage"],
            project_type=listing_data["project_type"],
            verification_status="verified",
            is_active=True,
            description=f"High-quality carbon credits from {listing_data['project_type']} project",
            methodology=listing_data.get("methodology"),
            project_location=listing_data.get("project_location"),
            co_benefits=json.dumps(listing_data.get("co_benefits", [])),
            additionality_score=listing_data.get("additionality_score"),
            permanence_score=listing_data.get("permanence_score"),
            serial_number_start=serial_start,
            serial_number_end=serial_end
        )
        db.add(listing)
    
    await db.commit()
    print(f"✅ Seeded {len(buyers)} buyers, {len(sellers)} sellers, {len(listings_data)} listings, and {len(credit_accounts)} credit accounts")
