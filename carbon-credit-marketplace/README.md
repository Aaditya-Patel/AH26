# Carbon Credit Marketplace - Hackathon MVP

A dockerized Carbon Credit Marketplace platform with AI agents for education, emission calculation, seller matching, and government formalities guidance.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key

### Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd carbon-credit-marketplace
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. **Start all services**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Qdrant Dashboard: http://localhost:6333/dashboard

### First Time Setup

The backend will automatically:
- Create database tables
- Seed mock data (2 buyers, 3 sellers, 10 listings)
- Ingest research documents into Qdrant

### Demo Accounts

**Buyer Account:**
- Email: buyer@demo.com
- Password: demo123

**Seller Account:**
- Email: seller@demo.com
- Password: demo123

## Project Structure

```
carbon-credit-marketplace/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docker-compose.yml
└── README.md
```

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

See http://localhost:8000/docs for interactive API documentation.

### Key Endpoints:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/education/chat` - Education agent chat
- `POST /api/calculator/calculate` - Calculate emissions
- `POST /api/matching/find` - Find matched sellers
- `GET /api/marketplace/listings` - Browse listings

## Demo Flow

1. Register/Login as buyer
2. Use Education Agent to learn about carbon credits
3. Calculate emissions using Calculator Agent
4. Find matched sellers using Matching Agent
5. Browse marketplace listings
6. View government formalities steps

## Tech Stack

- **Backend**: FastAPI, PostgreSQL, Qdrant, LangGraph
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **AI**: OpenAI GPT-4o-mini, Qdrant Vector DB
- **Infrastructure**: Docker, Docker Compose

## Team

- Developer 1: Backend Core & Infrastructure
- Developer 2: AI Agents & RAG
- Developer 3: Frontend & UI

## License

MIT
