"""
Market Data API endpoints for price tracking and analytics
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
from datetime import datetime, date, timedelta

from app.database import get_db
from app.models.models import (
    CreditListing, Transaction, PriceHistory, MarketStats, User
)
from app.schemas.schemas import (
    PriceHistoryResponse, MarketStatsResponse, MarketOverview, PriceChart
)
from app.core.security import get_current_user_id

router = APIRouter()


@router.get("/overview", response_model=MarketOverview)
async def get_market_overview(
    db: AsyncSession = Depends(get_db)
):
    """Get current market overview with key metrics"""
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # Get active listings
    listings_result = await db.execute(
        select(CreditListing).where(
            and_(
                CreditListing.is_active == True,
                CreditListing.available_quantity > 0
            )
        )
    )
    listings = listings_result.scalars().all()
    
    active_listings = len(listings)
    total_credits_available = sum(l.available_quantity for l in listings)
    
    # Calculate average price
    if listings:
        current_avg_price = sum(l.price_per_credit for l in listings) / len(listings)
    else:
        current_avg_price = 0
    
    # Get yesterday's average for price change calculation
    yesterday_result = await db.execute(
        select(func.avg(Transaction.price_per_credit)).where(
            func.date(Transaction.transaction_date) == yesterday
        )
    )
    yesterday_avg = yesterday_result.scalar() or current_avg_price
    
    price_change_24h = current_avg_price - yesterday_avg
    price_change_percent = (price_change_24h / yesterday_avg * 100) if yesterday_avg > 0 else 0
    
    # Get 24h volume and transactions
    day_ago = datetime.now() - timedelta(days=1)
    transactions_result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.transaction_date >= day_ago,
                Transaction.status == "completed"
            )
        )
    )
    recent_transactions = transactions_result.scalars().all()
    
    total_volume_24h = sum(t.quantity for t in recent_transactions)
    total_value_24h = sum(t.total_amount for t in recent_transactions)
    num_transactions_24h = len(recent_transactions)
    
    # Price by project type
    price_by_project_type = {}
    for listing in listings:
        if listing.project_type not in price_by_project_type:
            price_by_project_type[listing.project_type] = []
        price_by_project_type[listing.project_type].append(listing.price_per_credit)
    
    price_by_project_type = {
        k: sum(v) / len(v) for k, v in price_by_project_type.items()
    }
    
    # Price by vintage
    price_by_vintage = {}
    for listing in listings:
        if listing.vintage:
            if listing.vintage not in price_by_vintage:
                price_by_vintage[listing.vintage] = []
            price_by_vintage[listing.vintage].append(listing.price_per_credit)
    
    price_by_vintage = {
        k: sum(v) / len(v) for k, v in price_by_vintage.items()
    }
    
    return MarketOverview(
        current_avg_price=round(current_avg_price, 2),
        price_change_24h=round(price_change_24h, 2),
        price_change_percent=round(price_change_percent, 2),
        total_volume_24h=total_volume_24h,
        total_value_24h=round(total_value_24h, 2),
        num_transactions_24h=num_transactions_24h,
        active_listings=active_listings,
        total_credits_available=total_credits_available,
        price_by_project_type=price_by_project_type,
        price_by_vintage=price_by_vintage
    )


@router.get("/price-history", response_model=List[PriceHistoryResponse])
async def get_price_history(
    days: int = Query(30, ge=1, le=365),
    project_type: Optional[str] = Query(None),
    vintage: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get historical price data"""
    
    start_date = date.today() - timedelta(days=days)
    
    query = select(PriceHistory).where(PriceHistory.date >= start_date)
    
    if project_type:
        query = query.where(PriceHistory.project_type == project_type)
    if vintage:
        query = query.where(PriceHistory.vintage == vintage)
    
    query = query.order_by(PriceHistory.date.asc())
    
    result = await db.execute(query)
    history = result.scalars().all()
    
    return [
        PriceHistoryResponse(
            id=h.id,
            date=h.date,
            project_type=h.project_type,
            vintage=h.vintage,
            open_price=h.open_price,
            close_price=h.close_price,
            high_price=h.high_price,
            low_price=h.low_price,
            average_price=h.average_price,
            volume=h.volume,
            num_transactions=h.num_transactions
        )
        for h in history
    ]


