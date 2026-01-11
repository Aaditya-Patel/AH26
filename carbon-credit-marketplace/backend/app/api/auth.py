from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user_id
from app.services.document_validator import validate_pan_number, validate_gstin, validate_gci_registration_id
from app.services.fraud_detector import check_duplicate_registration, analyze_risk_score

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user (buyer or seller)"""
    
    # Check for duplicate registrations
    duplicate_check = await check_duplicate_registration(
        db, user_data.email, user_data.pan_number, user_data.gstin
    )
    
    if duplicate_check.get("email_duplicate"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if duplicate_check.get("pan_duplicate"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PAN number already registered"
        )
    
    if duplicate_check.get("gstin_duplicate") and user_data.gstin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GSTIN already registered"
        )
    
    # Validate document formats
    if user_data.pan_number and not validate_pan_number(user_data.pan_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PAN number format"
        )
    
    if user_data.gstin and not validate_gstin(user_data.gstin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GSTIN format"
        )
    
    if user_data.gci_registration_id and not validate_gci_registration_id(user_data.gci_registration_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GCI registration ID format"
        )
    
    # Calculate initial risk score
    user_data_dict = {
        "email": user_data.email,
        "company_name": user_data.company_name,
        "pan_number": user_data.pan_number,
        "gstin": user_data.gstin,
        "user_type": user_data.user_type
    }
    risk_score = await analyze_risk_score(user_data_dict, {}, duplicate_check)
    
    # Determine verification tier
    verification_tier = "basic"
    if risk_score < 20:
        verification_tier = "verified"
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        user_type=user_data.user_type,
        company_name=user_data.company_name,
        sector=user_data.sector,
        pan_number=user_data.pan_number.upper() if user_data.pan_number else None,
        gstin=user_data.gstin.upper() if user_data.gstin else None,
        gci_registration_id=user_data.gci_registration_id,
        risk_score=risk_score,
        verification_tier=verification_tier
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    
    # Find user
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get current user info"""
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.model_validate(user)
