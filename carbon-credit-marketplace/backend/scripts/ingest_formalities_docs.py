"""
Script to ingest formalities documents into Qdrant
Run this script to populate the formalities knowledge base
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agents.formalities_qdrant import init_formalities_collection, ingest_formalities_documents


async def main():
    """Main function to initialize collection and ingest documents"""
    print("🚀 Starting formalities documents ingestion...")
    
    try:
        # Initialize collection
        print("\n📦 Initializing Qdrant collection...")
        await init_formalities_collection()
        
        # Ingest documents
        print("\n📄 Ingesting documents...")
        await ingest_formalities_documents()
        
        print("\n✅ Formalities documents ingestion completed!")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
