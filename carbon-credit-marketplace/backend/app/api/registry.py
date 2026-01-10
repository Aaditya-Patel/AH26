"""
Credit Registry API endpoints for managing credit accounts, balances, transfers, and retirements
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import secrets

from app.database import get_db
from app.models.models import (
    User, CreditAccount, CreditTransaction, CreditIssuance, CreditRetirement, Notification
)
from app.schemas.schemas import (
    CreditAccountResponse, CreditTransactionResponse,
    CreditTransferRequest, CreditRetirementRequest, CreditRetirementResponse,
    CreditIssuanceResponse
)
from app.core.security import get_current_user_id

router = APIRouter()


def generate_retirement_number() -> str:
    """Generate a unique retirement number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = secrets.token_hex(4).upper()
    return f"RET-{timestamp}-{random_suffix}"


def generate_issuance_number() -> str:
    """Generate a unique issuance number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = secrets.token_hex(4).upper()
    return f"ISS-{timestamp}-{random_suffix}"


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


# ==================== CREDIT ACCOUNT ENDPOINTS ====================

@router.get("/account", response_model=CreditAccountResponse)
async def get_my_credit_account(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get the current user's credit account"""
    account = await get_or_create_credit_account(db, UUID(user_id))
    
    return CreditAccountResponse(
        id=account.id,
        user_id=account.user_id,
        total_balance=account.total_balance,
        available_balance=account.available_balance,
        locked_balance=account.locked_balance,
        retired_balance=account.retired_balance,
        created_at=account.created_at,
        updated_at=account.updated_at
    )


@router.get("/transactions", response_model=List[CreditTransactionResponse])
async def get_credit_transactions(
    transaction_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get credit transaction history for the current user"""
    # Get user's account
    account = await get_or_create_credit_account(db, UUID(user_id))
    
    # Build query
    query = select(CreditTransaction).where(CreditTransaction.account_id == account.id)
    
    if transaction_type:
        query = query.where(CreditTransaction.transaction_type == transaction_type)
    
    query = query.order_by(CreditTransaction.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return [
        CreditTransactionResponse(
            id=txn.id,
            account_id=txn.account_id,
            transaction_type=txn.transaction_type,
            amount=txn.amount,
            balance_before=txn.balance_before,
            balance_after=txn.balance_after,
            reference_type=txn.reference_type,
            reference_id=txn.reference_id,
            description=txn.description,
            created_at=txn.created_at
        )
        for txn in transactions
    ]


# ==================== CREDIT TRANSFER ENDPOINTS ====================

@router.post("/transfer", response_model=CreditTransactionResponse)
async def transfer_credits(
    transfer_data: CreditTransferRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Transfer credits to another user"""
    user_uuid = UUID(user_id)
    
    # Get sender's account
    sender_account = await get_or_create_credit_account(db, user_uuid)
    
    # Check sufficient balance
    if sender_account.available_balance < transfer_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: {sender_account.available_balance}, Requested: {transfer_data.amount}"
        )
    
    # Find recipient by email
    result = await db.execute(
        select(User).where(User.email == transfer_data.recipient_email)
    )
    recipient = result.scalar_one_or_none()
    
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipient with email {transfer_data.recipient_email} not found"
        )
    
    if str(recipient.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot transfer credits to yourself"
        )
    
    # Get recipient's account
    recipient_account = await get_or_create_credit_account(db, recipient.id)
    
    # Deduct from sender
    sender_balance_before = sender_account.total_balance
    sender_account.total_balance -= transfer_data.amount
    sender_account.available_balance -= transfer_data.amount
    
    # Record sender's transaction
    sender_txn = CreditTransaction(
        account_id=sender_account.id,
        transaction_type="transfer",
        amount=-transfer_data.amount,
        balance_before=sender_balance_before,
        balance_after=sender_account.total_balance,
        reference_type="user",
        reference_id=recipient.id,
        description=transfer_data.description or f"Transfer to {recipient.company_name}"
    )
    db.add(sender_txn)
    
    # Add to recipient
    recipient_balance_before = recipient_account.total_balance
    recipient_account.total_balance += transfer_data.amount
    recipient_account.available_balance += transfer_data.amount
    
    # Record recipient's transaction
    recipient_txn = CreditTransaction(
        account_id=recipient_account.id,
        transaction_type="transfer",
        amount=transfer_data.amount,
        balance_before=recipient_balance_before,
        balance_after=recipient_account.total_balance,
        reference_type="user",
        reference_id=user_uuid,
        description=transfer_data.description or f"Transfer from sender"
    )
    db.add(recipient_txn)
    
    # Get sender info for notification
    result = await db.execute(select(User).where(User.id == user_uuid))
    sender = result.scalar_one_or_none()
    
    # Create notifications
    await create_notification(
        db,
        recipient.id,
        "credit_transfer",
        "Credits Received",
        f"You received {transfer_data.amount} credits from {sender.company_name if sender else 'a user'}.",
        "credit_transaction",
        recipient_txn.id
    )
    
    await db.commit()
    await db.refresh(sender_txn)
    
    return CreditTransactionResponse(
        id=sender_txn.id,
        account_id=sender_txn.account_id,
        transaction_type=sender_txn.transaction_type,
        amount=sender_txn.amount,
        balance_before=sender_txn.balance_before,
        balance_after=sender_txn.balance_after,
        reference_type=sender_txn.reference_type,
        reference_id=sender_txn.reference_id,
        description=sender_txn.description,
        created_at=sender_txn.created_at
    )


