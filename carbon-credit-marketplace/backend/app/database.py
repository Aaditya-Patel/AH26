from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import get_settings

settings = get_settings()

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database - drop and recreate all tables (for development)"""
    import sys
    import traceback
    from sqlalchemy import text
    
    # Ensure all models are imported and registered with Base.metadata
    # Import inside function to avoid circular imports during module load
    try:
        from app.models.models import (  # noqa: F401
            User, CreditListing, EmissionCalculation, Order, Transaction,
            Payment, CreditAccount, CreditTransaction, CreditIssuance,
            CreditRetirement, Verification, Document, ComplianceRecord,
            Project, PriceHistory, MarketStats, Notification
        )
        model_count = len(Base.metadata.tables)
        print(f"🔄 INIT_DB: {model_count} models registered", flush=True)
        if model_count == 0:
            raise Exception("No models registered with Base.metadata!")
    except Exception as import_error:
        print(f"❌ INIT_DB: Failed to import models: {import_error}", file=sys.stderr, flush=True)
        traceback.print_exc()
        raise
    
    try:
        async with engine.begin() as conn:
            # Drop all existing tables using raw SQL (CASCADE handles foreign keys)
            print("🔄 INIT_DB: Dropping all existing tables...", flush=True)
            
            def drop_all_tables(sync_conn):
                # Get all table names from information_schema (more reliable than pg_tables)
                result = sync_conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                """))
                table_names = [row[0] for row in result.fetchall()]
                
                if not table_names:
                    print("  ✅ No existing tables to drop", flush=True)
                    return
                
                print(f"  📊 Found {len(table_names)} tables to drop: {table_names}", flush=True)
                
                # Drop all tables with CASCADE to handle foreign key constraints
                # CASCADE automatically drops dependent objects (foreign keys, indexes, etc.)
                for table_name in table_names:
                    try:
                        # Use IF EXISTS to avoid errors if table doesn't exist
                        sync_conn.execute(text(f'DROP TABLE IF EXISTS public."{table_name}" CASCADE'))
                        print(f"  ✓ Dropped table: {table_name}", flush=True)
                    except Exception as e:
                        print(f"  ⚠ Error dropping {table_name}: {e}", flush=True)
                        # Continue with other tables even if one fails
                
                # Verify all tables were dropped
                result = sync_conn.execute(text("""
                    SELECT COUNT(*) 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                """))
                remaining = result.scalar()
                if remaining > 0:
                    print(f"  ⚠ WARNING: {remaining} tables still exist after drop attempt", flush=True)
                else:
                    print(f"✅ Successfully dropped all {len(table_names)} tables", flush=True)
            
            await conn.run_sync(drop_all_tables)
            
            # Create all tables from current models
            print("🔄 INIT_DB: Creating all tables from models...", flush=True)
            
            def create_all_tables(sync_conn):
                expected_tables = list(Base.metadata.tables.keys())
                print(f"  📝 Expected {len(expected_tables)} tables: {expected_tables}", flush=True)
                
                # Create all tables
                Base.metadata.create_all(bind=sync_conn, checkfirst=False)
                
                # Verify users table schema
                result = sync_conn.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'users'
                    ORDER BY ordinal_position
                """))
                users_cols = {row[0]: row[1] for row in result.fetchall()}
                print(f"  📋 Users table has {len(users_cols)} columns", flush=True)
                
                required = ['gci_registration_id', 'pan_number', 'gstin', 'is_kyc_verified']
                missing = [col for col in required if col not in users_cols]
                
                if missing:
                    print(f"  ❌ MISSING COLUMNS in users: {missing}", flush=True)
                    print(f"  📋 Existing columns: {list(users_cols.keys())}", flush=True)
                    raise ValueError(f"Schema mismatch: users table missing columns {missing}")
                
                print(f"  ✅ Users table has all required columns", flush=True)
            
            await conn.run_sync(create_all_tables)
            print("✅ INIT_DB: Database schema initialized successfully", flush=True)
            
    except Exception as e:
        print(f"❌ INIT_DB FAILED: {e}", file=sys.stderr, flush=True)
        traceback.print_exc()
        raise
