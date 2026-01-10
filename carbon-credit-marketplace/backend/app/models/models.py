from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum, Date, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from enum import Enum as PyEnum

from app.database import Base


# ==================== ENUMS ====================

class OrderType(str, PyEnum):
    BUY = "buy"
    SELL = "sell"


class OrderStatus(str, PyEnum):
    PENDING = "pending"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class TransactionStatus(str, PyEnum):
    PENDING = "pending"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_COMPLETED = "payment_completed"
    CREDITS_TRANSFERRED = "credits_transferred"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentStatus(str, PyEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class CreditTransactionType(str, PyEnum):
    ISSUANCE = "issuance"
    PURCHASE = "purchase"
    SALE = "sale"
    TRANSFER = "transfer"
    RETIREMENT = "retirement"
    SURRENDER = "surrender"


class VerificationStatus(str, PyEnum):
    PENDING = "pending"
    DOCUMENTS_SUBMITTED = "documents_submitted"
    IN_REVIEW = "in_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class ComplianceStatus(str, PyEnum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    AT_RISK = "at_risk"
    PENDING = "pending"


class ProjectStatus(str, PyEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_VALIDATION = "under_validation"
    VALIDATED = "validated"
    REGISTERED = "registered"
    REJECTED = "rejected"


# ==================== USER MODEL ====================

class User(Base):
    """User model for both buyers and sellers"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(String(50), nullable=False)  # 'buyer' or 'seller'
    company_name = Column(String(255), nullable=False)
    sector = Column(String(100))  # For buyers
    gci_registration_id = Column(String(100))  # GCI Registry ID
    pan_number = Column(String(20))  # For KYC
    gstin = Column(String(20))  # GST Number
    is_active = Column(Boolean, default=True)
    is_kyc_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    listings = relationship("CreditListing", back_populates="seller", foreign_keys="CreditListing.seller_id")
    emissions = relationship("EmissionCalculation", back_populates="user")
    credit_account = relationship("CreditAccount", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    buyer_transactions = relationship("Transaction", back_populates="buyer", foreign_keys="Transaction.buyer_id")
    seller_transactions = relationship("Transaction", back_populates="seller", foreign_keys="Transaction.seller_id")
    compliance_records = relationship("ComplianceRecord", back_populates="user")
    projects = relationship("Project", back_populates="owner")
    notifications = relationship("Notification", back_populates="user")


class CreditListing(Base):
    """Credit listing model with enhanced metadata"""
    __tablename__ = "credit_listings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    
    # Basic listing info
    quantity = Column(Integer, nullable=False)
    available_quantity = Column(Integer, nullable=False)  # Remaining after partial sales
    price_per_credit = Column(Float, nullable=False)
    vintage = Column(Integer)  # Year
    project_type = Column(String(100))  # e.g., 'Renewable Energy', 'Forestry'
    
    # Enhanced metadata for credit quality
    serial_number_start = Column(String(50))  # Credit serial number range start
    serial_number_end = Column(String(50))  # Credit serial number range end
    methodology = Column(String(200))  # Approved methodology used
    project_location = Column(String(255))  # Location of the project
    co_benefits = Column(Text)  # JSON list of co-benefits
    additionality_score = Column(Float)  # 0-100 score
    permanence_score = Column(Float)  # 0-100 score
    
    # Verification
    verification_status = Column(String(50), default='pending')
    verification_id = Column(UUID(as_uuid=True), ForeignKey("verifications.id"), nullable=True)
    verification_expiry = Column(DateTime(timezone=True))
    
    is_active = Column(Boolean, default=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    seller = relationship("User", back_populates="listings", foreign_keys=[seller_id])
    project = relationship("Project", back_populates="listings")
    verification = relationship("Verification", back_populates="listing")
    transactions = relationship("Transaction", back_populates="listing")
    orders = relationship("Order", back_populates="listing")


class EmissionCalculation(Base):
    """Emission calculation results"""
    __tablename__ = "emission_calculations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sector = Column(String(100), nullable=False)
    total_emissions = Column(Float, nullable=False)  # tCO2e
    emission_intensity = Column(Float)  # tCO2e per unit of product
    production_quantity = Column(Float)  # Units of product
    scope1_emissions = Column(Float)
    scope2_emissions = Column(Float)
    scope3_emissions = Column(Float)
    credits_needed = Column(Integer)
    questionnaire_data = Column(Text)  # JSON stored as text
    baseline_year = Column(Integer)  # Baseline comparison year
    target_intensity = Column(Float)  # Target emission intensity
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="emissions")


# ==================== ORDER & TRANSACTION MODELS ====================

class Order(Base):
    """Buy/Sell order model"""
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("credit_listings.id"), nullable=True)  # For buy orders
    
    order_type = Column(String(20), nullable=False)  # 'buy' or 'sell'
    quantity = Column(Integer, nullable=False)
    filled_quantity = Column(Integer, default=0)
    price_per_credit = Column(Float, nullable=False)  # Limit price
    
    status = Column(String(50), default='pending')  # pending, partially_filled, filled, cancelled, expired
    expires_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    listing = relationship("CreditListing", back_populates="orders")
    transactions = relationship("Transaction", back_populates="order")


class Transaction(Base):
    """Transaction model for executed trades"""
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_number = Column(String(50), unique=True, nullable=False)  # Human-readable ID
    
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("credit_listings.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)
    
    quantity = Column(Integer, nullable=False)
    price_per_credit = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    platform_fee = Column(Float, default=0)  # Platform commission
    gst_amount = Column(Float, default=0)  # GST on platform fee
    
    status = Column(String(50), default='pending')  # pending, payment_pending, payment_completed, credits_transferred, completed, failed, refunded
    
    # Timestamps
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    payment_completed_at = Column(DateTime(timezone=True))
    credits_transferred_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    buyer = relationship("User", back_populates="buyer_transactions", foreign_keys=[buyer_id])
    seller = relationship("User", back_populates="seller_transactions", foreign_keys=[seller_id])
    listing = relationship("CreditListing", back_populates="transactions")
    order = relationship("Order", back_populates="transactions")
    payment = relationship("Payment", back_populates="transaction", uselist=False)


class Payment(Base):
    """Payment model for tracking payment status"""
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    
    payment_gateway = Column(String(50))  # 'razorpay', 'stripe', 'manual'
    gateway_order_id = Column(String(100))  # Gateway's order ID
    gateway_payment_id = Column(String(100))  # Gateway's payment ID
    gateway_signature = Column(String(255))  # For verification
    
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default='INR')
    status = Column(String(50), default='pending')  # pending, processing, completed, failed, refunded
    
    payment_method = Column(String(50))  # 'upi', 'card', 'netbanking', 'wallet'
    payer_email = Column(String(255))
    payer_phone = Column(String(20))
    
    # Escrow tracking
    escrow_status = Column(String(50), default='not_started')  # not_started, in_escrow, released, refunded
    escrow_released_at = Column(DateTime(timezone=True))
    
    # Refund info
    refund_id = Column(String(100))
    refund_amount = Column(Float)
    refund_reason = Column(Text)
    refunded_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    transaction = relationship("Transaction", back_populates="payment")


# ==================== CREDIT REGISTRY MODELS ====================

class CreditAccount(Base):
    """Credit account for tracking user's credit balance"""
    __tablename__ = "credit_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    total_balance = Column(Float, default=0)  # Total credits owned
    available_balance = Column(Float, default=0)  # Available for sale/transfer
    locked_balance = Column(Float, default=0)  # Locked in pending transactions
    retired_balance = Column(Float, default=0)  # Credits retired/surrendered
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="credit_account")
    credit_transactions = relationship("CreditTransaction", back_populates="account")


class CreditTransaction(Base):
    """Ledger for all credit movements"""
    __tablename__ = "credit_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("credit_accounts.id"), nullable=False)
    
    transaction_type = Column(String(50), nullable=False)  # issuance, purchase, sale, transfer, retirement, surrender
    amount = Column(Float, nullable=False)
    balance_before = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    
    reference_type = Column(String(50))  # 'transaction', 'issuance', 'retirement'
    reference_id = Column(UUID(as_uuid=True))  # ID of related transaction/issuance/retirement
    
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    account = relationship("CreditAccount", back_populates="credit_transactions")


class CreditIssuance(Base):
    """Credit issuance tracking (from BEE or voluntary projects)"""
    __tablename__ = "credit_issuances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    
    issuance_number = Column(String(50), unique=True)  # Official issuance number
    issuer = Column(String(100), nullable=False)  # 'BEE', 'VCS', 'Gold Standard', etc.
    
    amount = Column(Float, nullable=False)
    serial_number_start = Column(String(50))
    serial_number_end = Column(String(50))
    
    vintage = Column(Integer)
    project_type = Column(String(100))
    methodology = Column(String(200))
    
    verification_id = Column(UUID(as_uuid=True), ForeignKey("verifications.id"), nullable=True)
    status = Column(String(50), default='pending')  # pending, approved, rejected
    
    issuance_date = Column(DateTime(timezone=True))
    expiry_date = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CreditRetirement(Base):
    """Credit retirement/surrender tracking"""
    __tablename__ = "credit_retirements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    retirement_number = Column(String(50), unique=True)  # Official retirement number
    amount = Column(Float, nullable=False)
    
    purpose = Column(String(100), nullable=False)  # 'compliance', 'voluntary', 'surrender'
    compliance_period = Column(String(20))  # e.g., '2025-26'
    beneficiary = Column(String(255))  # Who the retirement is on behalf of
    
    serial_number_start = Column(String(50))
    serial_number_end = Column(String(50))
    
    certificate_url = Column(String(500))  # URL to retirement certificate
    status = Column(String(50), default='pending')  # pending, completed
    
    retired_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ==================== VERIFICATION MODELS ====================

class Verification(Base):
    """Verification workflow tracking"""
    __tablename__ = "verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    verification_type = Column(String(50), nullable=False)  # 'listing', 'project', 'issuance'
    verifier_agency = Column(String(200))  # Accredited verification agency name
    verifier_contact = Column(String(255))
    
    status = Column(String(50), default='pending')  # pending, documents_submitted, in_review, verified, rejected, expired
    
    submitted_at = Column(DateTime(timezone=True))
    reviewed_at = Column(DateTime(timezone=True))
    verified_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    
    rejection_reason = Column(Text)
    verification_notes = Column(Text)
    certificate_number = Column(String(100))
    certificate_url = Column(String(500))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    listing = relationship("CreditListing", back_populates="verification", uselist=False)
    documents = relationship("Document", back_populates="verification")


class Document(Base):
    """Document storage for verification and compliance"""
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    verification_id = Column(UUID(as_uuid=True), ForeignKey("verifications.id"), nullable=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    
    document_type = Column(String(100), nullable=False)  # 'verification_certificate', 'project_document', 'compliance_report', etc.
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer)  # In bytes
    mime_type = Column(String(100))
    
    version = Column(Integer, default=1)
    is_current = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    verification = relationship("Verification", back_populates="documents")


# ==================== COMPLIANCE MODELS ====================

class ComplianceRecord(Base):
    """Compliance tracking for covered entities"""
    __tablename__ = "compliance_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    compliance_period = Column(String(20), nullable=False)  # e.g., '2025-26'
    sector = Column(String(100), nullable=False)
    
    # Targets
    target_emission_intensity = Column(Float)  # tCO2e per unit of product
    baseline_emission_intensity = Column(Float)
    
    # Actuals
    actual_emissions = Column(Float)
    actual_production = Column(Float)
    actual_emission_intensity = Column(Float)
    
    # Compliance calculation
    credits_required = Column(Integer, default=0)  # If over target
    credits_earned = Column(Integer, default=0)  # If under target
    credits_surrendered = Column(Integer, default=0)
    credits_shortfall = Column(Integer, default=0)
    
    status = Column(String(50), default='pending')  # compliant, non_compliant, at_risk, pending
    
    deadline = Column(DateTime(timezone=True))
    submitted_at = Column(DateTime(timezone=True))
    verified_at = Column(DateTime(timezone=True))
    
    penalty_amount = Column(Float, default=0)
    penalty_paid = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="compliance_records")


