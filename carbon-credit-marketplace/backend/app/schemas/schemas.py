from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    user_type: str = Field(pattern="^(buyer|seller)$")
    company_name: str
    sector: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    user_type: str
    company_name: str
    sector: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Marketplace Schemas
class ListingCreate(BaseModel):
    quantity: int = Field(gt=0)
    price_per_credit: float = Field(gt=0)
    vintage: int = Field(ge=2020, le=2030)
    project_type: str
    description: Optional[str] = None


class ListingResponse(BaseModel):
    id: UUID
    seller_id: UUID
    seller_name: str
    quantity: int
    price_per_credit: float
    vintage: int
    project_type: str
    verification_status: str
    is_active: bool
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


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


# Formalities Schemas
class WorkflowStep(BaseModel):
    step: int
    title: str
    description: str
    documents: List[str]


class WorkflowResponse(BaseModel):
    workflow_type: str
    steps: List[WorkflowStep]
