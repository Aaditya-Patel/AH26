# region agent log - Hypothesis A: Import errors
import sys
import traceback
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from contextlib import asynccontextmanager
except Exception as e:
    print(f"ERROR importing FastAPI: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    from app.database import init_db, AsyncSessionLocal
except Exception as e:
    print(f"ERROR importing database: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    from app.config import get_settings
except Exception as e:
    print(f"ERROR importing config: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    from app.data.seed_data import seed_database
except Exception as e:
    print(f"ERROR importing seed_data: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    from app.agents.qdrant_client import init_qdrant, ingest_documents
except Exception as e:
    print(f"ERROR importing qdrant_client: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    settings = get_settings()
except Exception as e:
    print(f"ERROR getting settings: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

# Import all models to ensure they're registered with Base.metadata before init_db()
try:
    from app.models import (  # noqa: E402, F401
        User,
        CreditListing,
        EmissionCalculation,
        Order,
        Transaction,
        Payment,
        CreditAccount,
        CreditTransaction,
        CreditIssuance,
        CreditRetirement,
        Verification,
        Document,
        ComplianceRecord,
        Project,
        PriceHistory,
        MarketStats,
        Notification
    )
    print("✅ All models imported successfully")
except Exception as e:
    print(f"ERROR importing models: {e}", file=sys.stderr)
    traceback.print_exc()
    raise
# endregion agent log


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
# region agent log - Hypothesis B: API router import errors
try:
    from app.api import auth, education, calculator, matching, marketplace, formalities
    print("✅ Core API routers imported")
except Exception as e:
    print(f"ERROR importing core API routers: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    from app.api import transactions, payments, registry
    print("✅ Transaction API routers imported")
except Exception as e:
    print(f"ERROR importing transaction API routers: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    from app.api import verification, compliance, market_data, projects
    print("✅ Extended API routers imported")
except Exception as e:
    print(f"ERROR importing extended API routers: {e}", file=sys.stderr)
    traceback.print_exc()
    raise
# endregion agent log

try:
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(education.router, prefix="/api/education", tags=["Education Agent"])
    app.include_router(calculator.router, prefix="/api/calculator", tags=["Calculator Agent"])
    app.include_router(matching.router, prefix="/api/matching", tags=["Matching Agent"])
    app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace"])
    app.include_router(formalities.router, prefix="/api/formalities", tags=["Formalities Agent"])
    print("✅ Core routers included")
except Exception as e:
    print(f"ERROR including core routers: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

try:
    app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
    app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
    app.include_router(registry.router, prefix="/api/registry", tags=["Credit Registry"])
    app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])
    app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
    app.include_router(market_data.router, prefix="/api/market", tags=["Market Data"])
    app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
    print("✅ Extended routers included")
except Exception as e:
    print(f"ERROR including extended routers: {e}", file=sys.stderr)
    traceback.print_exc()
    raise