# ==================== PROJECT MODELS ====================

class Project(Base):
    """Project registration for voluntary offset mechanism"""
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    project_name = Column(String(255), nullable=False)
    project_id_number = Column(String(50), unique=True)  # Official project ID
    
    project_type = Column(String(100), nullable=False)  # Renewable Energy, Forestry, etc.
    methodology = Column(String(200), nullable=False)  # One of 8 approved methodologies
    
    description = Column(Text)
    location = Column(String(255))
    state = Column(String(100))
    country = Column(String(100), default='India')
    coordinates = Column(String(100))  # Lat, Long
    
    start_date = Column(Date)
    crediting_period_start = Column(Date)
    crediting_period_end = Column(Date)
    
    expected_annual_credits = Column(Integer)
    total_credits_issued = Column(Integer, default=0)
    
    status = Column(String(50), default='draft')  # draft, submitted, under_validation, validated, registered, rejected
    
    # Validation
    validator_agency = Column(String(200))
    validation_date = Column(DateTime(timezone=True))
    registration_date = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    listings = relationship("CreditListing", back_populates="project")


# ==================== MARKET DATA MODELS ====================

class PriceHistory(Base):
    """Historical price data for market analytics"""
    __tablename__ = "price_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    date = Column(Date, nullable=False)
    project_type = Column(String(100))
    vintage = Column(Integer)
    
    open_price = Column(Float)
    close_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    average_price = Column(Float)
    
    volume = Column(Integer, default=0)  # Number of credits traded
    num_transactions = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MarketStats(Base):
    """Aggregated market statistics"""
    __tablename__ = "market_stats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    date = Column(Date, nullable=False, unique=True)
    
    total_volume = Column(Integer, default=0)
    total_value = Column(Float, default=0)
    num_transactions = Column(Integer, default=0)
    
    avg_price = Column(Float)
    min_price = Column(Float)
    max_price = Column(Float)
    
    active_listings = Column(Integer, default=0)
    total_credits_available = Column(Integer, default=0)
    
    new_users = Column(Integer, default=0)
    active_buyers = Column(Integer, default=0)
    active_sellers = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ==================== NOTIFICATION MODEL ====================

class Notification(Base):
    """User notifications"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    notification_type = Column(String(50), nullable=False)  # transaction, compliance, verification, price_alert, etc.
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    reference_type = Column(String(50))  # 'transaction', 'compliance', etc.
    reference_id = Column(UUID(as_uuid=True))
    
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")
