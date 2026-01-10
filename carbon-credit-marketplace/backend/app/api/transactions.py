"""
Transaction API endpoints for buying and selling carbon credits
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import secrets

from app.database import get_db
from app.models.models import (
    User, CreditListing, Transaction, Order, Payment,
    CreditAccount, CreditTransaction, Notification
)
from app.schemas.schemas import (
    OrderCreate, OrderResponse, OrderWithDetails,
    TransactionCreate, TransactionResponse, TransactionWithDetails, TransactionSummary,
    ListingResponse
)
from app.core.security import get_current_user_id

router = APIRouter()


def generate_transaction_number() -> str:
    """Generate a unique transaction number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = secrets.token_hex(4).upper()
    return f"TXN-{timestamp}-{random_suffix}"


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


# ==================== ORDER ENDPOINTS ====================

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_buy_order(
    order_data: OrderCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a buy order for carbon credits.
    This initiates the purchase process.
    """
    # Get the user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get the listing
    result = await db.execute(
        select(CreditListing).where(
            and_(
                CreditListing.id == order_data.listing_id,
                CreditListing.is_active == True
            )
        )
    )
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or not active"
        )
    
    # Check if user is not the seller
    if str(listing.seller_id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot buy your own listing"
        )
    
    # Check available quantity
    if order_data.quantity > listing.available_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({order_data.quantity}) exceeds available quantity ({listing.available_quantity})"
        )
    
    # Check if price matches
    if order_data.price_per_credit < listing.price_per_credit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order price (₹{order_data.price_per_credit}) is lower than listing price (₹{listing.price_per_credit})"
        )
    
    # Create the order
    order = Order(
        user_id=UUID(user_id),
        listing_id=order_data.listing_id,
        order_type="buy",
        quantity=order_data.quantity,
        filled_quantity=0,
        price_per_credit=order_data.price_per_credit,
        status="pending",
        expires_at=datetime.now() + timedelta(hours=24)  # Order expires in 24 hours
    )
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        listing_id=order.listing_id,
        order_type=order.order_type,
        quantity=order.quantity,
        filled_quantity=order.filled_quantity,
        price_per_credit=order.price_per_credit,
        status=order.status,
        expires_at=order.expires_at,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.get("/orders", response_model=List[OrderWithDetails])
async def get_user_orders(
    status: Optional[str] = Query(None),
    order_type: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders for the current user"""
    query = select(Order).where(Order.user_id == user_id)
    
    if status:
        query = query.where(Order.status == status)
    if order_type:
        query = query.where(Order.order_type == order_type)
    
    query = query.order_by(Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    response = []
    for order in orders:
        order_dict = {
            "id": order.id,
            "user_id": order.user_id,
            "listing_id": order.listing_id,
            "order_type": order.order_type,
            "quantity": order.quantity,
            "filled_quantity": order.filled_quantity,
            "price_per_credit": order.price_per_credit,
            "status": order.status,
            "expires_at": order.expires_at,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "listing": None,
            "total_amount": order.quantity * order.price_per_credit
        }
        response.append(OrderWithDetails(**order_dict))
    
    return response


@router.delete("/orders/{order_id}")
async def cancel_order(
    order_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Cancel a pending order"""
    result = await db.execute(
        select(Order).where(
            and_(
                Order.id == order_id,
                Order.user_id == user_id
            )
        )
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.status not in ["pending", "partially_filled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status: {order.status}"
        )
    
    order.status = "cancelled"
    order.updated_at = datetime.now()
    await db.commit()
    
    return {"message": "Order cancelled successfully"}


# ==================== TRANSACTION ENDPOINTS ====================

@router.post("/buy", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def buy_credits(
    transaction_data: TransactionCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct purchase of carbon credits from a listing.
    This creates a transaction and initiates the payment process.
    """
    try:
        print(f"🔵 Buy credits request: user_id={user_id}, listing_id={transaction_data.listing_id}, quantity={transaction_data.quantity}", flush=True)
        
        # Get the buyer
        result = await db.execute(select(User).where(User.id == user_id))
        buyer = result.scalar_one_or_none()
        
        if not buyer:
            print(f"❌ User not found: {user_id}", flush=True)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get the listing with seller
        result = await db.execute(
            select(CreditListing, User)
            .join(User, CreditListing.seller_id == User.id)
            .where(
                and_(
                    CreditListing.id == transaction_data.listing_id,
                    CreditListing.is_active == True
                )
            )
        )
        listing_seller = result.first()
        
        if not listing_seller:
            print(f"❌ Listing not found or not active: {transaction_data.listing_id}", flush=True)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found or not active"
            )
        
        listing, seller = listing_seller
        print(f"✅ Found listing: {listing.id}, seller_id={listing.seller_id}, available_quantity={listing.available_quantity}", flush=True)
        
        # Check if buyer is not the seller
        if str(listing.seller_id) == user_id:
            print(f"❌ Buyer trying to buy own listing: {user_id}", flush=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot buy your own listing"
            )
        
        # Check available quantity (use quantity as fallback if available_quantity is not set)
        available_qty = listing.available_quantity if listing.available_quantity is not None else listing.quantity
        print(f"📊 Quantity check: requested={transaction_data.quantity}, available={available_qty}", flush=True)
        if transaction_data.quantity > available_qty:
            print(f"❌ Quantity exceeds available: {transaction_data.quantity} > {available_qty}", flush=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({transaction_data.quantity}) exceeds available quantity ({available_qty})"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in buy_credits validation: {type(e).__name__}: {str(e)}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing purchase request: {str(e)}"
        )
    
    # Calculate amounts
    total_amount = transaction_data.quantity * listing.price_per_credit
    platform_fee = total_amount * 0.02  # 2% platform fee
    gst_amount = platform_fee * 0.18  # 18% GST on platform fee
    
    print(f"💰 Amounts calculated: total={total_amount}, platform_fee={platform_fee}, gst={gst_amount}", flush=True)
    
    try:
        # Create the transaction
        transaction = Transaction(
            transaction_number=generate_transaction_number(),
            buyer_id=UUID(user_id),
            seller_id=listing.seller_id,
            listing_id=listing.id,
            quantity=transaction_data.quantity,
            price_per_credit=listing.price_per_credit,
            total_amount=total_amount,
            platform_fee=platform_fee,
            gst_amount=gst_amount,
            status="payment_pending"
        )
        
        db.add(transaction)
        print(f"✅ Transaction created: {transaction.transaction_number}", flush=True)
        
        # Lock the credits in the listing (reduce available quantity)
        if listing.available_quantity is not None:
            listing.available_quantity -= transaction_data.quantity
        else:
            listing.available_quantity = listing.quantity - transaction_data.quantity
        
        print(f"✅ Listing quantity updated: available_quantity={listing.available_quantity}", flush=True)
    except Exception as e:
        print(f"❌ Error creating transaction: {type(e).__name__}: {str(e)}", flush=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transaction: {str(e)}"
        )
    
    # Commit transaction first to get the ID
    await db.flush()  # Flush to get transaction.id without committing
    await db.refresh(transaction)
    
    # Create payment record
    payment = Payment(
        transaction_id=transaction.id,
        amount=total_amount + platform_fee + gst_amount,
        currency="INR",
        status="pending",
        escrow_status="not_started"
    )
    
    db.add(payment)
    
    # Create notifications (with error handling)
    try:
        await create_notification(
            db,
            UUID(user_id),
            "transaction",
            "Purchase Initiated",
            f"Your purchase of {transaction_data.quantity} credits for ₹{total_amount:,.2f} has been initiated. Please complete the payment.",
            "transaction",
            transaction.id
        )
        
        await create_notification(
            db,
            listing.seller_id,
            "transaction",
            "New Purchase Order",
            f"{buyer.company_name} has initiated a purchase of {transaction_data.quantity} credits from your listing.",
            "transaction",
            transaction.id
        )
    except Exception as e:
        # Log notification errors but don't fail the transaction
        print(f"⚠️ Warning: Failed to create notifications: {type(e).__name__}: {str(e)}", flush=True)
    
    try:
        await db.commit()
        await db.refresh(transaction)
        print(f"✅ Transaction committed successfully: {transaction.transaction_number}", flush=True)
        
        response = TransactionResponse(
            id=transaction.id,
            transaction_number=transaction.transaction_number,
            buyer_id=transaction.buyer_id,
            seller_id=transaction.seller_id,
            listing_id=transaction.listing_id,
            order_id=transaction.order_id,
            quantity=transaction.quantity,
            price_per_credit=transaction.price_per_credit,
            total_amount=transaction.total_amount,
            platform_fee=transaction.platform_fee,
            gst_amount=transaction.gst_amount,
            status=transaction.status,
            transaction_date=transaction.transaction_date,
            payment_completed_at=transaction.payment_completed_at,
            credits_transferred_at=transaction.credits_transferred_at,
            completed_at=transaction.completed_at,
            created_at=transaction.created_at
        )
        print(f"✅ Purchase successful: Transaction {transaction.transaction_number} created", flush=True)
        return response
    except Exception as e:
        print(f"❌ Error committing transaction: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete purchase: {str(e)}"
        )


@router.get("/transactions", response_model=List[TransactionWithDetails])
async def get_user_transactions(
    status: Optional[str] = Query(None),
    role: Optional[str] = Query(None, description="Filter by 'buyer' or 'seller' role"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all transactions for the current user"""
    user_uuid = UUID(user_id)
    
    # Build query based on role
    if role == "buyer":
        query = select(Transaction).where(Transaction.buyer_id == user_uuid)
    elif role == "seller":
        query = select(Transaction).where(Transaction.seller_id == user_uuid)
    else:
        query = select(Transaction).where(
            or_(
                Transaction.buyer_id == user_uuid,
                Transaction.seller_id == user_uuid
            )
        )
    
    if status:
        query = query.where(Transaction.status == status)
    
    query = query.order_by(Transaction.created_at.desc())
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    response = []
    for txn in transactions:
        # Get buyer and seller names
        buyer_result = await db.execute(select(User).where(User.id == txn.buyer_id))
        buyer = buyer_result.scalar_one_or_none()
        
        seller_result = await db.execute(select(User).where(User.id == txn.seller_id))
        seller = seller_result.scalar_one_or_none()
        
        txn_dict = {
            "id": txn.id,
            "transaction_number": txn.transaction_number,
            "buyer_id": txn.buyer_id,
            "seller_id": txn.seller_id,
            "listing_id": txn.listing_id,
            "order_id": txn.order_id,
            "quantity": txn.quantity,
            "price_per_credit": txn.price_per_credit,
            "total_amount": txn.total_amount,
            "platform_fee": txn.platform_fee,
            "gst_amount": txn.gst_amount,
            "status": txn.status,
            "transaction_date": txn.transaction_date,
            "payment_completed_at": txn.payment_completed_at,
            "credits_transferred_at": txn.credits_transferred_at,
            "completed_at": txn.completed_at,
            "created_at": txn.created_at,
            "buyer_name": buyer.company_name if buyer else "Unknown",
            "seller_name": seller.company_name if seller else "Unknown",
            "listing": None,
            "payment": None
        }
        response.append(TransactionWithDetails(**txn_dict))
    
    return response


@router.get("/transactions/{transaction_id}", response_model=TransactionWithDetails)
async def get_transaction(
    transaction_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific transaction by ID"""
    user_uuid = UUID(user_id)
    
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.id == transaction_id,
                or_(
                    Transaction.buyer_id == user_uuid,
                    Transaction.seller_id == user_uuid
                )
            )
        )
    )
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Get buyer and seller names
    buyer_result = await db.execute(select(User).where(User.id == txn.buyer_id))
    buyer = buyer_result.scalar_one_or_none()
    
    seller_result = await db.execute(select(User).where(User.id == txn.seller_id))
    seller = seller_result.scalar_one_or_none()
    
    # Get payment info
    payment_result = await db.execute(
        select(Payment).where(Payment.transaction_id == txn.id)
    )
    payment = payment_result.scalar_one_or_none()
    
    payment_dict = None
    if payment:
        payment_dict = {
            "id": payment.id,
            "transaction_id": payment.transaction_id,
            "payment_gateway": payment.payment_gateway,
            "gateway_order_id": payment.gateway_order_id,
            "gateway_payment_id": payment.gateway_payment_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status,
            "payment_method": payment.payment_method,
            "escrow_status": payment.escrow_status,
            "escrow_released_at": payment.escrow_released_at,
            "refund_amount": payment.refund_amount,
            "refunded_at": payment.refunded_at,
            "created_at": payment.created_at
        }
    
    return TransactionWithDetails(
        id=txn.id,
        transaction_number=txn.transaction_number,
        buyer_id=txn.buyer_id,
        seller_id=txn.seller_id,
        listing_id=txn.listing_id,
        order_id=txn.order_id,
        quantity=txn.quantity,
        price_per_credit=txn.price_per_credit,
        total_amount=txn.total_amount,
        platform_fee=txn.platform_fee,
        gst_amount=txn.gst_amount,
        status=txn.status,
        transaction_date=txn.transaction_date,
        payment_completed_at=txn.payment_completed_at,
        credits_transferred_at=txn.credits_transferred_at,
        completed_at=txn.completed_at,
        created_at=txn.created_at,
        buyer_name=buyer.company_name if buyer else "Unknown",
        seller_name=seller.company_name if seller else "Unknown",
        listing=None,
        payment=payment_dict
    )


@router.post("/transactions/{transaction_id}/cancel")
async def cancel_transaction(
    transaction_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Cancel a pending transaction"""
    user_uuid = UUID(user_id)
    
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.id == transaction_id,
                Transaction.buyer_id == user_uuid
            )
        )
    )
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if txn.status not in ["pending", "payment_pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel transaction with status: {txn.status}"
        )
    
    # Restore the listing quantity
    listing_result = await db.execute(
        select(CreditListing).where(CreditListing.id == txn.listing_id)
    )
    listing = listing_result.scalar_one_or_none()
    if listing:
        listing.available_quantity += txn.quantity
    
    # Update transaction status
    txn.status = "cancelled"
    txn.updated_at = datetime.now()
    
    # Update payment status
    payment_result = await db.execute(
        select(Payment).where(Payment.transaction_id == txn.id)
    )
    payment = payment_result.scalar_one_or_none()
    if payment:
        payment.status = "cancelled"
    
    # Create notification for seller
    await create_notification(
        db,
        txn.seller_id,
        "transaction",
        "Transaction Cancelled",
        f"Transaction {txn.transaction_number} has been cancelled by the buyer.",
        "transaction",
        txn.id
    )
    
    await db.commit()
    
    return {"message": "Transaction cancelled successfully", "transaction_number": txn.transaction_number}


@router.get("/transactions/summary/me", response_model=TransactionSummary)
async def get_my_transaction_summary(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get transaction summary for the current user"""
    user_uuid = UUID(user_id)
    
    # Get all transactions for the user
    result = await db.execute(
        select(Transaction).where(
            or_(
                Transaction.buyer_id == user_uuid,
                Transaction.seller_id == user_uuid
            )
        )
    )
    transactions = result.scalars().all()
    
    total_transactions = len(transactions)
    total_volume = sum(txn.quantity for txn in transactions)
    total_value = sum(txn.total_amount for txn in transactions)
    completed_transactions = sum(1 for txn in transactions if txn.status == "completed")
    pending_transactions = sum(1 for txn in transactions if txn.status in ["pending", "payment_pending", "payment_completed", "credits_transferred"])
    
    return TransactionSummary(
        total_transactions=total_transactions,
        total_volume=total_volume,
        total_value=total_value,
        completed_transactions=completed_transactions,
        pending_transactions=pending_transactions
    )
