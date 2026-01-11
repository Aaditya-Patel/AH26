from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from enum import Enum


# ==================== ENUMS ====================

class OrderTypeEnum(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderStatusEnum(str, Enum):
    PENDING = "pending"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class TransactionStatusEnum(str, Enum):
    PENDING = "pending"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_COMPLETED = "payment_completed"
    CREDITS_TRANSFERRED = "credits_transferred"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class VerificationStatusEnum(str, Enum):
    PENDING = "pending"
    DOCUMENTS_SUBMITTED = "documents_submitted"
    IN_REVIEW = "in_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class ComplianceStatusEnum(str, Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    AT_RISK = "at_risk"
    PENDING = "pending"


# ==================== AUTH SCHEMAS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    user_type: str = Field(pattern="^(buyer|seller)$")
    company_name: str
    sector: Optional[str] = None
    pan_number: Optional[str] = None
    gstin: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    user_type: str
    company_name: str
    sector: Optional[str] = None
    gci_registration_id: Optional[str] = None
    is_kyc_verified: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserWithBalance(UserResponse):
    credit_balance: float = 0
    available_balance: float = 0


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== MARKETPLACE/LISTING SCHEMAS ====================

class ListingCreate(BaseModel):
    quantity: int = Field(gt=0)
    price_per_credit: float = Field(gt=0)
    vintage: int = Field(ge=2020, le=2030)
    project_type: str
    description: Optional[str] = None
    methodology: Optional[str] = None
    project_location: Optional[str] = None
    co_benefits: Optional[List[str]] = None


class ListingResponse(BaseModel):
    id: UUID
    seller_id: UUID
    seller_name: str
    quantity: int
    available_quantity: int
    price_per_credit: float
    vintage: int
    project_type: str
    verification_status: str
    is_active: bool
    description: Optional[str] = None
    methodology: Optional[str] = None
    project_location: Optional[str] = None
    serial_number_start: Optional[str] = None
    serial_number_end: Optional[str] = None
    co_benefits: Optional[List[str]] = None
    additionality_score: Optional[float] = None
    permanence_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ListingUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    price_per_credit: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    is_active: Optional[bool] = None


# Calculator Schemas
class CalculationRequest(BaseModel):
    sector: str
    answers: Dict[str, Any]


class CalculationResponse(BaseModel):
    sector: str
    total_emissions: float
    scope1_emissions: float
    scope2_emissions: float
    scope3_emissions: float
    credits_needed: int
    cost_estimate: float
    breakdown: List[Dict[str, Any]]


# Matching Schemas
class MatchingRequest(BaseModel):
    credits_needed: int
    max_price: Optional[float] = None
    preferred_vintage: Optional[int] = None
    preferred_project_type: Optional[str] = None


class SellerMatch(BaseModel):
    seller_id: UUID
    seller_name: str
    listing_id: UUID
    quantity: int
    price_per_credit: float
    vintage: int
    project_type: str
    match_score: float
    reasons: List[str]


class MatchingResponse(BaseModel):
    matches: List[SellerMatch]


# Education Agent Schemas
class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]


# Voice/TTS/STT Schemas
class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None  # e.g., "en-US-AriaNeural"
    rate: Optional[str] = None  # e.g., "+0%", "-10%", "+20%"
    pitch: Optional[str] = None  # e.g., "+0Hz", "-50Hz", "+50Hz"
    volume: Optional[str] = None  # e.g., "+0%", "-10%", "+20%"


class TTSResponse(BaseModel):
    audio_url: Optional[str] = None  # For direct audio response, this will be None
    message: str = "Audio generated successfully"


class STTResponse(BaseModel):
    text: str
    language: str
    segments: List[Dict[str, Any]] = []


class VoiceChatRequest(BaseModel):
    question: str
    enable_tts: bool = False  # Whether to return audio along with text response


class VoiceChatResponse(BaseModel):
    answer: str
    sources: List[str]
    audio_url: Optional[str] = None  # URL or base64 encoded audio if enable_tts is True


# Formalities Schemas
class WorkflowStep(BaseModel):
    step: int
    title: str
    description: str
    documents: List[str]


