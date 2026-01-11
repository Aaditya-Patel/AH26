"""
Document OCR service using OpenAI Vision API
"""
import base64
from typing import Dict, Optional, Any
from openai import AsyncOpenAI
from app.config import get_settings
from app.agents.llm_client import client

settings = get_settings()


async def extract_text_from_image(image_bytes: bytes, mime_type: str) -> str:
    """
    Extract raw text from an image using OpenAI Vision API
    
    Args:
        image_bytes: Image file bytes
        mime_type: MIME type of the image (e.g., 'image/jpeg', 'image/png')
    
    Returns:
        Extracted text as string
    """
    try:
        # Convert image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Determine format from mime_type
        if 'jpeg' in mime_type or 'jpg' in mime_type:
            image_format = "jpeg"
        elif 'png' in mime_type:
            image_format = "png"
        elif 'gif' in mime_type:
            image_format = "gif"
        elif 'webp' in mime_type:
            image_format = "webp"
        else:
            image_format = "png"  # Default
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all text from this document image. Return only the raw extracted text, no formatting."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{image_format};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from image: {str(e)}")


async def extract_structured_data(
    image_bytes: bytes,
    document_type: str,
    mime_type: str
) -> Dict[str, Any]:
    """
    Extract structured data from document image based on document type
    
    Args:
        image_bytes: Image file bytes
        document_type: Type of document (pan_card, gstin, company_registration, gci_certificate, bee_certificate)
        mime_type: MIME type of the image
    
    Returns:
        Dictionary with extracted structured data
    """
    try:
        # Convert image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Determine format from mime_type
        if 'jpeg' in mime_type or 'jpg' in mime_type:
            image_format = "jpeg"
        elif 'png' in mime_type:
            image_format = "png"
        elif 'gif' in mime_type:
            image_format = "gif"
        elif 'webp' in mime_type:
            image_format = "webp"
        else:
            image_format = "png"
        
        # Define extraction prompts for each document type
        extraction_prompts = {
            "pan_card": """Extract the following information from this PAN card image:
- name: Full name
- pan_number: PAN number (10 characters)
- father_name: Father's name
- date_of_birth: Date of birth (format: YYYY-MM-DD)

Return as JSON with these exact keys. If any field is not found, set it to null.""",
            
            "gstin": """Extract the following information from this GSTIN certificate image:
- gstin: GSTIN number (15 characters)
- legal_name: Legal name of the business
- trade_name: Trade name (if different)
- address: Complete address
- state: State name

Return as JSON with these exact keys. If any field is not found, set it to null.""",
            
            "company_registration": """Extract the following information from this company registration document:
- company_name: Full company name
- cin: Corporate Identity Number (CIN)
- registration_date: Date of registration (format: YYYY-MM-DD)
- address: Registered address

Return as JSON with these exact keys. If any field is not found, set it to null.""",
            
            "gci_certificate": """Extract the following information from this GCI Registry Certificate:
- registration_id: GCI registration ID
- company_name: Company name
- issue_date: Issue date (format: YYYY-MM-DD)
- validity: Validity date or expiry date (format: YYYY-MM-DD)

Return as JSON with these exact keys. If any field is not found, set it to null.""",
            
            "bee_certificate": """Extract the following information from this BEE Credit Certificate:
- certificate_number: Certificate number
- credits_issued: Number of credits issued
- project_type: Type of project
- vintage: Year (if mentioned)

Return as JSON with these exact keys. If any field is not found, set it to null."""
        }
        
        prompt = extraction_prompts.get(
            document_type,
            "Extract all relevant information from this document and return as JSON."
        )
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{image_format};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        
        import json
        extracted_data = json.loads(response.choices[0].message.content)
        
        return extracted_data
    except Exception as e:
        raise Exception(f"Error extracting structured data: {str(e)}")


async def extract_text_and_structured_data(
    image_bytes: bytes,
    document_type: str,
    mime_type: str
) -> Dict[str, Any]:
    """
    Extract both raw text and structured data from document
    
    Args:
        image_bytes: Image file bytes
        document_type: Type of document
        mime_type: MIME type of the image
    
    Returns:
        Dictionary with 'raw_text' and 'extracted_data' keys
    """
    try:
        raw_text = await extract_text_from_image(image_bytes, mime_type)
        extracted_data = await extract_structured_data(image_bytes, document_type, mime_type)
        
        return {
            "raw_text": raw_text,
            "extracted_data": extracted_data,
            "confidence": 0.9  # OpenAI Vision has high accuracy
        }
    except Exception as e:
        raise Exception(f"Error extracting text and data: {str(e)}")
