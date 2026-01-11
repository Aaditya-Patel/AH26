"""
Verification API endpoints for managing verification workflows
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import secrets

from app.database import get_db
from app.models.models import (
    User, CreditListing, Verification, Document, Notification
)
from app.schemas.schemas import (
    VerificationCreate, VerificationResponse, VerificationUpdate,
    DocumentUpload, DocumentResponse, OCRResponse, ChatRequest, ChatResponse
)
from app.services.document_ocr import extract_text_and_structured_data
from app.services.document_validator import (
    validate_pan_number, validate_gstin, validate_gci_registration_id,
    validate_document_consistency, validate_document_format
)
from app.services.fraud_detector import (
    check_duplicate_registration, detect_fraud_indicators, analyze_risk_score
)
from app.services.credit_verifier import check_credit_availability, validate_credit_listing
from app.agents.verification_agent import (
    chat_with_verification_agent, get_verification_checklist, validate_documents_completeness
)
from app.core.security import get_current_user_id

router = APIRouter()


def generate_certificate_number() -> str:
    """Generate a unique certificate number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = secrets.token_hex(4).upper()
    return f"CERT-{timestamp}-{random_suffix}"


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


# ==================== VERIFICATION ENDPOINTS ====================

@router.post("/create", response_model=VerificationResponse, status_code=status.HTTP_201_CREATED)
async def create_verification_request(
    verification_data: VerificationCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new verification request"""
    
    verification = Verification(
        verification_type=verification_data.verification_type,
        verifier_agency=verification_data.verifier_agency,
        status="pending"
    )
    
    db.add(verification)
    await db.commit()
    await db.refresh(verification)
    
    return VerificationResponse(
        id=verification.id,
        verification_type=verification.verification_type,
        verifier_agency=verification.verifier_agency,
        verifier_contact=verification.verifier_contact,
        status=verification.status,
        submitted_at=verification.submitted_at,
        reviewed_at=verification.reviewed_at,
        verified_at=verification.verified_at,
        expires_at=verification.expires_at,
        rejection_reason=verification.rejection_reason,
        certificate_number=verification.certificate_number,
        certificate_url=verification.certificate_url,
        created_at=verification.created_at
    )


@router.get("/{verification_id}", response_model=VerificationResponse)
async def get_verification(
    verification_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get verification details"""
    
    result = await db.execute(
        select(Verification).where(Verification.id == verification_id)
    )
    verification = result.scalar_one_or_none()
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification not found"
        )
    
    return VerificationResponse(
        id=verification.id,
        verification_type=verification.verification_type,
        verifier_agency=verification.verifier_agency,
        verifier_contact=verification.verifier_contact,
        status=verification.status,
        submitted_at=verification.submitted_at,
        reviewed_at=verification.reviewed_at,
        verified_at=verification.verified_at,
        expires_at=verification.expires_at,
        rejection_reason=verification.rejection_reason,
        certificate_number=verification.certificate_number,
        certificate_url=verification.certificate_url,
        created_at=verification.created_at
    )


