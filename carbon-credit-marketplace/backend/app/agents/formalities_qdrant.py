"""
Qdrant client for formalities documents collection
"""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.config import get_settings
from app.agents.llm_client import get_embedding
import os
from typing import List, Dict

settings = get_settings()

# Initialize Qdrant client
client = QdrantClient(url=settings.QDRANT_URL)


async def init_formalities_collection():
    """Initialize Qdrant collection for formalities documents"""
    try:
        # Check if collection exists, if not create it
        collections = client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if settings.QDRANT_FORMALITIES_COLLECTION_NAME not in collection_names:
            client.create_collection(
                collection_name=settings.QDRANT_FORMALITIES_COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=1536,  # text-embedding-3-small dimension
                    distance=Distance.COSINE
                )
            )
            print(f"✅ Qdrant formalities collection '{settings.QDRANT_FORMALITIES_COLLECTION_NAME}' created")
        else:
            print(f"✅ Qdrant formalities collection '{settings.QDRANT_FORMALITIES_COLLECTION_NAME}' already exists")
    except Exception as e:
        print(f"⚠️  Error initializing formalities collection: {str(e)}")
        raise


def split_into_chunks(text: str, chunk_size: int = 500) -> List[Dict[str, str]]:
    """Split text into chunks of approximately chunk_size words"""
    lines = text.split('\n')
    chunks = []
    current_section = "Introduction"
    
    current_chunk_lines = []
    current_chunk_word_count = 0
    
    for line in lines:
        line_stripped = line.strip()
        
        # Detect section headers (lines starting with ##)
        if line_stripped.startswith("##"):
            # Save current chunk if it has content
            if current_chunk_lines:
                chunk_text = '\n'.join(current_chunk_lines).strip()
                if chunk_text:
                    chunks.append({
                        "text": chunk_text,
                        "section": current_section
                    })
                current_chunk_lines = []
                current_chunk_word_count = 0
            
            # Extract section name
            section_name = line_stripped.lstrip('#').strip()
            if section_name:
                current_section = section_name
            continue
        
        # Skip empty lines at chunk boundaries
        if not line_stripped and not current_chunk_lines:
            continue
        
        # Count words in this line
        line_words = line_stripped.split()
        line_word_count = len(line_words)
        
        # If adding this line would exceed chunk size, save current chunk
        if current_chunk_word_count + line_word_count >= chunk_size and current_chunk_lines:
            chunk_text = '\n'.join(current_chunk_lines).strip()
            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "section": current_section
                })
            current_chunk_lines = [line]
            current_chunk_word_count = line_word_count
        else:
            current_chunk_lines.append(line)
            current_chunk_word_count += line_word_count
    
    # Add remaining chunk
    if current_chunk_lines:
        chunk_text = '\n'.join(current_chunk_lines).strip()
        if chunk_text:
            chunks.append({
                "text": chunk_text,
                "section": current_section
            })
    
    return chunks


async def ingest_formalities_documents(documents_dir: str = None):
    """Ingest formalities documents into Qdrant"""
    try:
        from app.services.document_fetcher import get_local_documents, read_local_document, parse_html_to_text, parse_pdf_to_text
        
        # Determine documents directory
        if documents_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            documents_dir = os.path.join(base_dir, "documents", "formalities")
        
        # Ensure directory exists
        os.makedirs(documents_dir, exist_ok=True)
        
        # Get list of documents
        documents = get_local_documents(documents_dir)
        
        if not documents:
            print(f"⚠️  No documents found in {documents_dir}")
            print("💡 Add documents to the formalities directory to enable RAG")
            return
        
        print(f"📄 Found {len(documents)} documents to ingest...")
        
        all_points = []
        point_id = 0
        
        for doc in documents:
            try:
                # Read document content
                if doc["type"] == "pdf":
                    content = parse_pdf_to_text(doc["path"])
                elif doc["type"] == "html":
                    content = read_local_document(doc["path"])
                    content = parse_html_to_text(content)
                else:
                    content = read_local_document(doc["path"])
                
                # Split into chunks
                chunks = split_into_chunks(content, chunk_size=500)
                
                print(f"  📝 Processing {doc['filename']}: {len(chunks)} chunks")
                
                # Generate embeddings and create points
                for chunk in chunks:
                    embedding = await get_embedding(chunk["text"])
                    
                    point = PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload={
                            "text": chunk["text"],
                            "section": chunk.get("section", "Unknown"),
                            "chunk_index": point_id,
                            "source": doc["filename"],
                            "category": doc.get("category", "general"),
                            "file_type": doc["type"]
                        }
                    )
                    all_points.append(point)
                    point_id += 1
                    
            except Exception as e:
                print(f"⚠️  Error processing {doc['filename']}: {str(e)}")
                continue
        
        if not all_points:
            print("⚠️  No document chunks to ingest")
            return
        
        # Batch upload points (upsert to allow re-ingestion)
        client.upsert(
            collection_name=settings.QDRANT_FORMALITIES_COLLECTION_NAME,
            points=all_points
        )
        
        print(f"✅ Ingested {len(all_points)} document chunks into formalities collection")
    except Exception as e:
        print(f"⚠️  Error ingesting formalities documents: {str(e)}")
        raise


async def search_formalities_documents(query: str, limit: int = 5) -> List[Dict]:
    """Search for relevant formalities document chunks"""
    try:
        # Generate query embedding
        query_embedding = await get_embedding(query)
        
        # Search Qdrant
        results = client.search(
            collection_name=settings.QDRANT_FORMALITIES_COLLECTION_NAME,
            query_vector=query_embedding,
            limit=limit
        )
        
        # Format results
        documents = []
        for result in results:
            documents.append({
                "text": result.payload.get("text", ""),
                "section": result.payload.get("section", "Unknown"),
                "score": result.score,
                "source": result.payload.get("source", "Unknown"),
                "category": result.payload.get("category", "general")
            })
        
        return documents
    except Exception as e:
        print(f"⚠️  Error searching formalities documents: {str(e)}")
        return []
