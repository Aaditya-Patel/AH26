# Developer Task Checklist - Carbon Credit Marketplace

## 📋 Hour 0: All Developers - Initial Setup (30 min)

- [x] Clone repository
- [x] Review project structure
- [x] Review API contracts in this document
- [x] Set up local environment with Docker

```bash
# Run this to start
docker-compose up --build
```

---

## 👨‍💻 Developer 1: Backend Core (6-7 hours)

### ✅ COMPLETED (Hour 0-1):
- [x] Docker setup (docker-compose.yml, Dockerfiles)
- [x] Backend project structure
- [x] FastAPI main.py with CORS
- [x] Database models (User, CreditListing, EmissionCalculation)
- [x] Pydantic schemas
- [x] Authentication endpoints (register, login, /me)
- [x] Marketplace endpoints (GET/POST listings)
- [x] Placeholder endpoints for calculator, matching, formalities

### 🔧 TODO (Hours 1-6):

**Hour 1-2: Implement Seed Data**
- [ ] Complete `app/data/seed_data.py`:
  - Create 2 buyer accounts (buyer@demo.com, buyer2@demo.com, password: demo123)
  - Create 3 seller accounts (seller@demo.com, seller2@demo.com, seller3@demo.com, password: demo123)
  - Create 10 credit listings with varied:
    - Quantities: 50-200 credits
    - Prices: ₹2,000-₹3,500
    - Vintages: 2022-2024
    - Project types: Renewable Energy, Forestry, Energy Efficiency, Green Hydrogen
- [ ] Add seed_database() call to main.py startup event
- [ ] Test database seeding