class WorkflowResponse(BaseModel):
    workflow_type: str
    steps: List[WorkflowStep]


# ==================== ORDER SCHEMAS ====================

class OrderCreate(BaseModel):
    listing_id: UUID
    quantity: int = Field(gt=0)
    price_per_credit: float = Field(gt=0)


class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    listing_id: Optional[UUID] = None
    order_type: str
    quantity: int
    filled_quantity: int
    price_per_credit: float
    status: str
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class OrderWithDetails(OrderResponse):
    listing: Optional[ListingResponse] = None
    total_amount: float = 0


# ==================== TRANSACTION SCHEMAS ====================

class TransactionCreate(BaseModel):
    listing_id: UUID
    quantity: int = Field(gt=0)


class TransactionResponse(BaseModel):
    id: UUID
    transaction_number: str
    buyer_id: UUID
    seller_id: UUID
    listing_id: UUID
    order_id: Optional[UUID] = None
    quantity: int
    price_per_credit: float
    total_amount: float
    platform_fee: float
    gst_amount: float
    status: str
    transaction_date: datetime
    payment_completed_at: Optional[datetime] = None
    credits_transferred_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionWithDetails(TransactionResponse):
    buyer_name: str
    seller_name: str
    listing: Optional[ListingResponse] = None
    payment: Optional["PaymentResponse"] = None


class TransactionSummary(BaseModel):
    total_transactions: int
    total_volume: int
    total_value: float
    completed_transactions: int
    pending_transactions: int


# ==================== PAYMENT SCHEMAS ====================

class PaymentInitiate(BaseModel):
    transaction_id: UUID


class PaymentResponse(BaseModel):
    id: UUID
    transaction_id: UUID
    payment_gateway: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    payment_method: Optional[str] = None
    escrow_status: str
    escrow_released_at: Optional[datetime] = None
    refund_amount: Optional[float] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaymentVerify(BaseModel):
    transaction_id: UUID
    gateway_payment_id: str
    gateway_order_id: str
    gateway_signature: str


class PaymentRefund(BaseModel):
    transaction_id: UUID
    reason: str


# ==================== CREDIT ACCOUNT SCHEMAS ====================

class CreditAccountResponse(BaseModel):
    id: UUID
    user_id: UUID
    total_balance: float
    available_balance: float
    locked_balance: float
    retired_balance: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CreditTransactionResponse(BaseModel):
    id: UUID
    account_id: UUID
    transaction_type: str
    amount: float
    balance_before: float
    balance_after: float
    reference_type: Optional[str] = None
    reference_id: Optional[UUID] = None
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CreditTransferRequest(BaseModel):
    recipient_email: EmailStr
    amount: float = Field(gt=0)
    description: Optional[str] = None


class CreditRetirementRequest(BaseModel):
    amount: float = Field(gt=0)
    purpose: str = Field(pattern="^(compliance|voluntary|surrender)$")
    compliance_period: Optional[str] = None
    beneficiary: Optional[str] = None


class CreditRetirementResponse(BaseModel):
    id: UUID
    user_id: UUID
    retirement_number: str
    amount: float
    purpose: str
    compliance_period: Optional[str] = None
    beneficiary: Optional[str] = None
    certificate_url: Optional[str] = None
    status: str
    retired_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CreditIssuanceResponse(BaseModel):
    id: UUID
    user_id: UUID
    project_id: Optional[UUID] = None
    issuance_number: Optional[str] = None
    issuer: str
    amount: float
    vintage: Optional[int] = None
    project_type: Optional[str] = None
    methodology: Optional[str] = None
    status: str
    issuance_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== VERIFICATION SCHEMAS ====================

class VerificationCreate(BaseModel):
    verification_type: str = Field(pattern="^(listing|project|issuance)$")
    verifier_agency: Optional[str] = None


class VerificationResponse(BaseModel):
    id: UUID
    verification_type: str
    verifier_agency: Optional[str] = None
    verifier_contact: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    certificate_number: Optional[str] = None
    certificate_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class VerificationUpdate(BaseModel):
    status: Optional[str] = None
    verifier_agency: Optional[str] = None
    rejection_reason: Optional[str] = None
    certificate_number: Optional[str] = None
    certificate_url: Optional[str] = None


