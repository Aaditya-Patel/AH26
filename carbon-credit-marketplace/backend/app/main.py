from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db, AsyncSessionLocal
from app.config import get_settings
from app.data.seed_data import seed_database
from app.agents.qdrant_client import init_qdrant, ingest_documents

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting Carbon Credit Marketplace API...")
    
    # Initialize database
    await init_db()
    print("✅ Database initialized")
    
    # Seed database with mock data
    async with AsyncSessionLocal() as db:
        await seed_database(db)
    print("✅ Database seeded with mock data")
    
    # Initialize Qdrant and ingest documents
    try:
        await init_qdrant()
        await ingest_documents()
        print("✅ Qdrant initialized and documents ingested")
    except Exception as e:
        print(f"⚠️  Qdrant initialization failed: {str(e)}")
        print("⚠️  Education agent may not work without Qdrant")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Carbon Credit Marketplace API",
    description="AI-powered platform for carbon credit trading",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Carbon Credit Marketplace API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Include routers
from app.api import auth, education, calculator, matching, marketplace, formalities

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(education.router, prefix="/api/education", tags=["Education Agent"])
app.include_router(calculator.router, prefix="/api/calculator", tags=["Calculator Agent"])
app.include_router(matching.router, prefix="/api/matching", tags=["Matching Agent"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace"])
app.include_router(formalities.router, prefix="/api/formalities", tags=["Formalities Agent"])