@router.patch("/{verification_id}", response_model=VerificationResponse)
async def update_verification(
    verification_id: UUID,
    update_data: VerificationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update verification status (for demo/admin purposes)"""
    
    result = await db.execute(
        select(Verification).where(Verification.id == verification_id)
    )
    verification = result.scalar_one_or_none()
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification not found"
        )
    
    # Update fields
    if update_data.status:
        old_status = verification.status
        verification.status = update_data.status
        
        # Update timestamps based on status
        if update_data.status == "documents_submitted":
            verification.submitted_at = datetime.now()
        elif update_data.status == "in_review":
            verification.reviewed_at = datetime.now()
        elif update_data.status == "verified":
            verification.verified_at = datetime.now()
            verification.expires_at = datetime.now() + timedelta(days=365)  # Valid for 1 year
            verification.certificate_number = generate_certificate_number()
    
    if update_data.verifier_agency:
        verification.verifier_agency = update_data.verifier_agency
    
    if update_data.rejection_reason:
        verification.rejection_reason = update_data.rejection_reason
    
    if update_data.certificate_number:
        verification.certificate_number = update_data.certificate_number
    
    if update_data.certificate_url:
        verification.certificate_url = update_data.certificate_url
    
    verification.updated_at = datetime.now()
    
    await db.commit()
    await db.refresh(verification)
    
    return VerificationResponse(
        id=verification.id,
        verification_type=verification.verification_type,
        verifier_agency=verification.verifier_agency,
        verifier_contact=verification.verifier_contact,
        status=verification.status,
        submitted_at=verification.submitted_at,
        reviewed_at=verification.reviewed_at,
        verified_at=verification.verified_at,
        expires_at=verification.expires_at,
        rejection_reason=verification.rejection_reason,
        certificate_number=verification.certificate_number,
        certificate_url=verification.certificate_url,
        created_at=verification.created_at
    )


@router.post("/{verification_id}/submit-documents")
async def submit_documents(
    verification_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark verification as documents submitted"""
    
    result = await db.execute(
        select(Verification).where(Verification.id == verification_id)
    )
    verification = result.scalar_one_or_none()
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification not found"
        )
    
    if verification.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit documents for verification with status: {verification.status}"
        )
    
    verification.status = "documents_submitted"
    verification.submitted_at = datetime.now()
    verification.updated_at = datetime.now()
    
    await db.commit()
    
    return {"message": "Documents submitted successfully", "status": "documents_submitted"}


