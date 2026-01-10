# Backend Sequence Flow Diagram

This document provides a comprehensive overview of the backend execution flow for the Carbon Credit Marketplace API, from request initiation to final response handling.

## Table of Contents

1. [Application Startup Flow](#application-startup-flow)
2. [Request Handling Architecture](#request-handling-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Calculator Agent Flow](#calculator-agent-flow)
5. [Education Agent Flow (RAG)](#education-agent-flow-rag)
6. [Matching Agent Flow](#matching-agent-flow)
7. [Marketplace Flow](#marketplace-flow)
8. [Formalities Agent Flow](#formalities-agent-flow)

---

## Application Startup Flow

```mermaid
sequenceDiagram
    participant Server
    participant FastAPI as FastAPI App
    participant Lifespan as Lifespan Manager
    participant Database as Database Module
    participant SeedData as Seed Data Module
    participant Qdrant as Qdrant Client
    participant CORS as CORS Middleware

    Server->>FastAPI: Start Uvicorn Server
    FastAPI->>Lifespan: Execute Startup
    Lifespan->>Database: init_db()
    Database->>Database: Create Tables (if not exists)
    Database-->>Lifespan: Tables Ready
    
    Lifespan->>SeedData: seed_database(db)
    SeedData->>Database: Insert Mock Users
    SeedData->>Database: Insert Mock Listings
    Database-->>SeedData: Data Seeded
    SeedData-->>Lifespan: Seeding Complete
    
    Lifespan->>Qdrant: init_qdrant()
    Qdrant->>Qdrant: Create Collection (if not exists)
    Qdrant-->>Lifespan: Qdrant Ready
    
    Lifespan->>Qdrant: ingest_documents()
    Qdrant->>Qdrant: Load & Chunk Documents
    Qdrant->>Qdrant: Generate Embeddings
    Qdrant->>Qdrant: Store in Qdrant
    Qdrant-->>Lifespan: Documents Ingested
    
    FastAPI->>CORS: Initialize CORS Middleware
    FastAPI->>FastAPI: Register Routers
    Lifespan-->>FastAPI: Startup Complete
    FastAPI-->>Server: Server Ready (Port 8000)
```

**Key Components:**
- **FastAPI App**: Main application instance
- **Lifespan Manager**: Handles startup/shutdown events
- **Database**: PostgreSQL with AsyncPG
- **Qdrant**: Vector database for RAG
- **Routers**: API endpoint handlers

---

## Request Handling Architecture

```mermaid
sequenceDiagram
    participant Client
    participant CORS as CORS Middleware
    participant FastAPI as FastAPI Router
    participant Auth as Auth Dependency
    participant DB as Database Session
    participant Agent as Agent/Service
    participant External as External Service

    Client->>CORS: HTTP Request
    CORS->>CORS: Validate Origin/Headers
    CORS->>FastAPI: Pass Request
    
    alt Protected Endpoint
        FastAPI->>Auth: get_current_user_id()
        Auth->>Auth: Extract Bearer Token
        Auth->>Auth: decode_token()
        Auth-->>FastAPI: user_id
    end
    
    FastAPI->>DB: get_db() Dependency
    DB-->>FastAPI: Async Session
    
    FastAPI->>Agent: Route Handler
    
    alt Requires External Service
        Agent->>External: API Call (OpenAI/Qdrant)
        External-->>Agent: Response
    end
    
    Agent->>DB: Database Query (if needed)
    DB-->>Agent: Query Results
    
    Agent-->>FastAPI: Response Data
    FastAPI->>FastAPI: Serialize (Pydantic)
    FastAPI->>CORS: HTTP Response
    CORS-->>Client: JSON Response
    
    FastAPI->>DB: Close Session
```

**Request Pipeline:**
1. **CORS Validation**: Checks allowed origins/headers
2. **Authentication**: JWT token validation (if protected)
3. **Database Session**: Async session dependency injection
4. **Route Handler**: Processes business logic
5. **Response Serialization**: Pydantic model validation
6. **Session Cleanup**: Automatic session closing

---

## Authentication Flow

### Registration Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthRouter as /api/auth/register
    participant Security as Security Module
    participant Database as Database
    participant UserModel as User Model

    Client->>AuthRouter: POST /api/auth/register<br/>{email, password, user_type, company_name, sector}
    AuthRouter->>Database: SELECT User WHERE email = ?
    Database-->>AuthRouter: User Exists?
    
    alt User Already Exists
        AuthRouter-->>Client: 400 Bad Request<br/>"Email already registered"
    else New User
        AuthRouter->>Security: get_password_hash(password)
        Security-->>AuthRouter: hashed_password
        
        AuthRouter->>UserModel: Create User Object
        AuthRouter->>Database: INSERT User
        Database-->>AuthRouter: User Created
        
        AuthRouter->>Security: create_access_token({"sub": user_id})
        Security->>Security: JWT Encode
        Security-->>AuthRouter: access_token
        
        AuthRouter-->>Client: 201 Created<br/>{access_token, user}
    end
```

### Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthRouter as /api/auth/login
    participant Database as Database
    participant Security as Security Module
    participant UserModel as User Model

    Client->>AuthRouter: POST /api/auth/login<br/>{email, password}
    AuthRouter->>Database: SELECT User WHERE email = ?
    Database-->>AuthRouter: User Object (or None)
    
    alt User Not Found
        AuthRouter-->>Client: 401 Unauthorized<br/>"Incorrect email or password"
    else User Found
        AuthRouter->>Security: verify_password(plain, hash)
        Security-->>AuthRouter: Password Valid?
        
        alt Invalid Password
            AuthRouter-->>Client: 401 Unauthorized<br/>"Incorrect email or password"
        else Valid Password
            AuthRouter->>Security: create_access_token({"sub": user_id})
            Security-->>AuthRouter: access_token
            AuthRouter-->>Client: 200 OK<br/>{access_token, user}
        end
    end
```

### Protected Endpoint Authentication

```mermaid
sequenceDiagram
    participant Client
    participant Router as Protected Endpoint
    participant Deps as get_current_user_id()
    participant Security as Security Module

    Client->>Router: GET /api/marketplace/listings<br/>Authorization: Bearer <token>
    
    Router->>Deps: get_current_user_id() Dependency
    Deps->>Deps: Extract Bearer Token from Header
    Deps->>Security: decode_token(token)
    
    alt Invalid Token
        Security-->>Deps: JWTError Exception
        Deps-->>Client: 401 Unauthorized<br/>"Could not validate credentials"
    else Valid Token
        Security-->>Deps: payload {"sub": user_id}
        Deps-->>Router: user_id
        
        Note over Router: Process Request<br/>with authenticated user_id
        Router-->>Client: 200 OK + Response Data
    end
```

---

## Calculator Agent Flow

### Get Questions Flow

```mermaid
sequenceDiagram
    participant Client
    participant CalculatorRouter as /api/calculator/questions/{sector}
    participant CalculatorAgent as Calculator Agent
    participant EmissionData as Emission Factors Data

    Client->>CalculatorRouter: GET /api/calculator/questions/cement
    CalculatorRouter->>CalculatorAgent: get_questions_for_sector("cement")
    CalculatorAgent->>EmissionData: QUESTIONNAIRES.get("cement")
    EmissionData-->>CalculatorAgent: Questions List
    CalculatorAgent-->>CalculatorRouter: Questions
    
    alt Questions Found
        CalculatorRouter-->>Client: 200 OK<br/>{sector, questions}
    else No Questions
        CalculatorRouter-->>Client: 404 Not Found<br/>"No questions found for sector"
    end
```

### Calculate Emissions Flow

```mermaid
sequenceDiagram
    participant Client
    participant CalculatorRouter as /api/calculator/calculate
    participant CalculatorAgent as Calculator Agent
    participant EmissionData as Emission Factors Data

    Client->>CalculatorRouter: POST /api/calculator/calculate<br/>{sector: "cement", answers: {...}}
    
    CalculatorRouter->>CalculatorAgent: calculate_emissions(sector, answers)
    
    alt Invalid Sector
        CalculatorAgent-->>CalculatorRouter: ValueError("Unknown sector")
        CalculatorRouter-->>Client: 400 Bad Request
    else Valid Sector
        CalculatorAgent->>EmissionData: EMISSION_FACTORS.get(sector)
        EmissionData-->>CalculatorAgent: Emission Factors
        
        CalculatorAgent->>CalculatorAgent: Calculate Scope 1 Emissions<br/>(Direct emissions)
        CalculatorAgent->>CalculatorAgent: Calculate Scope 2 Emissions<br/>(Indirect - Energy)
        CalculatorAgent->>CalculatorAgent: Calculate Scope 3 Emissions<br/>(Other indirect)
        
        CalculatorAgent->>CalculatorAgent: Total = Scope1 + Scope2 + Scope3
        CalculatorAgent->>CalculatorAgent: Credits Needed = ceil(Total)
        CalculatorAgent->>CalculatorAgent: Cost Estimate = Credits × ₹2,500
        
        CalculatorAgent-->>CalculatorRouter: {<br/>  total_emissions,<br/>  scope1_emissions,<br/>  scope2_emissions,<br/>  scope3_emissions,<br/>  credits_needed,<br/>  cost_estimate,<br/>  breakdown<br/>}
        
        CalculatorRouter->>CalculatorRouter: Validate with CalculationResponse Schema
        CalculatorRouter-->>Client: 200 OK<br/>CalculationResponse
    end
```

**Calculation Logic:**
- **Scope 1**: Direct emissions from owned sources
- **Scope 2**: Indirect emissions from purchased energy
- **Scope 3**: Other indirect emissions (supply chain)
- **Credits Needed**: Ceiling of total emissions
- **Cost Estimate**: Based on average credit price

---

## Education Agent Flow (RAG)

```mermaid
sequenceDiagram
    participant Client
    participant EducationRouter as /api/education/chat
    participant EducationAgent as Education Agent
    participant QdrantClient as Qdrant Client
    participant QdrantDB as Qdrant Vector DB
    participant LLMClient as LLM Client
    participant OpenAI as OpenAI API

    Client->>EducationRouter: POST /api/education/chat<br/>{question: "What are carbon credits?"}
    
    EducationRouter->>EducationAgent: chat_with_education_agent(question)
    
    EducationAgent->>QdrantClient: search_documents(question, limit=5)
    QdrantClient->>QdrantClient: Generate Question Embedding
    QdrantClient->>QdrantDB: Vector Similarity Search
    QdrantDB-->>QdrantClient: Top 5 Relevant Document Chunks
    QdrantClient-->>EducationAgent: Relevant Documents
    
    alt No Documents Found
        EducationAgent-->>EducationRouter: {answer: "No info found", sources: []}
        EducationRouter-->>Client: 200 OK
    else Documents Found
        EducationAgent->>EducationAgent: Build Context from Documents<br/>"[Section: X]\nText..."
        
        EducationAgent->>LLMClient: get_completion(user_prompt, system_prompt)
        LLMClient->>OpenAI: Chat Completion API<br/>GPT-4o-mini
        OpenAI-->>LLMClient: Generated Answer
        LLMClient-->>EducationAgent: Answer Text
        
        EducationAgent->>EducationAgent: Extract Sources from Documents
        EducationAgent-->>EducationRouter: {answer: "...", sources: ["Section1", "Section2"]}
        
        EducationRouter->>EducationRouter: Validate with ChatResponse Schema
        EducationRouter-->>Client: 200 OK<br/>{answer, sources}
    end
```

**RAG Pipeline:**
1. **Query Embedding**: Convert question to vector
2. **Vector Search**: Find similar document chunks in Qdrant
3. **Context Building**: Combine retrieved chunks
4. **LLM Generation**: Generate answer using OpenAI with context
5. **Source Extraction**: Return referenced sections

---

## Matching Agent Flow

```mermaid
sequenceDiagram
    participant Client
    participant MatchingRouter as /api/matching/find
    participant MatchingAgent as Matching Agent
    participant Database as Database
    participant ListingModel as Credit Listing
    participant UserModel as User

    Client->>MatchingRouter: POST /api/matching/find<br/>{<br/>  credits_needed: 100,<br/>  max_price: 3000,<br/>  preferred_vintage: 2023,<br/>  preferred_project_type: "renewable_energy"<br/>}
    
    MatchingRouter->>MatchingAgent: find_matched_sellers(request_dict, db)
    
    MatchingAgent->>Database: SELECT Listing, User<br/>WHERE is_active = True<br/>AND price <= max_price<br/>AND vintage = preferred_vintage<br/>AND project_type = preferred_project_type
    Database-->>MatchingAgent: Listings with Sellers
    
    loop For Each Listing
        MatchingAgent->>MatchingAgent: Check quantity >= credits_needed
        
        alt Quantity Sufficient
            MatchingAgent->>MatchingAgent: Calculate Price Score (40%)<br/>Lower price = higher score
            MatchingAgent->>MatchingAgent: Calculate Quantity Score (30%)<br/>More available = higher score
            MatchingAgent->>MatchingAgent: Calculate Vintage Score (20%)<br/>Exact match = 1.0, ±1 year = 0.8
            MatchingAgent->>MatchingAgent: Calculate Project Type Score (10%)<br/>Match = 1.0, else = 0.3
            
            MatchingAgent->>MatchingAgent: Total Score = Weighted Sum
            MatchingAgent->>MatchingAgent: Normalize to 0-100
            MatchingAgent->>MatchingAgent: Build Reasons List
        end
    end
    
    MatchingAgent->>MatchingAgent: Sort by Score (Descending)
    MatchingAgent->>MatchingAgent: Take Top 5 Matches
    MatchingAgent-->>MatchingRouter: List of Matched Sellers
    
    MatchingRouter->>MatchingRouter: Convert to SellerMatch Schema
    MatchingRouter-->>Client: 200 OK<br/>{matches: [...]}
```

**Scoring Algorithm:**
- **Price Match (40%)**: Lower price = higher score
- **Quantity Available (30%)**: More credits = higher score
- **Vintage Match (20%)**: Exact match = 1.0, ±1 year = 0.8
- **Project Type Match (10%)**: Match = 1.0, else = 0.3

---

## Marketplace Flow

### Get Listings Flow

```mermaid
sequenceDiagram
    participant Client
    participant MarketplaceRouter as /api/marketplace/listings
    participant Database as Database
    participant ListingModel as Credit Listing
    participant UserModel as User

    Client->>MarketplaceRouter: GET /api/marketplace/listings<br/>?vintage=2023&project_type=renewable_energy&max_price=3000
    
    MarketplaceRouter->>Database: SELECT Listing, User<br/>JOIN User ON Listing.seller_id<br/>WHERE is_active = True
    
    alt Filters Applied
        MarketplaceRouter->>Database: Apply WHERE Clauses<br/>- vintage = ?<br/>- project_type = ?<br/>- price BETWEEN ? AND ?
    end
    
    Database-->>MarketplaceRouter: Listings with Seller Info
    
    loop For Each Listing
        MarketplaceRouter->>MarketplaceRouter: Format ListingResponse<br/>{id, seller_id, seller_name,<br/> quantity, price_per_credit,<br/> vintage, project_type,<br/> verification_status, ...}
    end
    
    MarketplaceRouter-->>Client: 200 OK<br/>List[ListingResponse]
```

### Create Listing Flow

```mermaid
sequenceDiagram
    participant Client
    participant MarketplaceRouter as /api/marketplace/listings
    participant Auth as get_current_user_id
    participant Database as Database
    participant UserModel as User
    participant ListingModel as Credit Listing

    Client->>MarketplaceRouter: POST /api/marketplace/listings<br/>Authorization: Bearer <token><br/>{quantity, price_per_credit, vintage, project_type, description}
    
    MarketplaceRouter->>Auth: get_current_user_id()
    Auth-->>MarketplaceRouter: user_id
    
    MarketplaceRouter->>Database: SELECT User WHERE id = user_id
    Database-->>MarketplaceRouter: User Object
    
    alt User Not Found or Not Seller
        MarketplaceRouter-->>Client: 403 Forbidden<br/>"Only sellers can create listings"
    else Valid Seller
        MarketplaceRouter->>ListingModel: Create CreditListing Object
        MarketplaceRouter->>Database: INSERT CreditListing
        Database-->>MarketplaceRouter: Listing Created
        
        MarketplaceRouter->>Database: SELECT User (seller info)
        Database-->>MarketplaceRouter: Seller User Object
        
        MarketplaceRouter->>MarketplaceRouter: Format ListingResponse
        MarketplaceRouter-->>Client: 201 Created<br/>ListingResponse
    end
```

---

## Formalities Agent Flow

```mermaid
sequenceDiagram
    participant Client
    participant FormalitiesRouter as /api/formalities/steps/{workflow_type}
    participant WorkflowData as Workflow Templates

    Client->>FormalitiesRouter: GET /api/formalities/steps/buyer_registration
    
    FormalitiesRouter->>FormalitiesRouter: Validate workflow_type<br/>(buyer_registration | seller_registration | mrv_compliance)
    
    alt Invalid Workflow Type
        FormalitiesRouter-->>Client: 422 Validation Error
    else Valid Workflow Type
        FormalitiesRouter->>WorkflowData: Get Workflow Template
        
        alt buyer_registration
            WorkflowData-->>FormalitiesRouter: 5 Steps<br/>- Company Registration<br/>- GCI Registry Account<br/>- Document Verification<br/>- Bank Details<br/>- Final Approval
        else seller_registration
            WorkflowData-->>FormalitiesRouter: 5 Steps<br/>- Project Registration<br/>- Methodology Selection<br/>- Verification Agency<br/>- Document Submission<br/>- BEE Approval
        else mrv_compliance
            WorkflowData-->>FormalitiesRouter: 6 Steps<br/>- Monitoring Plan<br/>- Data Collection<br/>- Report Preparation<br/>- Third-Party Verification<br/>- BEE Submission<br/>- Credit Surrender
        end
        
        FormalitiesRouter->>FormalitiesRouter: Format WorkflowResponse<br/>{workflow_type, steps: [...]}
        FormalitiesRouter-->>Client: 200 OK<br/>WorkflowResponse
    end
```

**Workflow Types:**
- **buyer_registration**: 5 steps for buyer onboarding
- **seller_registration**: 5 steps for seller/project registration
- **mrv_compliance**: 6 steps for MRV compliance workflow

---

## Error Handling Flow

```mermaid
sequenceDiagram
    participant Client
    participant FastAPI as FastAPI App
    participant Router as Route Handler
    participant Validation as Pydantic Validation
    participant Exception as Exception Handler

    Client->>FastAPI: Request
    
    alt Validation Error
        FastAPI->>Validation: Schema Validation
        Validation-->>FastAPI: ValidationError
        FastAPI-->>Client: 422 Unprocessable Entity<br/>{detail: [...]}
    else HTTPException
        Router->>Router: Raise HTTPException
        FastAPI->>Exception: Handle HTTPException
        Exception-->>Client: Status Code + Error Message
    else Internal Error
        Router->>Router: Unhandled Exception
        FastAPI->>Exception: Handle Exception
        Exception-->>Client: 500 Internal Server Error<br/>{detail: "Error message"}
    else Success
        Router-->>Client: 200 OK + Data
    end
```

---

## Database Session Management

```mermaid
sequenceDiagram
    participant Router as Route Handler
    participant Deps as get_db() Dependency
    participant SessionFactory as AsyncSessionLocal
    participant Database as PostgreSQL

    Router->>Deps: Depends(get_db)
    Deps->>SessionFactory: Create AsyncSession
    SessionFactory->>Database: Get Connection from Pool
    SessionFactory-->>Deps: AsyncSession Instance
    Deps-->>Router: Yield Session
    
    Router->>Database: await session.execute(query)
    Database-->>Router: Query Results
    
    Router->>Database: await session.commit() (if needed)
    Database-->>Router: Commit Success
    
    Router-->>Deps: Function Complete
    Deps->>Database: await session.close()
    Deps->>SessionFactory: Return Connection to Pool
```

**Session Lifecycle:**
1. **Creation**: Dependency injection creates session
2. **Usage**: Query/transaction execution
3. **Commit**: Explicit or automatic on success
4. **Cleanup**: Automatic closing via dependency lifecycle

---

## Summary

The Carbon Credit Marketplace backend follows a modular, agent-based architecture:

1. **FastAPI Framework**: Async HTTP server with automatic documentation
2. **Dependency Injection**: Database sessions and authentication
3. **Agent Pattern**: Specialized agents for different functionalities
4. **RAG Integration**: Vector search + LLM for education queries
5. **Database Layer**: PostgreSQL with async SQLAlchemy
6. **Security**: JWT-based authentication with password hashing
7. **Error Handling**: Comprehensive HTTP exception handling

All flows follow the same pattern:
- **Request** → **Middleware** → **Authentication** (if protected) → **Database Session** → **Agent/Service** → **Response**

This architecture ensures scalability, maintainability, and clear separation of concerns.