class DocumentUpload(BaseModel):
    document_type: str
    filename: str
    file_url: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None


class DocumentResponse(BaseModel):
    id: UUID
    user_id: UUID
    verification_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    document_type: str
    filename: str
    file_url: str
    file_size: Optional[int] = None
    version: int
    is_current: bool
    expires_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== COMPLIANCE SCHEMAS ====================

class ComplianceRecordCreate(BaseModel):
    compliance_period: str
    sector: str
    target_emission_intensity: Optional[float] = None
    baseline_emission_intensity: Optional[float] = None
    deadline: Optional[datetime] = None


class ComplianceRecordResponse(BaseModel):
    id: UUID
    user_id: UUID
    compliance_period: str
    sector: str
    target_emission_intensity: Optional[float] = None
    baseline_emission_intensity: Optional[float] = None
    actual_emissions: Optional[float] = None
    actual_production: Optional[float] = None
    actual_emission_intensity: Optional[float] = None
    credits_required: int
    credits_earned: int
    credits_surrendered: int
    credits_shortfall: int
    status: str
    deadline: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    penalty_amount: float
    penalty_paid: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ComplianceSubmit(BaseModel):
    actual_emissions: float
    actual_production: float


class ComplianceSummary(BaseModel):
    total_periods: int
    compliant_periods: int
    non_compliant_periods: int
    at_risk_periods: int
    total_credits_required: int
    total_credits_surrendered: int
    total_shortfall: int
    total_penalties: float


# ==================== PROJECT SCHEMAS ====================

class ProjectCreate(BaseModel):
    project_name: str
    project_type: str
    methodology: str
    description: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    coordinates: Optional[str] = None
    start_date: Optional[date] = None
    crediting_period_start: Optional[date] = None
    crediting_period_end: Optional[date] = None
    expected_annual_credits: Optional[int] = None


class ProjectResponse(BaseModel):
    id: UUID
    owner_id: UUID
    project_name: str
    project_id_number: Optional[str] = None
    project_type: str
    methodology: str
    description: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    country: str
    coordinates: Optional[str] = None
    start_date: Optional[date] = None
    crediting_period_start: Optional[date] = None
    crediting_period_end: Optional[date] = None
    expected_annual_credits: Optional[int] = None
    total_credits_issued: int
    status: str
    validator_agency: Optional[str] = None
    validation_date: Optional[datetime] = None
    registration_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None
    expected_annual_credits: Optional[int] = None
    status: Optional[str] = None


# ==================== MARKET DATA SCHEMAS ====================

class PriceHistoryResponse(BaseModel):
    id: UUID
    date: date
    project_type: Optional[str] = None
    vintage: Optional[int] = None
    open_price: Optional[float] = None
    close_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    average_price: Optional[float] = None
    volume: int
    num_transactions: int
    
    class Config:
        from_attributes = True


class MarketStatsResponse(BaseModel):
    id: UUID
    date: date
    total_volume: int
    total_value: float
    num_transactions: int
    avg_price: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    active_listings: int
    total_credits_available: int
    new_users: int
    active_buyers: int
    active_sellers: int
    
    class Config:
        from_attributes = True


class MarketOverview(BaseModel):
    current_avg_price: float
    price_change_24h: float
    price_change_percent: float
    total_volume_24h: int
    total_value_24h: float
    num_transactions_24h: int
    active_listings: int
    total_credits_available: int
    price_by_project_type: Dict[str, float]
    price_by_vintage: Dict[int, float]


class PriceChart(BaseModel):
    dates: List[date]
    prices: List[float]
    volumes: List[int]


# ==================== NOTIFICATION SCHEMAS ====================

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    notification_type: str
    title: str
    message: str
    reference_type: Optional[str] = None
    reference_id: Optional[UUID] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    notification_ids: List[UUID]


# Update forward references
TransactionWithDetails.model_rebuild()