@router.post("/demo/approve/{verification_id}", response_model=VerificationResponse)
async def demo_approve_verification(
    verification_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Demo endpoint to approve a verification"""
    
    result = await db.execute(
        select(Verification).where(Verification.id == verification_id)
    )
    verification = result.scalar_one_or_none()
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification not found"
        )
    
    # Update to verified status
    verification.status = "verified"
    verification.reviewed_at = datetime.now()
    verification.verified_at = datetime.now()
    verification.expires_at = datetime.now() + timedelta(days=365)
    verification.certificate_number = generate_certificate_number()
    verification.verifier_agency = verification.verifier_agency or "Demo Verification Agency"
    verification.updated_at = datetime.now()
    
    # If this verification is linked to a listing, update the listing
    result = await db.execute(
        select(CreditListing).where(CreditListing.verification_id == verification_id)
    )
    listing = result.scalar_one_or_none()
    if listing:
        listing.verification_status = "verified"
        listing.verification_expiry = verification.expires_at
    
    await db.commit()
    await db.refresh(verification)
    
    return VerificationResponse(
        id=verification.id,
        verification_type=verification.verification_type,
        verifier_agency=verification.verifier_agency,
        verifier_contact=verification.verifier_contact,
        status=verification.status,
        submitted_at=verification.submitted_at,
        reviewed_at=verification.reviewed_at,
        verified_at=verification.verified_at,
        expires_at=verification.expires_at,
        rejection_reason=verification.rejection_reason,
        certificate_number=verification.certificate_number,
        certificate_url=verification.certificate_url,
        created_at=verification.created_at
    )


# ==================== DOCUMENT ENDPOINTS ====================

@router.post("/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    document_data: DocumentUpload,
    verification_id: Optional[UUID] = None,
    project_id: Optional[UUID] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Upload a document for verification"""
    
    document = Document(
        user_id=UUID(user_id),
        verification_id=verification_id,
        project_id=project_id,
        document_type=document_data.document_type,
        filename=document_data.filename,
        file_url=document_data.file_url,
        file_size=document_data.file_size,
        mime_type=document_data.mime_type,
        version=1,
        is_current=True
    )
    
    db.add(document)
    await db.commit()
    await db.refresh(document)
    
    return DocumentResponse(
        id=document.id,
        user_id=document.user_id,
        verification_id=document.verification_id,
        project_id=document.project_id,
        document_type=document.document_type,
        filename=document.filename,
        file_url=document.file_url,
        file_size=document.file_size,
        version=document.version,
        is_current=document.is_current,
        expires_at=document.expires_at,
        created_at=document.created_at
    )


@router.get("/documents", response_model=List[DocumentResponse])
async def get_my_documents(
    document_type: Optional[str] = Query(None),
    verification_id: Optional[UUID] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all documents for the current user"""
    
    query = select(Document).where(
        and_(
            Document.user_id == user_id,
            Document.is_current == True
        )
    )
    
    if document_type:
        query = query.where(Document.document_type == document_type)
    if verification_id:
        query = query.where(Document.verification_id == verification_id)
    
    query = query.order_by(Document.created_at.desc())
    
    result = await db.execute(query)
    documents = result.scalars().all()
    
    return [
        DocumentResponse(
            id=doc.id,
            user_id=doc.user_id,
            verification_id=doc.verification_id,
            project_id=doc.project_id,
            document_type=doc.document_type,
            filename=doc.filename,
            file_url=doc.file_url,
            file_size=doc.file_size,
            version=doc.version,
            is_current=doc.is_current,
            expires_at=doc.expires_at,
            created_at=doc.created_at
        )
        for doc in documents
    ]


# ==================== OCR ENDPOINTS ====================

@router.post("/documents/ocr", response_model=OCRResponse)
async def extract_document_text(
    file: UploadFile = File(...),
    document_type: str = Query(..., description="Type of document: pan_card, gstin, company_registration, gci_certificate, bee_certificate"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Extract text and structured data from uploaded document using OCR"""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are supported for OCR"
        )
    
    # Read file content
    file_contents = await file.read()
    
    # Validate file size (max 10MB)
    if len(file_contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )
    
    try:
        # Extract text and structured data
        result = await extract_text_and_structured_data(
            image_bytes=file_contents,
            document_type=document_type,
            mime_type=file.content_type
        )
        
        return OCRResponse(
            raw_text=result["raw_text"],
            extracted_data=result["extracted_data"],
            confidence=result["confidence"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )


# ==================== LISTING VERIFICATION ENDPOINTS ====================

@router.post("/listings/{listing_id}/request-verification", response_model=VerificationResponse)
async def request_listing_verification(
    listing_id: UUID,
    verifier_agency: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Request verification for a listing"""
    
    # Get the listing
    result = await db.execute(
        select(CreditListing).where(
            and_(
                CreditListing.id == listing_id,
                CreditListing.seller_id == user_id
            )
        )
    )
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found or you don't have permission"
        )
    
    # Check if already has a verification
    if listing.verification_id:
        result = await db.execute(
            select(Verification).where(Verification.id == listing.verification_id)
        )
        existing = result.scalar_one_or_none()
        if existing and existing.status in ["pending", "documents_submitted", "in_review", "verified"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Listing already has a verification with status: {existing.status}"
            )
    
    # Create verification
    verification = Verification(
        verification_type="listing",
        verifier_agency=verifier_agency,
        status="pending"
    )
    
    db.add(verification)
    await db.commit()
    await db.refresh(verification)
    
    # Link to listing
    listing.verification_id = verification.id
    listing.verification_status = "pending"
    
    await db.commit()
    
    return VerificationResponse(
        id=verification.id,
        verification_type=verification.verification_type,
        verifier_agency=verification.verifier_agency,
        verifier_contact=verification.verifier_contact,
        status=verification.status,
        submitted_at=verification.submitted_at,
        reviewed_at=verification.reviewed_at,
        verified_at=verification.verified_at,
        expires_at=verification.expires_at,
        rejection_reason=verification.rejection_reason,
        certificate_number=verification.certificate_number,
        certificate_url=verification.certificate_url,
        created_at=verification.created_at
    )
