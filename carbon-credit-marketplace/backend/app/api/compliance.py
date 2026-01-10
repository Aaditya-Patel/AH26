"""
Compliance API endpoints for tracking emission targets and compliance status
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import math

from app.database import get_db
from app.models.models import (
    User, ComplianceRecord, CreditRetirement, CreditAccount, CreditTransaction, Notification
)
from app.schemas.schemas import (
    ComplianceRecordCreate, ComplianceRecordResponse, ComplianceSubmit, ComplianceSummary
)
from app.core.security import get_current_user_id

router = APIRouter()


# Sector-specific emission intensity targets (tCO2e per unit of product)
SECTOR_TARGETS = {
    "cement": {
        "baseline_intensity": 0.85,  # tCO2e per tonne of cement
        "target_reduction": 0.05,  # 5% reduction
        "unit": "tonne of cement"
    },
    "iron_steel": {
        "baseline_intensity": 2.1,  # tCO2e per tonne of steel
        "target_reduction": 0.06,  # 6% reduction
        "unit": "tonne of steel"
    },
    "textiles": {
        "baseline_intensity": 0.4,  # tCO2e per 1000 metres
        "target_reduction": 0.04,  # 4% reduction
        "unit": "1000 metres"
    },
    "aluminium": {
        "baseline_intensity": 12.5,  # tCO2e per tonne of aluminium
        "target_reduction": 0.05,  # 5% reduction
        "unit": "tonne of aluminium"
    },
    "chlor_alkali": {
        "baseline_intensity": 0.75,  # tCO2e per tonne of caustic soda
        "target_reduction": 0.07,  # 7% reduction
        "unit": "tonne of caustic soda"
    },
    "fertilizer": {
        "baseline_intensity": 1.8,  # tCO2e per tonne of fertilizer
        "target_reduction": 0.05,  # 5% reduction
        "unit": "tonne of fertilizer"
    },
    "pulp_paper": {
        "baseline_intensity": 0.9,  # tCO2e per tonne of paper
        "target_reduction": 0.08,  # 8% reduction
        "unit": "tonne of paper"
    },
    "petrochemicals": {
        "baseline_intensity": 1.5,  # tCO2e per tonne of product
        "target_reduction": 0.04,  # 4% reduction
        "unit": "tonne of product"
    },
    "petroleum_refining": {
        "baseline_intensity": 0.35,  # tCO2e per tonne of crude processed
        "target_reduction": 0.04,  # 4% reduction
        "unit": "tonne of crude"
    }
}


async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    notification_type: str,
    title: str,
    message: str,
    reference_type: str = None,
    reference_id: UUID = None
):
    """Create a notification for a user"""
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        reference_type=reference_type,
        reference_id=reference_id
    )
    db.add(notification)


async def get_or_create_credit_account(db: AsyncSession, user_id: UUID) -> CreditAccount:
    """Get or create a credit account for a user"""
    result = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user_id)
    )
    account = result.scalar_one_or_none()
    
    if not account:
        account = CreditAccount(user_id=user_id)
        db.add(account)
        await db.commit()
        await db.refresh(account)
    
    return account


# ==================== COMPLIANCE RECORD ENDPOINTS ====================

@router.post("/records", response_model=ComplianceRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_compliance_record(
    record_data: ComplianceRecordCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new compliance record for a period"""
    user_uuid = UUID(user_id)
    
    # Check if record already exists for this period
    result = await db.execute(
        select(ComplianceRecord).where(
            and_(
                ComplianceRecord.user_id == user_uuid,
                ComplianceRecord.compliance_period == record_data.compliance_period
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Compliance record already exists for period {record_data.compliance_period}"
        )
    
    # Get sector targets
    sector_config = SECTOR_TARGETS.get(record_data.sector.lower().replace(" ", "_"))
    
    baseline_intensity = record_data.baseline_emission_intensity
    target_intensity = record_data.target_emission_intensity
    
    if sector_config:
        if not baseline_intensity:
            baseline_intensity = sector_config["baseline_intensity"]
        if not target_intensity:
            target_intensity = baseline_intensity * (1 - sector_config["target_reduction"])
    
    # Create record
    record = ComplianceRecord(
        user_id=user_uuid,
        compliance_period=record_data.compliance_period,
        sector=record_data.sector,
        target_emission_intensity=target_intensity,
        baseline_emission_intensity=baseline_intensity,
        deadline=record_data.deadline or (datetime.now() + timedelta(days=365)),
        status="pending"
    )
    
    db.add(record)
    await db.commit()
    await db.refresh(record)
    
    return ComplianceRecordResponse(
        id=record.id,
        user_id=record.user_id,
        compliance_period=record.compliance_period,
        sector=record.sector,
        target_emission_intensity=record.target_emission_intensity,
        baseline_emission_intensity=record.baseline_emission_intensity,
        actual_emissions=record.actual_emissions,
        actual_production=record.actual_production,
        actual_emission_intensity=record.actual_emission_intensity,
        credits_required=record.credits_required,
        credits_earned=record.credits_earned,
        credits_surrendered=record.credits_surrendered,
        credits_shortfall=record.credits_shortfall,
        status=record.status,
        deadline=record.deadline,
        submitted_at=record.submitted_at,
        verified_at=record.verified_at,
        penalty_amount=record.penalty_amount,
        penalty_paid=record.penalty_paid,
        created_at=record.created_at
    )


@router.get("/records", response_model=List[ComplianceRecordResponse])
async def get_compliance_records(
    compliance_period: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all compliance records for the current user"""
    query = select(ComplianceRecord).where(ComplianceRecord.user_id == user_id)
    
    if compliance_period:
        query = query.where(ComplianceRecord.compliance_period == compliance_period)
    if status:
        query = query.where(ComplianceRecord.status == status)
    
    query = query.order_by(ComplianceRecord.created_at.desc())
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    return [
        ComplianceRecordResponse(
            id=rec.id,
            user_id=rec.user_id,
            compliance_period=rec.compliance_period,
            sector=rec.sector,
            target_emission_intensity=rec.target_emission_intensity,
            baseline_emission_intensity=rec.baseline_emission_intensity,
            actual_emissions=rec.actual_emissions,
            actual_production=rec.actual_production,
            actual_emission_intensity=rec.actual_emission_intensity,
            credits_required=rec.credits_required,
            credits_earned=rec.credits_earned,
            credits_surrendered=rec.credits_surrendered,
            credits_shortfall=rec.credits_shortfall,
            status=rec.status,
            deadline=rec.deadline,
            submitted_at=rec.submitted_at,
            verified_at=rec.verified_at,
            penalty_amount=rec.penalty_amount,
            penalty_paid=rec.penalty_paid,
            created_at=rec.created_at
        )
        for rec in records
    ]


@router.get("/records/{record_id}", response_model=ComplianceRecordResponse)
async def get_compliance_record(
    record_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific compliance record"""
    result = await db.execute(
        select(ComplianceRecord).where(
            and_(
                ComplianceRecord.id == record_id,
                ComplianceRecord.user_id == user_id
            )
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance record not found"
        )
    
    return ComplianceRecordResponse(
        id=record.id,
        user_id=record.user_id,
        compliance_period=record.compliance_period,
        sector=record.sector,
        target_emission_intensity=record.target_emission_intensity,
        baseline_emission_intensity=record.baseline_emission_intensity,
        actual_emissions=record.actual_emissions,
        actual_production=record.actual_production,
        actual_emission_intensity=record.actual_emission_intensity,
        credits_required=record.credits_required,
        credits_earned=record.credits_earned,
        credits_surrendered=record.credits_surrendered,
        credits_shortfall=record.credits_shortfall,
        status=record.status,
        deadline=record.deadline,
        submitted_at=record.submitted_at,
        verified_at=record.verified_at,
        penalty_amount=record.penalty_amount,
        penalty_paid=record.penalty_paid,
        created_at=record.created_at
    )


@router.post("/records/{record_id}/submit", response_model=ComplianceRecordResponse)
async def submit_compliance_data(
    record_id: UUID,
    submit_data: ComplianceSubmit,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Submit actual emissions data for a compliance period"""
    user_uuid = UUID(user_id)
    
    result = await db.execute(
        select(ComplianceRecord).where(
            and_(
                ComplianceRecord.id == record_id,
                ComplianceRecord.user_id == user_uuid
            )
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance record not found"
        )
    
    if record.status not in ["pending", "at_risk"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit data for record with status: {record.status}"
        )
    
    # Calculate emission intensity
    actual_intensity = submit_data.actual_emissions / submit_data.actual_production if submit_data.actual_production > 0 else 0
    
    # Calculate credits required/earned
    credits_required = 0
    credits_earned = 0
    
    if record.target_emission_intensity:
        intensity_diff = actual_intensity - record.target_emission_intensity
        credits_value = intensity_diff * submit_data.actual_production
        
        if credits_value > 0:
            # Entity exceeded target, needs to buy credits
            credits_required = math.ceil(credits_value)
        else:
            # Entity beat target, earns credits
            credits_earned = math.floor(abs(credits_value))
    
    # Update record
    record.actual_emissions = submit_data.actual_emissions
    record.actual_production = submit_data.actual_production
    record.actual_emission_intensity = actual_intensity
    record.credits_required = credits_required
    record.credits_earned = credits_earned
    record.submitted_at = datetime.now()
    
    # Determine status
    if credits_required > 0:
        record.status = "non_compliant"
        record.credits_shortfall = credits_required - record.credits_surrendered
    elif credits_earned > 0:
        record.status = "compliant"
    else:
        record.status = "compliant"
    
    record.updated_at = datetime.now()
    
    # Create notification
    await create_notification(
        db,
        user_uuid,
        "compliance",
        "Compliance Data Submitted",
        f"Your compliance data for {record.compliance_period} has been submitted. Status: {record.status}",
        "compliance",
        record.id
    )
    
    await db.commit()
    await db.refresh(record)
    
    return ComplianceRecordResponse(
        id=record.id,
        user_id=record.user_id,
        compliance_period=record.compliance_period,
        sector=record.sector,
        target_emission_intensity=record.target_emission_intensity,
        baseline_emission_intensity=record.baseline_emission_intensity,
        actual_emissions=record.actual_emissions,
        actual_production=record.actual_production,
        actual_emission_intensity=record.actual_emission_intensity,
        credits_required=record.credits_required,
        credits_earned=record.credits_earned,
        credits_surrendered=record.credits_surrendered,
        credits_shortfall=record.credits_shortfall,
        status=record.status,
        deadline=record.deadline,
        submitted_at=record.submitted_at,
        verified_at=record.verified_at,
        penalty_amount=record.penalty_amount,
        penalty_paid=record.penalty_paid,
        created_at=record.created_at
    )


@router.post("/records/{record_id}/surrender-credits")
async def surrender_credits_for_compliance(
    record_id: UUID,
    amount: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Surrender credits to meet compliance requirements"""
    user_uuid = UUID(user_id)
    
    # Get compliance record
    result = await db.execute(
        select(ComplianceRecord).where(
            and_(
                ComplianceRecord.id == record_id,
                ComplianceRecord.user_id == user_uuid
            )
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance record not found"
        )
    
    if record.credits_shortfall <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No credits shortfall to surrender for"
        )
    
    # Get user's credit account
    account = await get_or_create_credit_account(db, user_uuid)
    
    if account.available_balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient credits. Available: {account.available_balance}, Required: {amount}"
        )
    
    # Create retirement record
    from app.models.models import CreditRetirement
    import secrets
    
    retirement = CreditRetirement(
        user_id=user_uuid,
        retirement_number=f"RET-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}",
        amount=amount,
        purpose="compliance",
        compliance_period=record.compliance_period,
        status="completed",
        retired_at=datetime.now()
    )
    db.add(retirement)
    
    # Update credit account
    balance_before = account.total_balance
    account.total_balance -= amount
    account.available_balance -= amount
    account.retired_balance += amount
    
    # Record credit transaction
    credit_txn = CreditTransaction(
        account_id=account.id,
        transaction_type="surrender",
        amount=-amount,
        balance_before=balance_before,
        balance_after=account.total_balance,
        reference_type="compliance",
        reference_id=record.id,
        description=f"Compliance surrender for {record.compliance_period}"
    )
    db.add(credit_txn)
    
    # Update compliance record
    record.credits_surrendered += amount
    record.credits_shortfall = max(0, record.credits_required - record.credits_surrendered)
    
    if record.credits_shortfall <= 0:
        record.status = "compliant"
        record.verified_at = datetime.now()
    
    record.updated_at = datetime.now()
    
    # Create notification
    await create_notification(
        db,
        user_uuid,
        "compliance",
        "Credits Surrendered",
        f"{amount} credits surrendered for compliance period {record.compliance_period}. Remaining shortfall: {record.credits_shortfall}",
        "compliance",
        record.id
    )
    
    await db.commit()
    
    return {
        "message": f"Successfully surrendered {amount} credits",
        "credits_surrendered": record.credits_surrendered,
        "credits_shortfall": record.credits_shortfall,
        "status": record.status
    }


@router.get("/summary", response_model=ComplianceSummary)
async def get_compliance_summary(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get compliance summary for the current user"""
    result = await db.execute(
        select(ComplianceRecord).where(ComplianceRecord.user_id == user_id)
    )
    records = result.scalars().all()
    
    total_periods = len(records)
    compliant_periods = sum(1 for r in records if r.status == "compliant")
    non_compliant_periods = sum(1 for r in records if r.status == "non_compliant")
    at_risk_periods = sum(1 for r in records if r.status == "at_risk")
    total_credits_required = sum(r.credits_required for r in records)
    total_credits_surrendered = sum(r.credits_surrendered for r in records)
    total_shortfall = sum(r.credits_shortfall for r in records)
    total_penalties = sum(r.penalty_amount for r in records)
    
    return ComplianceSummary(
        total_periods=total_periods,
        compliant_periods=compliant_periods,
        non_compliant_periods=non_compliant_periods,
        at_risk_periods=at_risk_periods,
        total_credits_required=total_credits_required,
        total_credits_surrendered=total_credits_surrendered,
        total_shortfall=total_shortfall,
        total_penalties=total_penalties
    )


@router.get("/sectors")
async def get_sector_targets():
    """Get emission intensity targets for all sectors"""
    return {
        sector: {
            "baseline_intensity": config["baseline_intensity"],
            "target_intensity": config["baseline_intensity"] * (1 - config["target_reduction"]),
            "target_reduction_percent": config["target_reduction"] * 100,
            "unit": config["unit"]
        }
        for sector, config in SECTOR_TARGETS.items()
    }
