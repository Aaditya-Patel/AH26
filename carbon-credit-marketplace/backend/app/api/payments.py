"""
Payment API endpoints for handling payments and escrow
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from uuid import UUID
from datetime import datetime
import secrets

from app.database import get_db
from app.models.models import (
    User, Transaction, Payment, CreditListing,
    CreditAccount, CreditTransaction, Notification
)
from app.schemas.schemas import (
    PaymentInitiate, PaymentResponse, PaymentVerify, PaymentRefund
)
from app.core.security import get_current_user_id
from app.config import get_settings

router = APIRouter()
settings = get_settings()


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


async def transfer_credits(
    db: AsyncSession,
    from_user_id: UUID,
    to_user_id: UUID,
    amount: float,
    transaction_id: UUID,
    description: str
):
    """Transfer credits from one account to another"""
    # Get or create accounts
    from_account = await get_or_create_credit_account(db, from_user_id)
    to_account = await get_or_create_credit_account(db, to_user_id)
    
    # Check if seller has enough credits
    if from_account.available_balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seller does not have enough credits"
        )
    
    # Deduct from seller
    from_balance_before = from_account.total_balance
    from_account.total_balance -= amount
    from_account.available_balance -= amount
    
    # Record seller's credit transaction
    from_credit_txn = CreditTransaction(
        account_id=from_account.id,
        transaction_type="sale",
        amount=-amount,
        balance_before=from_balance_before,
        balance_after=from_account.total_balance,
        reference_type="transaction",
        reference_id=transaction_id,
        description=description
    )
    db.add(from_credit_txn)
    
    # Add to buyer
    to_balance_before = to_account.total_balance
    to_account.total_balance += amount
    to_account.available_balance += amount
    
    # Record buyer's credit transaction
    to_credit_txn = CreditTransaction(
        account_id=to_account.id,
        transaction_type="purchase",
        amount=amount,
        balance_before=to_balance_before,
        balance_after=to_account.total_balance,
        reference_type="transaction",
        reference_id=transaction_id,
        description=description
    )
    db.add(to_credit_txn)


@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    payment_data: PaymentInitiate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiate payment for a transaction.
    This creates a payment order with the payment gateway (simulated for MVP).
    """
    # Get the transaction
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.id == payment_data.transaction_id,
                Transaction.buyer_id == user_id
            )
        )
    )
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if txn.status != "payment_pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction is not in payment_pending status. Current status: {txn.status}"
        )
    
    # Get the payment record
    result = await db.execute(
        select(Payment).where(Payment.transaction_id == txn.id)
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    # Simulate payment gateway order creation
    # In production, this would integrate with Razorpay/Stripe
    gateway_order_id = f"order_{secrets.token_hex(12)}"
    
    payment.payment_gateway = "razorpay_simulated"
    payment.gateway_order_id = gateway_order_id
    payment.status = "processing"
    payment.updated_at = datetime.now()
    
    await db.commit()
    await db.refresh(payment)
    
    return PaymentResponse(
        id=payment.id,
        transaction_id=payment.transaction_id,
        payment_gateway=payment.payment_gateway,
        gateway_order_id=payment.gateway_order_id,
        gateway_payment_id=payment.gateway_payment_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_method=payment.payment_method,
        escrow_status=payment.escrow_status,
        escrow_released_at=payment.escrow_released_at,
        refund_amount=payment.refund_amount,
        refunded_at=payment.refunded_at,
        created_at=payment.created_at
    )


@router.post("/verify", response_model=PaymentResponse)
async def verify_payment(
    payment_data: PaymentVerify,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify payment after payment gateway callback.
    For MVP, this simulates successful payment verification.
    """
    # Get the transaction
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.id == payment_data.transaction_id,
                Transaction.buyer_id == user_id
            )
        )
    )
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Get the payment record
    result = await db.execute(
        select(Payment).where(Payment.transaction_id == txn.id)
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    # Verify gateway order ID matches
    if payment.gateway_order_id != payment_data.gateway_order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gateway order ID"
        )
    
    # In production, verify signature with payment gateway
    # For MVP, we simulate successful verification
    
    # Update payment
    payment.gateway_payment_id = payment_data.gateway_payment_id
    payment.gateway_signature = payment_data.gateway_signature
    payment.status = "completed"
    payment.escrow_status = "in_escrow"
    payment.updated_at = datetime.now()
    
    # Update transaction
    txn.status = "payment_completed"
    txn.payment_completed_at = datetime.now()
    txn.updated_at = datetime.now()
    
    # Create notification for seller
    await create_notification(
        db,
        txn.seller_id,
        "payment",
        "Payment Received",
        f"Payment of ₹{txn.total_amount:,.2f} for transaction {txn.transaction_number} has been received and is in escrow.",
        "transaction",
        txn.id
    )
    
    await db.commit()
    await db.refresh(payment)
    
    return PaymentResponse(
        id=payment.id,
        transaction_id=payment.transaction_id,
        payment_gateway=payment.payment_gateway,
        gateway_order_id=payment.gateway_order_id,
        gateway_payment_id=payment.gateway_payment_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_method=payment.payment_method,
        escrow_status=payment.escrow_status,
        escrow_released_at=payment.escrow_released_at,
        refund_amount=payment.refund_amount,
        refunded_at=payment.refunded_at,
        created_at=payment.created_at
    )


@router.post("/simulate-complete/{transaction_id}", response_model=PaymentResponse)
async def simulate_payment_complete(
    transaction_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulate complete payment flow for testing/demo purposes.
    This endpoint simulates payment, escrow, and credit transfer in one step.
    """
    # Get the transaction
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.id == transaction_id,
                Transaction.buyer_id == user_id
            )
        )
    )
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if txn.status not in ["payment_pending", "payment_completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction cannot be completed. Current status: {txn.status}"
        )
    
    # Get the payment record
    result = await db.execute(
        select(Payment).where(Payment.transaction_id == txn.id)
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    # Simulate payment completion
    payment.payment_gateway = "simulated"
    payment.gateway_order_id = f"order_{secrets.token_hex(8)}"
    payment.gateway_payment_id = f"pay_{secrets.token_hex(8)}"
    payment.status = "completed"
    payment.payment_method = "simulated"
    payment.escrow_status = "released"
    payment.escrow_released_at = datetime.now()
    payment.updated_at = datetime.now()
    
    # Transfer credits
    await transfer_credits(
        db,
        txn.seller_id,
        txn.buyer_id,
        txn.quantity,
        txn.id,
        f"Purchase from transaction {txn.transaction_number}"
    )
    
    # Update transaction
    txn.status = "completed"
    txn.payment_completed_at = datetime.now()
    txn.credits_transferred_at = datetime.now()
    txn.completed_at = datetime.now()
    txn.updated_at = datetime.now()
    
    # Update listing - deactivate if fully sold
    result = await db.execute(
        select(CreditListing).where(CreditListing.id == txn.listing_id)
    )
    listing = result.scalar_one_or_none()
    if listing and listing.available_quantity <= 0:
        listing.is_active = False
    
    # Get buyer and seller info
    buyer_result = await db.execute(select(User).where(User.id == txn.buyer_id))
    buyer = buyer_result.scalar_one_or_none()
    
    seller_result = await db.execute(select(User).where(User.id == txn.seller_id))
    seller = seller_result.scalar_one_or_none()
    
    # Create notifications
    await create_notification(
        db,
        txn.buyer_id,
        "transaction",
        "Transaction Completed",
        f"Your purchase of {txn.quantity} credits has been completed. Credits have been added to your account.",
        "transaction",
        txn.id
    )
    
    await create_notification(
        db,
        txn.seller_id,
        "transaction",
        "Sale Completed",
        f"Sale of {txn.quantity} credits to {buyer.company_name if buyer else 'buyer'} has been completed. Payment of ₹{txn.total_amount:,.2f} will be released.",
        "transaction",
        txn.id
    )
    
    await db.commit()
    await db.refresh(payment)
    
    return PaymentResponse(
        id=payment.id,
        transaction_id=payment.transaction_id,
        payment_gateway=payment.payment_gateway,
        gateway_order_id=payment.gateway_order_id,
        gateway_payment_id=payment.gateway_payment_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_method=payment.payment_method,
        escrow_status=payment.escrow_status,
        escrow_released_at=payment.escrow_released_at,
        refund_amount=payment.refund_amount,
        refunded_at=payment.refunded_at,
        created_at=payment.created_at
    )


@router.post("/refund", response_model=PaymentResponse)
async def refund_payment(
    refund_data: PaymentRefund,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Request a refund for a transaction.
    Refunds are only available for transactions in certain statuses.
    """
    # Get the transaction
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.id == refund_data.transaction_id,
                Transaction.buyer_id == user_id
            )
        )
    )
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if refund is possible
    if txn.status not in ["payment_completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Refund not available for transaction with status: {txn.status}"
        )
    
    # Get the payment record
    result = await db.execute(
        select(Payment).where(Payment.transaction_id == txn.id)
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    # Process refund (simulated)
    payment.status = "refunded"
    payment.escrow_status = "refunded"
    payment.refund_id = f"rfnd_{secrets.token_hex(8)}"
    payment.refund_amount = payment.amount
    payment.refund_reason = refund_data.reason
    payment.refunded_at = datetime.now()
    payment.updated_at = datetime.now()
    
    # Update transaction
    txn.status = "refunded"
    txn.updated_at = datetime.now()
    
    # Restore listing quantity
    result = await db.execute(
        select(CreditListing).where(CreditListing.id == txn.listing_id)
    )
    listing = result.scalar_one_or_none()
    if listing:
        listing.available_quantity += txn.quantity
        if not listing.is_active and listing.available_quantity > 0:
            listing.is_active = True
    
    # Create notification for seller
    await create_notification(
        db,
        txn.seller_id,
        "payment",
        "Transaction Refunded",
        f"Transaction {txn.transaction_number} has been refunded. Reason: {refund_data.reason}",
        "transaction",
        txn.id
    )
    
    await db.commit()
    await db.refresh(payment)
    
    return PaymentResponse(
        id=payment.id,
        transaction_id=payment.transaction_id,
        payment_gateway=payment.payment_gateway,
        gateway_order_id=payment.gateway_order_id,
        gateway_payment_id=payment.gateway_payment_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_method=payment.payment_method,
        escrow_status=payment.escrow_status,
        escrow_released_at=payment.escrow_released_at,
        refund_amount=payment.refund_amount,
        refunded_at=payment.refunded_at,
        created_at=payment.created_at
    )


@router.get("/{transaction_id}", response_model=PaymentResponse)
async def get_payment_status(
    transaction_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get payment status for a transaction"""
    # Verify user is part of transaction
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.id == transaction_id,
                (Transaction.buyer_id == user_id) | (Transaction.seller_id == user_id)
            )
        )
    )
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Get payment
    result = await db.execute(
        select(Payment).where(Payment.transaction_id == transaction_id)
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    return PaymentResponse(
        id=payment.id,
        transaction_id=payment.transaction_id,
        payment_gateway=payment.payment_gateway,
        gateway_order_id=payment.gateway_order_id,
        gateway_payment_id=payment.gateway_payment_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_method=payment.payment_method,
        escrow_status=payment.escrow_status,
        escrow_released_at=payment.escrow_released_at,
        refund_amount=payment.refund_amount,
        refunded_at=payment.refunded_at,
        created_at=payment.created_at
    )
