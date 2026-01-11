"""
Verification Assistant Agent - AI agent to guide users through verification process
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.agents.llm_client import get_completion
from app.models.models import Document, User


VERIFICATION_KNOWLEDGE_BASE = """
Verification Requirements for Carbon Credit Marketplace:

For Buyers:
- PAN Card (mandatory)
- GSTIN Certificate (mandatory for businesses)
- Company Registration Certificate (if applicable)
- Sector information (required for compliance tracking)

For Sellers:
- PAN Card (mandatory)
- GSTIN Certificate (mandatory)
- Company Registration Certificate
- GCI Registry Certificate (mandatory - Grid Controller of India)
- BEE Credit Certificate (if applicable)
- Project documentation

Verification Workflow:
1. User registers and uploads documents
2. Documents are processed via OCR
3. AI validates document formats and extracts data
4. Fraud detection checks for duplicates and suspicious patterns
5. Manual review for high-risk applications
6. Verification approval or rejection

Common Verification Questions:
- Documents are verified for authenticity and completeness
- PAN and GSTIN formats are validated
- Company information must match across documents
- GCI registration is verified for sellers
- Risk scoring helps prioritize manual reviews

Indian Regulatory Context:
- GCI (Grid Controller of India) manages the carbon credit registry
- BEE (Bureau of Energy Efficiency) issues compliance credits
- GSTIN is required for all business transactions
- PAN is required for tax and KYC purposes
"""


async def chat_with_verification_agent(
    question: str,
    user_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Chat with verification assistant about verification process
    
    Args:
        question: User's question
        user_context: Optional user context (user_type, etc.)
    
    Returns:
        Dictionary with answer
    """
    try:
        context_info = ""
        if user_context:
            user_type = user_context.get("user_type", "")
            if user_type:
                context_info = f"\n\nUser Context: The user is a {user_type}."
        
        system_prompt = """You are a verification assistant for a carbon credit marketplace.
Your role is to help users understand the verification process, required documents, and answer questions about verification.
Provide clear, helpful, and accurate information based on Indian regulations and marketplace requirements.
Keep answers concise but informative."""
        
        user_prompt = f"""Based on the following verification knowledge base, answer the user's question about verification.

{VERIFICATION_KNOWLEDGE_BASE}
{context_info}

User Question: {question}

Provide a clear, helpful answer about verification requirements and processes."""
        
        answer = await get_completion(user_prompt, system_prompt)
        
        return {
            "answer": answer
        }
    except Exception as e:
        return {
            "answer": f"I encountered an error while processing your question: {str(e)}. Please try again."
        }


async def get_verification_checklist(user_type: str) -> List[Dict[str, Any]]:
    """
    Get verification checklist for user type
    
    Args:
        user_type: 'buyer' or 'seller'
    
    Returns:
        List of required documents with descriptions
    """
    if user_type == "seller":
        return [
            {
                "document_type": "pan_card",
                "name": "PAN Card",
                "required": True,
                "description": "Permanent Account Number card for tax identification"
            },
            {
                "document_type": "gstin",
                "name": "GSTIN Certificate",
                "required": True,
                "description": "GST Identification Number certificate"
            },
            {
                "document_type": "company_registration",
                "name": "Company Registration Certificate",
                "required": True,
                "description": "Company incorporation or registration certificate"
            },
            {
                "document_type": "gci_certificate",
                "name": "GCI Registry Certificate",
                "required": True,
                "description": "Grid Controller of India registration certificate for carbon credits"
            },
            {
                "document_type": "bee_certificate",
                "name": "BEE Credit Certificate",
                "required": False,
                "description": "Bureau of Energy Efficiency credit certificate (if applicable)"
            }
        ]
    else:  # buyer
        return [
            {
                "document_type": "pan_card",
                "name": "PAN Card",
                "required": True,
                "description": "Permanent Account Number card for tax identification"
            },
            {
                "document_type": "gstin",
                "name": "GSTIN Certificate",
                "required": True,
                "description": "GST Identification Number certificate (for businesses)"
            },
            {
                "document_type": "company_registration",
                "name": "Company Registration Certificate",
                "required": False,
                "description": "Company incorporation certificate (if applicable)"
            }
        ]


async def validate_documents_completeness(
    user_id: UUID,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Check what documents are missing for the user
    
    Args:
        user_id: User ID
        db: Database session
    
    Returns:
        Dictionary with completeness status and missing documents
    """
    try:
        # Get user
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            return {
                "is_complete": False,
                "missing_documents": [],
                "message": "User not found"
            }
        
        # Get checklist
        checklist = await get_verification_checklist(user.user_type)
        required_doc_types = {doc["document_type"] for doc in checklist if doc["required"]}
        
        # Get user's documents
        doc_result = await db.execute(
            select(Document).where(
                Document.user_id == user_id,
                Document.is_current == True
            )
        )
        user_documents = doc_result.scalars().all()
        user_doc_types = {doc.document_type for doc in user_documents}
        
        # Find missing documents
        missing = [
            {
                "document_type": doc_type,
                "name": next((doc["name"] for doc in checklist if doc["document_type"] == doc_type), doc_type),
                "required": True
            }
            for doc_type in required_doc_types
            if doc_type not in user_doc_types
        ]
        
        is_complete = len(missing) == 0
        
        return {
            "is_complete": is_complete,
            "missing_documents": missing,
            "submitted_documents": list(user_doc_types),
            "message": "All required documents submitted" if is_complete else f"Missing {len(missing)} required document(s)"
        }
    except Exception as e:
        return {
            "is_complete": False,
            "missing_documents": [],
            "message": f"Error checking documents: {str(e)}"
        }
