"""
Document fetcher service for formalities documents
Supports local files and web scraping (for future use)
"""
import os
from typing import List, Dict, Optional
from pathlib import Path


def get_local_documents(base_path: str) -> List[Dict[str, str]]:
    """
    Get list of local formalities documents
    
    Args:
        base_path: Base directory path for documents
    
    Returns:
        List of document metadata dictionaries
    """
    documents = []
    doc_path = Path(base_path)
    
    if not doc_path.exists():
        return documents
    
    # Supported file extensions
    supported_extensions = ['.md', '.txt', '.html', '.pdf']
    
    for file_path in doc_path.rglob('*'):
        if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
            rel_path = file_path.relative_to(doc_path)
            
            # Extract category from directory structure
            parts = rel_path.parts
            category = parts[0] if len(parts) > 1 else "general"
            
            documents.append({
                "path": str(file_path),
                "filename": file_path.name,
                "category": category,
                "type": file_path.suffix.lower()[1:],  # Remove the dot
                "source": "local"
            })
    
    return documents


def read_local_document(file_path: str) -> str:
    """
    Read content from a local document file
    
    Args:
        file_path: Path to the document file
    
    Returns:
        Document content as string
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        raise Exception(f"Error reading document {file_path}: {str(e)}")


def parse_html_to_text(html_content: str) -> str:
    """
    Parse HTML content to clean text
    
    Args:
        html_content: HTML content as string
    
    Returns:
        Clean text content
    """
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    except ImportError:
        # Fallback: simple text extraction
        import re
        text = re.sub(r'<[^>]+>', '', html_content)
        return text.strip()
    except Exception as e:
        raise Exception(f"Error parsing HTML: {str(e)}")


def parse_pdf_to_text(pdf_path: str) -> str:
    """
    Parse PDF document to text
    
    Args:
        pdf_path: Path to PDF file
    
    Returns:
        Extracted text content
    """
    try:
        import PyPDF2
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except ImportError:
        raise Exception("PyPDF2 is required for PDF parsing. Install it with: pip install PyPDF2")
    except Exception as e:
        raise Exception(f"Error parsing PDF {pdf_path}: {str(e)}")


# Future: Web scraping functions (for post-MVP)
# def fetch_gov_documents():
#     """Fetch documents from government websites"""
#     pass

# def fetch_form_templates():
#     """Download form templates and guidelines"""
#     pass
