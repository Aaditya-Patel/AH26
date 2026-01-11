"""
Document validation service for PAN, GSTIN, GCI, and consistency checks
"""
import re
from typing import Dict, Any, Optional
from app.agents.llm_client import get_completion


def validate_pan_number(pan: str) -> bool:
    """
    Validate PAN number format
    
    Format: [A-Z]{5}[0-9]{4}[A-Z]{1}
    Example: ABCDE1234F
    """
    if not pan:
        return False
    
    pan = pan.upper().strip()
    
    # Basic format validation
    pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    if not re.match(pattern, pan):
        return False
    
    # Additional checksum validation (simplified - actual PAN checksum is more complex)
    # For MVP, format validation is sufficient
    return True


def validate_gstin(gstin: str) -> bool:
    """
    Validate GSTIN format
    
    Format: 15 characters, state code (2 digits) + PAN (10 chars) + entity number (1) + Z + check digit (1)
    Example: 29ABCDE1234F1Z5
    """
    if not gstin:
        return False
    
    gstin = gstin.upper().strip()
    
    # Basic format validation - 15 characters
    if len(gstin) != 15:
        return False
    
    # First 2 digits should be state code (01-38 for Indian states/UTs)
    state_code = gstin[:2]
    if not state_code.isdigit() or int(state_code) < 1 or int(state_code) > 38:
        return False
    
    # Next 10 characters should be PAN format
    pan_part = gstin[2:12]
    if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan_part):
        return False
    
    # 13th character should be entity number (1-9 or A-Z)
    entity_num = gstin[12]
    if not (entity_num.isdigit() and 1 <= int(entity_num) <= 9) and not entity_num.isalpha():
        return False
    
    # 14th character should be 'Z'
    if gstin[13] != 'Z':
        return False
    
    # Last character should be check digit (0-9 or A-Z)
    check_digit = gstin[14]
    if not (check_digit.isdigit() or check_digit.isalpha()):
        return False
    
    return True


def validate_gci_registration_id(gci_id: str) -> bool:
    """
    Validate GCI Registration ID format
    
    Format varies, but typically alphanumeric with specific pattern
    For MVP, basic validation (non-empty, reasonable length)
    """
    if not gci_id:
        return False
    
    gci_id = gci_id.strip()
    
    # Basic validation: should be alphanumeric, length between 8-20 characters
    if len(gci_id) < 8 or len(gci_id) > 20:
        return False
    
    # Should contain alphanumeric characters and possibly hyphens
    if not re.match(r'^[A-Z0-9\-]+$', gci_id.upper()):
        return False
    
    return True


async def validate_document_consistency(
    documents: Dict[str, Any],
    user_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Validate consistency across documents using AI
    
    Checks:
    - Company names match across documents
    - Addresses are consistent
    - PAN/GSTIN match user data
    - Dates are logical
    
    Args:
        documents: Dictionary of document extracted data
        user_data: User registration data
    
    Returns:
        Dictionary with validation results and issues
    """
    try:
        # Build context for LLM analysis
        context = f"""
User Registration Data:
- Company Name: {user_data.get('company_name', 'N/A')}
- PAN: {user_data.get('pan_number', 'N/A')}
- GSTIN: {user_data.get('gstin', 'N/A')}

Documents Extracted Data:
{str(documents)}
"""
        
        system_prompt = """You are a document verification expert. Analyze the consistency of information across documents.
Check for:
1. Matching company names (allowing for slight variations)
2. Consistent addresses
3. Matching PAN/GSTIN numbers
4. Logical date sequences
5. Any suspicious inconsistencies

Return a JSON response with:
- is_consistent: boolean
- issues: list of inconsistencies found
- confidence: float (0-1)
"""
        
        user_prompt = f"""Analyze the consistency of the following documents and user data:

{context}

Provide your analysis as JSON with the structure specified."""
        
        response = await get_completion(user_prompt, system_prompt)
        
        # Parse JSON response
        import json
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                # Fallback if JSON not found
                result = {
                    "is_consistent": False,
                    "issues": ["Could not parse validation response"],
                    "confidence": 0.5
                }
        except json.JSONDecodeError:
            result = {
                "is_consistent": False,
                "issues": ["Error parsing validation response"],
                "confidence": 0.5
            }
        
        return result
    except Exception as e:
        return {
            "is_consistent": False,
            "issues": [f"Validation error: {str(e)}"],
            "confidence": 0.0
        }


def validate_document_format(document_type: str, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate that extracted data contains required fields for document type
    
    Returns:
        Dictionary with is_valid, missing_fields, and issues
    """
    required_fields = {
        "pan_card": ["name", "pan_number"],
        "gstin": ["gstin", "legal_name"],
        "company_registration": ["company_name", "cin"],
        "gci_certificate": ["registration_id", "company_name"],
        "bee_certificate": ["certificate_number", "credits_issued"]
    }
    
    required = required_fields.get(document_type, [])
    missing = []
    
    for field in required:
        if field not in extracted_data or not extracted_data[field]:
            missing.append(field)
    
    return {
        "is_valid": len(missing) == 0,
        "missing_fields": missing,
        "issues": [f"Missing required field: {field}" for field in missing] if missing else []
    }