**Hour 2-3: Test All Endpoints**
- [ ] Test auth endpoints with Swagger UI (http://localhost:8000/docs)
- [ ] Test marketplace endpoints
- [ ] Verify JWT authentication works
- [ ] Fix any bugs

**Hour 3-6: Support Developer 2 & 3**
- [ ] Help debug any backend issues
- [ ] Update models/schemas if needed for agents
- [ ] Ensure CORS is working for frontend
- [ ] Monitor logs and fix errors

---

## 🤖 Developer 2: AI Agents (6-7 hours)

### ✅ COMPLETED (Hour 0):
- [x] Agent file structure created
- [x] Placeholder agent files
- [x] Emission factors data structure
- [x] API endpoints scaffolded

### 🔧 TODO (Hours 0-7):

**Hour 0-1: Qdrant & LLM Setup**
- [ ] Implement `app/agents/qdrant_client.py`:
  ```python
  from qdrant_client import QdrantClient
  from qdrant_client.models import Distance, VectorParams, PointStruct
  
  client = QdrantClient(url=settings.QDRANT_URL)
  
  async def init_qdrant():
      # Create collection
      client.recreate_collection(
          collection_name=settings.QDRANT_COLLECTION_NAME,
          vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
      )
  ```
- [ ] Implement `app/agents/llm_client.py`:
  ```python
  from openai import AsyncOpenAI
  client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
  
  async def get_embedding(text: str):
      response = await client.embeddings.create(
          input=text,
          model="text-embedding-3-small"
      )
      return response.data[0].embedding
  
  async def get_completion(prompt: str, system_prompt: str = None):
      messages = []
      if system_prompt:
          messages.append({"role": "system", "content": system_prompt})
      messages.append({"role": "user", "content": prompt})
      
      response = await client.chat.completions.create(
          model="gpt-4o-mini",
          messages=messages
      )
      return response.choices[0].message.content
  ```

**Hour 1-2: Document Ingestion**
- [ ] Create document ingestion script:
  ```python
  # Read backend/documents/carbon_research.md
  # Split into chunks (~500 words each)
  # Generate embeddings for each chunk
  # Store in Qdrant with metadata (section, page, etc.)
  ```
- [ ] Add to main.py startup event
- [ ] Test retrieval

**Hour 2-3: Education Agent**
- [ ] Implement `app/agents/education_agent.py`:
  ```python
  async def chat_with_education_agent(question: str):
      # 1. Get embedding for question
      # 2. Search Qdrant for relevant chunks (top 3)
      # 3. Build prompt with context
      # 4. Get LLM completion
      # 5. Return answer + sources
  ```
- [ ] Update `app/api/education.py` to use agent
- [ ] Test with questions

**Hour 3-4: Calculator Agent**
- [ ] Implement `app/agents/calculator_agent.py`:
  ```python
  def calculate_emissions(sector: str, answers: dict):
      factors = EMISSION_FACTORS[sector]
      
      # Example for cement:
      scope1 = (
          answers.get('clinker_production', 0) * factors['scope1']['clinker_production'] +
          answers.get('coal_consumption', 0) * factors['scope1']['fuel_coal']
      )
      scope2 = answers.get('electricity_consumption', 0) * factors['scope2']['electricity']
      scope3 = ... # Calculate
      
      total = scope1 + scope2 + scope3
      credits_needed = math.ceil(total)  # Round up
      cost_estimate = credits_needed * 2500  # Average price
      
      return {
          "total_emissions": total,
          "scope1_emissions": scope1,
          "scope2_emissions": scope2,
          "scope3_emissions": scope3,
          "credits_needed": credits_needed,
          "cost_estimate": cost_estimate,
          "breakdown": [...]
      }
  ```
- [ ] Update `app/api/calculator.py`
- [ ] Test calculations

**Hour 4-5: Matching Agent**
- [ ] Implement `app/agents/matching_agent.py`:
  ```python
  async def find_matched_sellers(request: dict, db):
      # Query listings from database
      # Score each listing:
      #   - Price match (weight: 40%)
      #   - Quantity available (weight: 30%)
      #   - Vintage match (weight: 20%)
      #   - Project type match (weight: 10%)
      # Sort by score
      # Return top 5
  ```
- [ ] Update `app/api/matching.py`
- [ ] Test matching

**Hour 5-6: Integration & Testing**
- [ ] Test all 4 agents end-to-end
- [ ] Fix bugs
- [ ] Ensure responses match frontend expectations

---

## 🎨 Developer 3: Frontend (6-7 hours)

### ✅ COMPLETED (Hour 0-1):
- [x] Frontend project structure
- [x] React + Vite + TypeScript setup
- [x] Tailwind CSS configured
- [x] All page components created
- [x] API client with auth interceptor
- [x] Zustand store for auth
- [x] Layout component with navbar
- [x] Reusable components (ChatBox, SellerCard)

### 🔧 TODO (Hours 1-7):

**Hour 1-2: Test & Polish Auth Pages**
- [ ] Test register flow (buyer and seller)
- [ ] Test login flow
- [ ] Verify token storage
- [ ] Add loading states
- [ ] Add error handling
- [ ] Polish UI

**Hour 2-3: Polish Dashboard**
- [ ] Test dashboard routing
- [ ] Verify role-based display (buyer vs seller)
- [ ] Add real data when backend is ready
- [ ] Polish layout

**Hour 3-4: Polish Agent Pages**
- [ ] Test Education chat interface
- [ ] Test Calculator multi-step form
- [ ] Test Matching form and results
- [ ] Test Marketplace listing display
- [ ] Test Formalities workflow display
- [ ] Add loading states everywhere
- [ ] Add error handling

**Hour 4-5: Integration**
- [ ] Test full user flow:
  1. Register → Login
  2. Use Education Agent
  3. Use Calculator
  4. Use Matching
  5. Browse Marketplace
  6. View Formalities
- [ ] Fix any API integration issues
- [ ] Ensure all pages work

**Hour 5-6: Polish & Responsive**
- [ ] Make pages mobile-responsive
- [ ] Add loading spinners
- [ ] Improve error messages
- [ ] Add success notifications
- [ ] Final UI polish

**Hour 6-7: Demo Preparation**
- [ ] Test demo flow
- [ ] Fix any remaining bugs
- [ ] Prepare test accounts
- [ ] Screen recording (optional)

---

## 🔄 Hour 6-7: Integration (All Developers)

### All Together:
- [ ] Test full end-to-end flow
- [ ] Fix integration bugs
- [ ] Verify all agents work
- [ ] Test demo scenario
- [ ] Prepare for presentation

---

## 📝 API Contracts Reference

### Auth
```
POST /api/auth/register
Body: { email, password, user_type, company_name, sector? }
Response: { access_token, user }

POST /api/auth/login  
Body: { email, password }
Response: { access_token, user }

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user }
```

### Education
```
POST /api/education/chat
Body: { question: string }
Response: { answer: string, sources: string[] }
```

### Calculator
```
POST /api/calculator/calculate
Body: { sector: string, answers: dict }
Response: { total_emissions, scope1, scope2, scope3, credits_needed, cost_estimate, breakdown }
```

### Matching
```
POST /api/matching/find
Body: { credits_needed, max_price?, preferred_vintage?, preferred_project_type? }
Response: { matches: [{ seller_id, seller_name, listing_id, quantity, price_per_credit, vintage, project_type, match_score, reasons }] }
```

### Marketplace
```
GET /api/marketplace/listings?vintage=&project_type=&min_price=&max_price=
Response: { listings: [...] }

POST /api/marketplace/listings (seller only)
Body: { quantity, price_per_credit, vintage, project_type, description? }
Response: { listing }
```

### Formalities
```
GET /api/formalities/steps/{workflow_type}
Response: { workflow_type, steps: [{ step, title, description, documents }] }
```

---

## 🚀 Quick Commands

```bash
# Start everything
docker-compose up --build

# Backend only
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend only
cd frontend
npm install
npm run dev

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access services
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Frontend: http://localhost:3000
# Qdrant: http://localhost:6333/dashboard
```

---

## ✅ Definition of Done

### Backend (Dev 1):
- [ ] All endpoints working
- [ ] Database seeded with demo data
- [ ] Auth working with JWT
- [ ] Swagger docs accessible

### AI Agents (Dev 2):
- [ ] Education agent answering questions
- [ ] Calculator agent calculating emissions
- [ ] Matching agent ranking sellers
- [ ] All agents integrated with APIs

### Frontend (Dev 3):
- [ ] All pages working
- [ ] Auth flow complete
- [ ] All agent UIs functional
- [ ] Mobile responsive
- [ ] Error handling in place

### Integration (All):
- [ ] Full demo flow works end-to-end
- [ ] No critical bugs
- [ ] Demo accounts ready
- [ ] Ready to present

---

**Last Updated**: Project initialization complete, ready for development!
