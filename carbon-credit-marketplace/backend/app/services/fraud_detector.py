"""
Fraud detection service for registration and document verification
"""
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from uuid import UUID
from app.models.models import User
from app.agents.llm_client import get_completion


async def check_duplicate_registration(
    db: AsyncSession,
    email: str,
    pan: Optional[str] = None,
    gstin: Optional[str] = None
) -> Dict[str, bool]:
    """
    Check for duplicate registrations based on email, PAN, or GSTIN
    
    Returns:
        Dictionary with duplicate flags for email, pan, gstin
    """
    result = {
        "email_duplicate": False,
        "pan_duplicate": False,
        "gstin_duplicate": False
    }
    
    try:
        # Check email
        if email:
            email_query = select(User).where(User.email == email.lower())
            email_result = await db.execute(email_query)
            if email_result.scalar_one_or_none():
                result["email_duplicate"] = True
        
        # Check PAN
        if pan:
            pan_query = select(User).where(User.pan_number == pan.upper())
            pan_result = await db.execute(pan_query)
            if pan_result.scalar_one_or_none():
                result["pan_duplicate"] = True
        
        # Check GSTIN
        if gstin:
            gstin_query = select(User).where(User.gstin == gstin.upper())
            gstin_result = await db.execute(gstin_query)
            if gstin_result.scalar_one_or_none():
                result["gstin_duplicate"] = True
        
        return result
    except Exception as e:
        # On error, return all False (conservative approach)
        return result


async def detect_fraud_indicators(
    user_data: Dict[str, Any],
    documents: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Detect fraud indicators using AI analysis
    
    Args:
        user_data: User registration data
        documents: Dictionary of document extracted data
    
    Returns:
        Dictionary with fraud indicators and suspicious patterns
    """
    try:
        context = f"""
User Registration Data:
- Email: {user_data.get('email', 'N/A')}
- Company Name: {user_data.get('company_name', 'N/A')}
- PAN: {user_data.get('pan_number', 'N/A')}
- GSTIN: {user_data.get('gstin', 'N/A')}
- User Type: {user_data.get('user_type', 'N/A')}

Documents Data:
{str(documents)}
"""
        
        system_prompt = """You are a fraud detection expert. Analyze the provided data for suspicious patterns and fraud indicators.
Look for:
1. Suspicious email patterns (temporary emails, fake domains)
2. Mismatched company information
3. Invalid or suspicious document patterns
4. Inconsistent addresses or contact information
5. Signs of identity theft or impersonation
6. Unusual patterns in registration data

Return JSON with:
- has_fraud_indicators: boolean
- indicators: list of detected fraud indicators
- risk_level: "low", "medium", or "high"
- details: explanation of findings
"""
        
        user_prompt = f"""Analyze the following registration data for fraud indicators:

{context}

Provide your analysis as JSON with the structure specified."""
        
        response = await get_completion(user_prompt, system_prompt)
        
        # Parse JSON response
        import json
        import re
        try:
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = {
                    "has_fraud_indicators": False,
                    "indicators": [],
                    "risk_level": "low",
                    "details": "Could not parse fraud detection response"
                }
        except json.JSONDecodeError:
            result = {
                "has_fraud_indicators": False,
                "indicators": [],
                "risk_level": "low",
                "details": "Error parsing fraud detection response"
            }
        
        return result
    except Exception as e:
        return {
            "has_fraud_indicators": False,
            "indicators": [],
            "risk_level": "low",
            "details": f"Error in fraud detection: {str(e)}"
        }


async def analyze_risk_score(
    user_data: Dict[str, Any],
    documents: Dict[str, Any],
    duplicate_check: Dict[str, bool]
) -> float:
    """
    Calculate risk score (0-100) based on various factors
    
    Args:
        user_data: User registration data
        documents: Dictionary of document extracted data
        duplicate_check: Result from check_duplicate_registration
    
    Returns:
        Risk score from 0 (low risk) to 100 (high risk)
    """
    risk_score = 0.0
    
    # Duplicate registration checks (high risk)
    if duplicate_check.get("email_duplicate"):
        risk_score += 40
    if duplicate_check.get("pan_duplicate"):
        risk_score += 50
    if duplicate_check.get("gstin_duplicate"):
        risk_score += 50
    
    # Missing critical documents (medium risk)
    if not documents:
        risk_score += 20
    elif user_data.get("user_type") == "seller":
        if not documents.get("gci_certificate"):
            risk_score += 15
        if not documents.get("pan_card"):
            risk_score += 10
    
    # Missing KYC fields (low-medium risk)
    if not user_data.get("pan_number"):
        risk_score += 10
    if not user_data.get("gstin"):
        risk_score += 5
    
    # Use AI fraud detection to adjust score
    try:
        fraud_result = await detect_fraud_indicators(user_data, documents)
        if fraud_result.get("has_fraud_indicators"):
            risk_level = fraud_result.get("risk_level", "low")
            if risk_level == "high":
                risk_score += 30
            elif risk_level == "medium":
                risk_score += 15
            elif risk_level == "low":
                risk_score += 5
    except:
        pass  # If AI analysis fails, continue with base score
    
    # Cap at 100
    return min(risk_score, 100.0)