# ==================== CREDIT RETIREMENT ENDPOINTS ====================

@router.post("/retire", response_model=CreditRetirementResponse)
async def retire_credits(
    retirement_data: CreditRetirementRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Retire credits for compliance or voluntary purposes.
    Retired credits are permanently removed from circulation.
    """
    user_uuid = UUID(user_id)
    
    # Get user's account
    account = await get_or_create_credit_account(db, user_uuid)
    
    # Check sufficient balance
    if account.available_balance < retirement_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: {account.available_balance}, Requested: {retirement_data.amount}"
        )
    
    # Create retirement record
    retirement = CreditRetirement(
        user_id=user_uuid,
        retirement_number=generate_retirement_number(),
        amount=retirement_data.amount,
        purpose=retirement_data.purpose,
        compliance_period=retirement_data.compliance_period,
        beneficiary=retirement_data.beneficiary,
        status="completed",
        retired_at=datetime.now()
    )
    db.add(retirement)
    
    # Update account balance
    balance_before = account.total_balance
    account.total_balance -= retirement_data.amount
    account.available_balance -= retirement_data.amount
    account.retired_balance += retirement_data.amount
    
    # Record credit transaction
    credit_txn = CreditTransaction(
        account_id=account.id,
        transaction_type="retirement",
        amount=-retirement_data.amount,
        balance_before=balance_before,
        balance_after=account.total_balance,
        reference_type="retirement",
        reference_id=retirement.id,
        description=f"Credit retirement for {retirement_data.purpose}"
    )
    db.add(credit_txn)
    
    # Create notification
    await create_notification(
        db,
        user_uuid,
        "credit_retirement",
        "Credits Retired",
        f"{retirement_data.amount} credits have been retired for {retirement_data.purpose}. Retirement number: {retirement.retirement_number}",
        "retirement",
        retirement.id
    )
    
    await db.commit()
    await db.refresh(retirement)
    
    return CreditRetirementResponse(
        id=retirement.id,
        user_id=retirement.user_id,
        retirement_number=retirement.retirement_number,
        amount=retirement.amount,
        purpose=retirement.purpose,
        compliance_period=retirement.compliance_period,
        beneficiary=retirement.beneficiary,
        certificate_url=retirement.certificate_url,
        status=retirement.status,
        retired_at=retirement.retired_at,
        created_at=retirement.created_at
    )


@router.get("/retirements", response_model=List[CreditRetirementResponse])
async def get_retirements(
    purpose: Optional[str] = Query(None),
    compliance_period: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get retirement history for the current user"""
    query = select(CreditRetirement).where(CreditRetirement.user_id == user_id)
    
    if purpose:
        query = query.where(CreditRetirement.purpose == purpose)
    if compliance_period:
        query = query.where(CreditRetirement.compliance_period == compliance_period)
    
    query = query.order_by(CreditRetirement.created_at.desc())
    
    result = await db.execute(query)
    retirements = result.scalars().all()
    
    return [
        CreditRetirementResponse(
            id=ret.id,
            user_id=ret.user_id,
            retirement_number=ret.retirement_number,
            amount=ret.amount,
            purpose=ret.purpose,
            compliance_period=ret.compliance_period,
            beneficiary=ret.beneficiary,
            certificate_url=ret.certificate_url,
            status=ret.status,
            retired_at=ret.retired_at,
            created_at=ret.created_at
        )
        for ret in retirements
    ]


@router.get("/retirements/{retirement_id}", response_model=CreditRetirementResponse)
async def get_retirement(
    retirement_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific retirement record"""
    result = await db.execute(
        select(CreditRetirement).where(
            and_(
                CreditRetirement.id == retirement_id,
                CreditRetirement.user_id == user_id
            )
        )
    )
    retirement = result.scalar_one_or_none()
    
    if not retirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Retirement record not found"
        )
    
    return CreditRetirementResponse(
        id=retirement.id,
        user_id=retirement.user_id,
        retirement_number=retirement.retirement_number,
        amount=retirement.amount,
        purpose=retirement.purpose,
        compliance_period=retirement.compliance_period,
        beneficiary=retirement.beneficiary,
        certificate_url=retirement.certificate_url,
        status=retirement.status,
        retired_at=retirement.retired_at,
        created_at=retirement.created_at
    )


# ==================== CREDIT ISSUANCE ENDPOINTS ====================

@router.get("/issuances", response_model=List[CreditIssuanceResponse])
async def get_issuances(
    status: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get credit issuance history for the current user"""
    query = select(CreditIssuance).where(CreditIssuance.user_id == user_id)
    
    if status:
        query = query.where(CreditIssuance.status == status)
    
    query = query.order_by(CreditIssuance.created_at.desc())
    
    result = await db.execute(query)
    issuances = result.scalars().all()
    
    return [
        CreditIssuanceResponse(
            id=iss.id,
            user_id=iss.user_id,
            project_id=iss.project_id,
            issuance_number=iss.issuance_number,
            issuer=iss.issuer,
            amount=iss.amount,
            vintage=iss.vintage,
            project_type=iss.project_type,
            methodology=iss.methodology,
            status=iss.status,
            issuance_date=iss.issuance_date,
            expiry_date=iss.expiry_date,
            created_at=iss.created_at
        )
        for iss in issuances
    ]


# ==================== ADMIN/DEMO ENDPOINTS ====================

@router.post("/demo/issue-credits", response_model=CreditIssuanceResponse)
async def demo_issue_credits(
    amount: float,
    project_type: str = "Renewable Energy",
    vintage: int = 2024,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Demo endpoint to simulate credit issuance.
    In production, this would be handled through BEE integration.
    """
    user_uuid = UUID(user_id)
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Typically only sellers can receive issuances
    if user.user_type != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can receive credit issuances"
        )
    
    # Create issuance record
    issuance = CreditIssuance(
        user_id=user_uuid,
        issuance_number=generate_issuance_number(),
        issuer="Demo System",
        amount=amount,
        vintage=vintage,
        project_type=project_type,
        methodology="Demo Methodology",
        status="approved",
        issuance_date=datetime.now()
    )
    db.add(issuance)
    
    # Update credit account
    account = await get_or_create_credit_account(db, user_uuid)
    balance_before = account.total_balance
    account.total_balance += amount
    account.available_balance += amount
    
    # Record credit transaction
    credit_txn = CreditTransaction(
        account_id=account.id,
        transaction_type="issuance",
        amount=amount,
        balance_before=balance_before,
        balance_after=account.total_balance,
        reference_type="issuance",
        reference_id=issuance.id,
        description=f"Credit issuance: {project_type} - Vintage {vintage}"
    )
    db.add(credit_txn)
    
    # Create notification
    await create_notification(
        db,
        user_uuid,
        "credit_issuance",
        "Credits Issued",
        f"{amount} credits have been issued to your account. Issuance number: {issuance.issuance_number}",
        "issuance",
        issuance.id
    )
    
    await db.commit()
    await db.refresh(issuance)
    
    return CreditIssuanceResponse(
        id=issuance.id,
        user_id=issuance.user_id,
        project_id=issuance.project_id,
        issuance_number=issuance.issuance_number,
        issuer=issuance.issuer,
        amount=issuance.amount,
        vintage=issuance.vintage,
        project_type=issuance.project_type,
        methodology=issuance.methodology,
        status=issuance.status,
        issuance_date=issuance.issuance_date,
        expiry_date=issuance.expiry_date,
        created_at=issuance.created_at
    )
