"""
Qdrant client for vector database operations
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.config import get_settings
from app.agents.llm_client import get_embedding
import os

settings = get_settings()

# Initialize Qdrant client
client = QdrantClient(url=settings.QDRANT_URL)


async def init_qdrant():
    """Initialize Qdrant collection"""
    try:
        # Recreate collection (will delete existing if present)
        client.recreate_collection(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=1536,  # text-embedding-3-small dimension
                distance=Distance.COSINE
            )
        )
        print(f"✅ Qdrant collection '{settings.QDRANT_COLLECTION_NAME}' initialized")
    except Exception as e:
        print(f"⚠️  Error initializing Qdrant: {str(e)}")
        raise


async def ingest_documents():
    """Ingest carbon research documents into Qdrant"""
    try:
        # Read the research document
        doc_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "documents",
            "carbon_research.md"
        )
        
        if not os.path.exists(doc_path):
            print(f"⚠️  Document not found at {doc_path}")
            return
        
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Split document into chunks (~500 words each)
        chunks = split_into_chunks(content, chunk_size=500)
        
        print(f"📄 Splitting document into {len(chunks)} chunks...")
        
        # Generate embeddings and store in Qdrant
        points = []
        for idx, chunk in enumerate(chunks):
            # Generate embedding
            embedding = await get_embedding(chunk["text"])
            
            # Create point
            point = PointStruct(
                id=idx,
                vector=embedding,
                payload={
                    "text": chunk["text"],
                    "section": chunk.get("section", "Unknown"),
                    "chunk_index": idx,
                    "source": "carbon_research.md"
                }
            )
            points.append(point)
        
        # Batch upload points
        client.upsert(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points=points
        )
        
        print(f"✅ Ingested {len(points)} document chunks into Qdrant")
    except Exception as e:
        print(f"⚠️  Error ingesting documents: {str(e)}")
        raise


def split_into_chunks(text: str, chunk_size: int = 500) -> list[dict]:
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
            # Remove # and clean up
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


async def search_documents(query: str, limit: int = 5) -> list[dict]:
    """Search for relevant document chunks"""
    try:
        # Generate query embedding
        query_embedding = await get_embedding(query)
        
        # Search Qdrant
        results = client.search(
            collection_name=settings.QDRANT_COLLECTION_NAME,
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
                "source": result.payload.get("source", "carbon_research.md")
            })
        
        return documents
    except Exception as e:
        print(f"⚠️  Error searching documents: {str(e)}")
        return []