@router.get("/price-chart", response_model=PriceChart)
async def get_price_chart(
    days: int = Query(30, ge=1, le=365),
    project_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get price chart data"""
    
    # Get transactions for the period
    start_date = datetime.now() - timedelta(days=days)
    
    query = select(Transaction).where(
        and_(
            Transaction.transaction_date >= start_date,
            Transaction.status == "completed"
        )
    )
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    # Group by date
    daily_data = {}
    for txn in transactions:
        txn_date = txn.transaction_date.date()
        if txn_date not in daily_data:
            daily_data[txn_date] = {"prices": [], "volumes": []}
        daily_data[txn_date]["prices"].append(txn.price_per_credit)
        daily_data[txn_date]["volumes"].append(txn.quantity)
    
    # Generate chart data
    dates = []
    prices = []
    volumes = []
    
    current_date = start_date.date()
    end_date = date.today()
    
    while current_date <= end_date:
        dates.append(current_date)
        if current_date in daily_data:
            prices.append(sum(daily_data[current_date]["prices"]) / len(daily_data[current_date]["prices"]))
            volumes.append(sum(daily_data[current_date]["volumes"]))
        else:
            # Use previous day's price or 0
            prices.append(prices[-1] if prices else 0)
            volumes.append(0)
        current_date += timedelta(days=1)
    
    return PriceChart(
        dates=dates,
        prices=[round(p, 2) for p in prices],
        volumes=volumes
    )


@router.get("/stats", response_model=MarketStatsResponse)
async def get_market_stats(
    date_str: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db)
):
    """Get market statistics for a specific date"""
    
    target_date = date.fromisoformat(date_str) if date_str else date.today()
    
    # Try to get existing stats
    result = await db.execute(
        select(MarketStats).where(MarketStats.date == target_date)
    )
    stats = result.scalar_one_or_none()
    
    if stats:
        return MarketStatsResponse(
            id=stats.id,
            date=stats.date,
            total_volume=stats.total_volume,
            total_value=stats.total_value,
            num_transactions=stats.num_transactions,
            avg_price=stats.avg_price,
            min_price=stats.min_price,
            max_price=stats.max_price,
            active_listings=stats.active_listings,
            total_credits_available=stats.total_credits_available,
            new_users=stats.new_users,
            active_buyers=stats.active_buyers,
            active_sellers=stats.active_sellers
        )
    
    # Calculate stats for the day
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = datetime.combine(target_date, datetime.max.time())
    
    # Get transactions for the day
    txn_result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.transaction_date >= day_start,
                Transaction.transaction_date <= day_end,
                Transaction.status == "completed"
            )
        )
    )
    transactions = txn_result.scalars().all()
    
    total_volume = sum(t.quantity for t in transactions)
    total_value = sum(t.total_amount for t in transactions)
    num_transactions = len(transactions)
    
    if transactions:
        prices = [t.price_per_credit for t in transactions]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
    else:
        avg_price = min_price = max_price = 0
    
    # Get active listings count
    listings_result = await db.execute(
        select(func.count(CreditListing.id)).where(CreditListing.is_active == True)
    )
    active_listings = listings_result.scalar() or 0
    
    # Get total credits available
    credits_result = await db.execute(
        select(func.sum(CreditListing.available_quantity)).where(CreditListing.is_active == True)
    )
    total_credits_available = credits_result.scalar() or 0
    
    # Get user stats
    users_result = await db.execute(
        select(func.count(User.id)).where(
            func.date(User.created_at) == target_date
        )
    )
    new_users = users_result.scalar() or 0
    
    # Active buyers/sellers (made transaction in last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    buyers_result = await db.execute(
        select(func.count(func.distinct(Transaction.buyer_id))).where(
            Transaction.transaction_date >= thirty_days_ago
        )
    )
    active_buyers = buyers_result.scalar() or 0
    
    sellers_result = await db.execute(
        select(func.count(func.distinct(Transaction.seller_id))).where(
            Transaction.transaction_date >= thirty_days_ago
        )
    )
    active_sellers = sellers_result.scalar() or 0
    
    # Create and save stats
    import uuid
    new_stats = MarketStats(
        id=uuid.uuid4(),
        date=target_date,
        total_volume=total_volume,
        total_value=total_value,
        num_transactions=num_transactions,
        avg_price=avg_price,
        min_price=min_price if min_price > 0 else None,
        max_price=max_price if max_price > 0 else None,
        active_listings=active_listings,
        total_credits_available=total_credits_available,
        new_users=new_users,
        active_buyers=active_buyers,
        active_sellers=active_sellers
    )
    
    db.add(new_stats)
    await db.commit()
    await db.refresh(new_stats)
    
    return MarketStatsResponse(
        id=new_stats.id,
        date=new_stats.date,
        total_volume=new_stats.total_volume,
        total_value=new_stats.total_value,
        num_transactions=new_stats.num_transactions,
        avg_price=new_stats.avg_price,
        min_price=new_stats.min_price,
        max_price=new_stats.max_price,
        active_listings=new_stats.active_listings,
        total_credits_available=new_stats.total_credits_available,
        new_users=new_stats.new_users,
        active_buyers=new_stats.active_buyers,
        active_sellers=new_stats.active_sellers
    )


@router.get("/listings-summary")
async def get_listings_summary(
    db: AsyncSession = Depends(get_db)
):
    """Get summary of available listings by category"""
    
    result = await db.execute(
        select(CreditListing).where(
            and_(
                CreditListing.is_active == True,
                CreditListing.available_quantity > 0
            )
        )
    )
    listings = result.scalars().all()
    
    # Group by project type
    by_project_type = {}
    for listing in listings:
        pt = listing.project_type or "Unknown"
        if pt not in by_project_type:
            by_project_type[pt] = {"count": 0, "total_credits": 0, "avg_price": 0, "prices": []}
        by_project_type[pt]["count"] += 1
        by_project_type[pt]["total_credits"] += listing.available_quantity
        by_project_type[pt]["prices"].append(listing.price_per_credit)
    
    for pt in by_project_type:
        by_project_type[pt]["avg_price"] = sum(by_project_type[pt]["prices"]) / len(by_project_type[pt]["prices"])
        del by_project_type[pt]["prices"]
    
    # Group by vintage
    by_vintage = {}
    for listing in listings:
        v = listing.vintage or 0
        if v not in by_vintage:
            by_vintage[v] = {"count": 0, "total_credits": 0, "avg_price": 0, "prices": []}
        by_vintage[v]["count"] += 1
        by_vintage[v]["total_credits"] += listing.available_quantity
        by_vintage[v]["prices"].append(listing.price_per_credit)
    
    for v in by_vintage:
        by_vintage[v]["avg_price"] = sum(by_vintage[v]["prices"]) / len(by_vintage[v]["prices"])
        del by_vintage[v]["prices"]
    
    # Overall stats
    total_listings = len(listings)
    total_credits = sum(l.available_quantity for l in listings)
    avg_price = sum(l.price_per_credit for l in listings) / len(listings) if listings else 0
    price_range = {
        "min": min(l.price_per_credit for l in listings) if listings else 0,
        "max": max(l.price_per_credit for l in listings) if listings else 0
    }
    
    return {
        "total_listings": total_listings,
        "total_credits_available": total_credits,
        "average_price": round(avg_price, 2),
        "price_range": price_range,
        "by_project_type": by_project_type,
        "by_vintage": by_vintage
    }
