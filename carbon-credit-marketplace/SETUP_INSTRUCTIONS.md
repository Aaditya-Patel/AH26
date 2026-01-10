# Setup and Run Instructions

## Prerequisites

1. **Docker and Docker Compose** - Must be installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version` and `docker-compose --version`

2. **OpenAI API Key** - Required for AI agents
   - Get your API key from: https://platform.openai.com/api-keys
   - Keep it ready for the setup

## Step-by-Step Setup

### Step 1: Navigate to Project Directory
```bash
cd carbon-credit-marketplace
```

### Step 2: Generate SECRET_KEY

**Option A: Use the provided script (Recommended)**
```bash
python generate_secret_key.py
```
This will generate a secure random key for you. Copy the output.

**Option B: Generate manually using Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Option C: Use PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Option D: Use OpenSSL (if installed)**
```bash
openssl rand -hex 32
```

### Step 3: Create Environment File
Create a `.env` file in the root directory (`carbon-credit-marketplace/`) with the following content:

```env
OPENAI_API_KEY=your-openai-api-key-here
SECRET_KEY=your-generated-secret-key-here
```

**Important:**
- Replace `your-openai-api-key-here` with your actual OpenAI API key from https://platform.openai.com/api-keys
- Replace `your-generated-secret-key-here` with the key you generated in Step 2

**Example `.env` file:**
```env
OPENAI_API_KEY=sk-proj-abc123xyz789...
SECRET_KEY=bleYw3eR5N-NI3ch3W0dgsHnu91tPkGdu7MRAA1zt_U
```

**Note:** The SECRET_KEY should be:
- At least 32 characters long
- A random, unpredictable string
- Kept secret (never commit to git)
- Different for production environments

### Step 4: Start All Services with Docker Compose
```bash
docker-compose up --build
```

This command will:
- Build Docker images for backend and frontend
- Start PostgreSQL database
- Start Qdrant vector database
- Start Backend API (FastAPI)
- Start Frontend (React)
- Automatically seed the database with demo data
- Ingest research documents into Qdrant

**Note:** The first time will take longer as it builds images and downloads dependencies.

### Step 5: Wait for Services to Start
Wait until you see messages like:
```
✅ Database initialized
✅ Database seeded with mock data
✅ Qdrant initialized and documents ingested
```

### Step 6: Access the Application

Once all services are running, access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Qdrant Dashboard**: http://localhost:6333/dashboard

## Demo Accounts

You can use these pre-seeded accounts to test:

### Buyer Account:
- **Email**: `buyer@demo.com`
- **Password**: `demo123`

### Seller Account:
- **Email**: `seller@demo.com`
- **Password**: `demo123`

### Additional Accounts:
- Buyer 2: `buyer2@demo.com` / `demo123`
- Seller 2: `seller2@demo.com` / `demo123`
- Seller 3: `seller3@demo.com` / `demo123`

## Running in Development Mode (Without Docker)

If you prefer to run services individually:

### Backend Only:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Note:** Make sure PostgreSQL and Qdrant are running, and set environment variables:
- `DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/carbonmarket`
- `QDRANT_URL=http://localhost:6333`
- `OPENAI_API_KEY=your-key`

### Frontend Only:
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

### Issue: Docker containers fail to start
**Solution:** 
- Make sure Docker Desktop is running
- Check if ports 3000, 8000, 5432, 6333 are not already in use
- Try: `docker-compose down` then `docker-compose up --build`

### Issue: Backend fails with "OPENAI_API_KEY not found"
**Solution:**
- Make sure `.env` file exists in the root directory
- Verify the file contains `OPENAI_API_KEY=your-actual-key`
- Restart Docker containers: `docker-compose restart backend`

### Issue: Qdrant initialization fails
**Solution:**
- Check if Qdrant container is running: `docker-compose ps`
- Check Qdrant logs: `docker-compose logs qdrant`
- The education agent will still work, but may have limited functionality

### Issue: Database connection errors
**Solution:**
- Wait for PostgreSQL to be fully ready (healthcheck passes)
- Check PostgreSQL logs: `docker-compose logs postgres`
- Verify DATABASE_URL in docker-compose.yml

### Issue: Frontend can't connect to backend
**Solution:**
- Verify backend is running on http://localhost:8000
- Check CORS settings in `backend/app/main.py`
- Verify `VITE_API_URL` in frontend environment

## Stopping the Services

To stop all services:
```bash
docker-compose down
```

To stop and remove all data (volumes):
```bash
docker-compose down -v
```

## Viewing Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f qdrant
```

## Quick Commands Reference

```bash
# Start services
docker-compose up --build

# Start in background (detached mode)
docker-compose up -d --build

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View service status
docker-compose ps

# Rebuild and restart
docker-compose up --build --force-recreate
```

## Next Steps

1. Open http://localhost:3000 in your browser
2. Register a new account or login with demo credentials
3. Explore the features:
   - **Education Agent**: Ask questions about carbon credits
   - **Calculator**: Calculate your emissions
   - **Matching**: Find suitable sellers
   - **Marketplace**: Browse available credit listings
   - **Formalities**: View government compliance steps

## Support

If you encounter any issues, check:
1. Docker Desktop is running
2. All required ports are available
3. `.env` file is properly configured
4. Services logs for error messages
