# region agent log - Hypothesis A: Import errors
import os
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
# Parse allowed origins from environment variable
# Use environment variable first, then fall back to settings
origins_str = os.getenv("ALLOWED_ORIGINS", settings.ALLOWED_ORIGINS)

# Handle empty or whitespace-only origins
if not origins_str or not origins_str.strip():
    origins_str = settings.ALLOWED_ORIGINS

origins_str = origins_str.strip()

def expand_origin_variations(origin: str):
    """Expand a single origin to include common variations (with/without port, http/https)"""
    variations = [origin]  # Always include the original
    
    try:
        # If origin has a port (and not default ports), add version without port
        if "://" in origin and ":" in origin:
            protocol, rest = origin.split("://", 1)
            if ":" in rest:
                base, port = rest.rsplit(":", 1)
                if port.isdigit() and port not in ["80", "443"]:
                    # Add without port (implicit port 80 for http, 443 for https)
                    if protocol == "http":
                        variations.append(f"{protocol}://{base}")  # Implicit port 80
                        variations.append(f"{protocol}://{base}:80")  # Explicit port 80
                    elif protocol == "https":
                        variations.append(f"{protocol}://{base}")  # Implicit port 443
                        variations.append(f"{protocol}://{base}:443")  # Explicit port 443
                else:
                    # No port specified or non-numeric, add explicit ports
                    if protocol == "http":
                        variations.append(f"{protocol}://{rest}:80")
                    elif protocol == "https":
                        variations.append(f"{protocol}://{rest}:443")
        else:
            # No port in URL, might need to add with common ports
            if origin.startswith("http://") and ":80" not in origin:
                variations.append(f"{origin}:80")
            elif origin.startswith("https://") and ":443" not in origin:
                variations.append(f"{origin}:443")
        
        # Add HTTPS variant if HTTP (for production flexibility)
        if origin.startswith("http://"):
            https_version = origin.replace("http://", "https://")
            if https_version not in variations:
                variations.append(https_version)
    except Exception as e:
        print(f"⚠️  Warning: Error expanding origin variations for '{origin}': {e}", flush=True)
    
    return variations

if origins_str == "*":
    # If wildcard is specified, we cannot use credentials
    # Use a more permissive configuration without credentials
    print("⚠️  WARNING: Using CORS wildcard (*) with allow_credentials=False", flush=True)
    print("⚠️  This means cookies/credentials will NOT work. Consider specifying exact origins.", flush=True)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # Cannot use credentials with wildcard (CORS spec)
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,  # Cache preflight for 1 hour
    )
else:
    # Parse comma-separated origins
    base_origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]
    
    # Expand each origin to include common variations (with/without port, http/https)
    origins = []
    for origin in base_origins:
        origins.append(origin)  # Always include original
        origins.extend(expand_origin_variations(origin))
    
    # Remove duplicates while preserving order
    seen = set()
    origins_unique = []
    for origin in origins:
        if origin not in seen:
            seen.add(origin)
            origins_unique.append(origin)
    origins = origins_unique
    
    # Add common localhost ports for development (if not already present)
    if settings.ENVIRONMENT == "development":
        localhost_origins = [
            "http://localhost:3000",
            "http://localhost:5173", 
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://localhost",
            "http://127.0.0.1"
        ]
        for origin in localhost_origins:
            if origin not in origins:
                origins.append(origin)
    
    # Ensure we have at least one origin
    if not origins:
        print("⚠️  WARNING: No CORS origins configured. Using wildcard without credentials.", flush=True)
        origins = ["*"]
        allow_credentials = False
    else:
        allow_credentials = True
    
    print(f"✅ CORS configured with {len(origins)} origin(s):", flush=True)
    # Print first 10 origins for readability
    for origin in origins[:10]:
        print(f"   - {origin}", flush=True)
    if len(origins) > 10:
        print(f"   ... and {len(origins) - 10} more origins", flush=True)
    print(f"✅ CORS allow_credentials: {allow_credentials}", flush=True)
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,  # Cache preflight for 1 hour
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
