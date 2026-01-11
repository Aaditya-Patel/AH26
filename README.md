# 🌱 Carbon Credit Marketplace

> **An AI-Powered Platform for Transparent Carbon Credit Trading in India**

[![AutonomousHacks 2026](https://img.shields.io/badge/AutonomousHacks-2026-orange)](https://autonomoushacks.co.in/)
[![Swachh Bharat](https://img.shields.io/badge/Swachh%20Bharat-Track-green)](https://autonomoushacks.co.in/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2+-61dafb.svg)](https://reactjs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Hackathon Context](#hackathon-context)
- [Real-World Problem & Solution](#real-world-problem--solution)
- [Swachh Bharat Alignment](#swachh-bharat-alignment)
- [Why We Built This](#why-we-built-this)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage & Demo Flow](#usage--demo-flow)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Scalability & Future Roadmap](#scalability--future-roadmap)
- [Team](#team)
- [License](#license)

---

## Overview

The **Carbon Credit Marketplace** is an AI-powered platform that democratizes carbon credit trading in India. Built for the AutonomousHacks 2026 hackathon, this platform addresses critical challenges in the growing carbon market by providing intelligent agents for education, emission calculation, seller matching, and government formalities guidance.

Our platform enables businesses of all sizes to:
- **Calculate** their carbon emissions accurately
- **Understand** carbon credits through AI-powered education
- **Trade** carbon credits in a transparent marketplace
- **Navigate** complex government registration and compliance processes
- **Verify** transactions and ensure authenticity

### Key Highlights

✨ **5 AI-Powered Agents** - Education, Calculator, Matching, Formalities, and Verification assistants  
🔒 **Secure Verification** - Document OCR, fraud detection, and automated validation  
📊 **Real-time Marketplace** - Buy and sell carbon credits with intelligent matching  
🎓 **Educational Platform** - RAG-powered knowledge base for carbon credit education  
📋 **Compliance Guidance** - Step-by-step workflows for government formalities  

---

## Hackathon Context

This project was developed for **AutonomousHacks 2026**, organized by **Google Developer Group (GDG) Gandhinagar** in partnership with Google for Developers.

### About AutonomousHacks 2026

**AutonomousHacks** is a 24-hour hackathon that brings together 300+ developers, designers, and innovators to push the boundaries of autonomous systems and sustainable technology. The event focuses on building solutions with real-world social impact.

**Event Details:**
- **Date**: January 10, 2026
- **Location**: Gandhinagar, India
- **Prize Pool**: ₹1.5 Lakh+
- **Tracks**: Swachh Bharat Mission, ESG & Sustainability, Open Innovation
- **Website**: [autonomoushacks.co.in](https://autonomoushacks.co.in/)

### Our Participation

We participated in the **Swachh Bharat Mission** track, building a solution that directly contributes to India's clean energy transition and environmental sustainability goals. Our platform aligns with the hackathon's focus on:
- **Sustainable Technology** - Creating market incentives for clean energy projects
- **Social Impact** - Democratizing access to carbon markets for SMEs
- **Innovation** - Using AI to simplify complex regulatory processes
- **Enterprise Mentorship** - Building a scalable platform ready for real-world deployment

For more details about the hackathon, visit [autonomoushacks.co.in](https://autonomoushacks.co.in/).

---

## Real-World Problem & Solution

### The Problem

India's carbon market is rapidly growing, with the government launching the Carbon Credit Trading Scheme (CCTS) in 2023. However, several critical challenges hinder widespread adoption:

1. **Fragmented Market** - Carbon credits are traded across multiple platforms with no unified marketplace
2. **Complex Verification** - Document verification and KYC processes are manual, time-consuming, and error-prone
3. **Limited Accessibility** - Small and medium enterprises struggle to navigate complex registration processes
4. **Knowledge Gap** - Lack of understanding about carbon credits, their value, and regulatory requirements
5. **Regulatory Complexity** - Government formalities for buyer/seller registration and MRV compliance are intricate
6. **Trust Issues** - Difficulty in verifying credit authenticity and seller credibility

### Our Solution

The Carbon Credit Marketplace addresses these challenges through an integrated AI-powered platform:

**🎯 Unified Marketplace**
- Centralized platform for buyers and sellers to discover and trade carbon credits
- Transparent pricing and availability information
- Real-time transaction processing

**🤖 AI-Powered Intelligence**
- **Education Agent**: RAG-powered knowledge base answering questions about carbon credits
- **Calculator Agent**: Accurate emission calculations for different industry sectors
- **Matching Agent**: Intelligent seller matching based on requirements, price, and vintage
- **Formalities Agent**: Step-by-step guidance through government registration processes
- **Verification Agent**: Automated document processing and fraud detection

**🔒 Secure Verification**
- Document OCR using AI vision models
- Automated PAN/GSTIN/GCI validation
- Fraud detection and risk scoring
- Streamlined KYC workflows

**📚 Educational Resources**
- Comprehensive knowledge base with government policies and regulations
- Interactive Q&A with AI assistant
- Sector-specific emission calculation guidance

---

## Swachh Bharat Alignment

Our platform directly contributes to the **Swachh Bharat Mission** (Clean India Initiative) by creating economic incentives for environmental projects and helping companies reduce their carbon footprint.

### Direct Contributions

1. **Clean Energy Projects** 🍃
   - Facilitates trading of credits from renewable energy projects (solar, wind, hydro)
   - Creates market demand for clean energy initiatives
   - Supports India's target of 500 GW renewable energy by 2030

2. **Waste Management** ♻️
   - Enables waste-to-energy projects to monetize carbon reductions
   - Supports circular economy initiatives
   - Reduces methane emissions from landfills

3. **Air Quality Improvement** 🌬️
   - Helps companies offset emissions through verified carbon credits
   - Creates incentives for emission reduction projects
   - Supports India's commitment to net-zero by 2070

4. **Forest Conservation** 🌳
   - Facilitates trading of forest-based carbon credits
   - Encourages afforestation and reforestation projects
   - Protects biodiversity while generating economic value

5. **Industrial Decarbonization** 🏭
   - Helps industries calculate and offset their emissions
   - Creates transparency in emission reporting
   - Supports the Perform, Achieve, Trade (PAT) scheme

6. **Rural Development** 🏞️
   - Enables rural communities to participate in carbon markets
   - Supports sustainable agriculture and forestry projects
   - Creates additional income streams for rural populations

### Alignment with Government Initiatives

- **Carbon Credit Trading Scheme (CCTS)** - Supports India's compliance carbon market
- **BEE Programs** - Integrates with Bureau of Energy Efficiency initiatives
- **GCI Registry** - Aligns with Grid Controller of India's carbon credit registry
- **Panchamrit Goals** - Contributes to India's 5-point climate action plan

---

## Why We Built This

### Our Motivation

India is at a critical juncture in its climate journey. With ambitious targets like:
- **500 GW** renewable energy capacity by 2030
- **Net-zero emissions** by 2070
- **30% reduction** in emission intensity by 2030

The need for a robust carbon market infrastructure has never been greater. However, the current system is complex, fragmented, and inaccessible to many businesses.

### Our Vision

We envision a future where:
- **Every business** can easily calculate and offset its carbon footprint
- **Environmental projects** have direct access to carbon credit markets
- **Government formalities** are simplified through AI-powered guidance
- **Transparency and trust** are built into every transaction
- **Education** empowers informed decision-making

### What We Built

This MVP demonstrates how AI can transform carbon credit trading by:

1. **Democratizing Access** - Making carbon markets accessible to SMEs, not just large corporations
2. **Simplifying Complexity** - Using AI agents to guide users through complex processes
3. **Ensuring Trust** - Implementing robust verification and fraud detection
4. **Educating Users** - Providing comprehensive, context-aware educational resources
5. **Enabling Scalability** - Building an architecture that can grow from MVP to enterprise platform

### Impact Potential

As an MVP, this platform demonstrates:
- **Feasibility** of AI-powered carbon marketplaces
- **User Experience** improvements through intelligent agents
- **Scalability** through modern, cloud-native architecture
- **Real-world Value** by solving actual pain points in the carbon market

This foundation can be transformed into a production-ready platform that serves thousands of businesses and processes millions of credits annually.

---

## Features

### 🤖 AI-Powered Agents

#### 1. Education Agent
- **RAG-Powered Knowledge Base**: Retrieval-Augmented Generation using Qdrant vector database
- **Context-Aware Answers**: Understands carbon credit regulations, policies, and market dynamics
- **Source Citations**: Provides references to government documents and policies
- **Interactive Learning**: Chat-based interface for natural question-answering

#### 2. Calculator Agent
- **Sector-Specific Calculations**: Supports multiple industry sectors (Cement, Power, Steel, Textiles, etc.)
- **Scope-Based Emissions**: Calculates Scope 1, 2, and 3 emissions
- **Conversational Interface**: Interactive questionnaire for data collection
- **Accurate Results**: Uses standardized emission factors and methodologies
- **Cost Estimation**: Provides cost estimates for carbon credits needed

#### 3. Matching Agent
- **Intelligent Matching**: Multi-factor scoring algorithm for seller matching
- **Weighted Scoring**: Considers price (40%), quantity (30%), vintage (20%), and project type (10%)
- **Personalized Recommendations**: Top 5 matches based on buyer requirements
- **Transparent Reasoning**: Explains why each seller is recommended

#### 4. Formalities Agent
- **Workflow Guidance**: Step-by-step guidance for buyer/seller registration and MRV compliance
- **Conversational State**: Maintains context across conversation
- **Document Checklists**: Lists required documents for each step
- **RAG-Enhanced Responses**: Uses government formalities documents for accurate guidance

#### 5. Verification Agent
- **Document OCR**: AI-powered text extraction from PAN, GSTIN, GCI certificates
- **Automated Validation**: Format validation for PAN/GSTIN/GCI numbers
- **Fraud Detection**: Identifies suspicious patterns and duplicate registrations
- **Risk Scoring**: Assigns risk scores for manual review prioritization
- **Guided Assistance**: Answers questions about verification requirements

### 🏪 Marketplace Features

- **Credit Listings**: Browse available carbon credits with filters (vintage, project type, price)
- **Transaction Management**: Secure order processing and payment tracking
- **Portfolio Management**: Track purchased credits and retirement history
- **Market Data**: Price history and market statistics
- **Search & Filter**: Advanced filtering by multiple criteria

### 🔒 Verification & Security

- **Document Upload**: Multi-format document support (PDF, images)
- **OCR Processing**: Automated text extraction using AI vision models
- **Format Validation**: Validates PAN, GSTIN, and GCI registration formats
- **Consistency Checks**: Cross-validates information across documents
- **Fraud Detection**: Pattern matching for suspicious activities
- **Risk Assessment**: Automated risk scoring for applications

### 📊 Compliance & Reporting

- **MRV Compliance**: Monitoring, Reporting, and Verification workflows
- **Compliance Tracking**: Track regulatory compliance status
- **Document Management**: Secure storage and retrieval of compliance documents
- **Audit Trail**: Complete transaction and verification history

### 🎨 User Experience

- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Dark Mode**: Theme toggle for comfortable viewing
- **Real-time Updates**: Live updates for marketplace and transactions
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Accessible**: WCAG-compliant design principles

---

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Web[Web Browser]
        Mobile[Mobile App - Future]
    end
    
    subgraph Frontend["Frontend Layer"]
        React[React + TypeScript]
        UI[UI Components]
        State[State Management<br/>Zustand]
    end
    
    subgraph API["API Layer"]
        FastAPI[FastAPI Backend]
        Auth[JWT Authentication]
        CORS[CORS Middleware]
    end
    
    subgraph Agents["AI Agents Layer"]
        Education[Education Agent<br/>RAG + LLM]
        Calculator[Calculator Agent<br/>LangGraph]
        Matching[Matching Agent<br/>Scoring Algorithm]
        Formalities[Formalities Agent<br/>RAG + Workflows]
        Verification[Verification Agent<br/>OCR + Validation]
    end
    
    subgraph Services["Service Layer"]
        OCR[Document OCR]
        Validator[Document Validator]
        Fraud[Fraud Detector]
        CreditVerifier[Credit Verifier]
    end
    
    subgraph Data["Data Layer"]
        PostgreSQL[(PostgreSQL<br/>Primary Database)]
        Qdrant[(Qdrant<br/>Vector Database)]
    end
    
    subgraph External["External Services"]
        OpenAI[OpenAI API<br/>GPT-4o-mini]
        GCI[GCI Registry<br/>Future Integration]
        BEE[BEE API<br/>Future Integration]
    end
    
    Web --> React
    Mobile --> React
    React --> FastAPI
    FastAPI --> Auth
    FastAPI --> Agents
    Agents --> Education
    Agents --> Calculator
    Agents --> Matching
    Agents --> Formalities
    Agents --> Verification
    Agents --> Services
    Services --> OCR
    Services --> Validator
    Services --> Fraud
    Services --> CreditVerifier
    FastAPI --> PostgreSQL
    Education --> Qdrant
    Formalities --> Qdrant
    Agents --> OpenAI
    Services --> OpenAI
    Verification --> GCI
    Verification --> BEE
```

### Component Breakdown

#### Frontend Architecture
- **Framework**: React 18.2+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Routing**: React Router for navigation
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives

#### Backend Architecture
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with AsyncPG driver
- **ORM**: SQLAlchemy 2.0 (async)
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Documentation**: OpenAPI/Swagger auto-generated
- **CORS**: Configurable CORS middleware

#### AI & ML Layer
- **LLM Provider**: OpenAI GPT-4o-mini
- **Vector Database**: Qdrant for RAG
- **Embeddings**: OpenAI text-embedding-ada-002
- **Agent Framework**: LangGraph for complex workflows
- **Document Processing**: OpenAI Vision API for OCR

#### Data Flow

**Education Agent Flow:**
```
User Question → Vector Embedding → Qdrant Search → 
Context Retrieval → LLM Generation → Formatted Response
```

**Calculator Agent Flow:**
```
User Input → Sector Selection → Questionnaire → 
Emission Calculation → Cost Estimation → Results
```

**Matching Agent Flow:**
```
Buyer Requirements → Database Query → Scoring Algorithm → 
Ranked Results → Response Formatting
```

**Verification Flow:**
```
Document Upload → OCR Processing → Data Extraction → 
Format Validation → Fraud Detection → Risk Scoring → 
Manual Review Queue (if needed)
```

### Infrastructure

- **Containerization**: Docker and Docker Compose
- **Database**: PostgreSQL 15 with persistent volumes
- **Vector DB**: Qdrant with persistent storage
- **Deployment**: Cloud-ready architecture (GCP, AWS, Azure)
- **Scaling**: Stateless backend for horizontal scaling
- **Monitoring**: Health check endpoints for all services

---

## Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **TypeScript** 5.2+ - Type safety
- **Vite** 5.0.8 - Build tool and dev server
- **Tailwind CSS** 3.3.6 - Utility-first CSS framework
- **Zustand** 4.4.7 - State management
- **React Router** 6.20.1 - Client-side routing
- **React Hook Form** 7.49.2 - Form handling
- **Zod** 3.22.4 - Schema validation
- **Radix UI** - Accessible UI primitives
- **Framer Motion** 10.16.0 - Animations
- **Axios** 1.6.2 - HTTP client

### Backend
- **FastAPI** 0.104.1 - Modern Python web framework
- **Python** 3.11+ - Programming language
- **SQLAlchemy** 2.0.23 - ORM with async support
- **AsyncPG** 0.29.0 - PostgreSQL async driver
- **Pydantic** 2.5.0 - Data validation
- **Python-JOSE** 3.3.0 - JWT handling
- **Passlib** 1.7.4 - Password hashing (bcrypt)
- **Uvicorn** 0.24.0 - ASGI server

### AI & ML
- **OpenAI** 1.6.1 - LLM API (GPT-4o-mini)
- **LangChain** 0.1.0 - LLM framework
- **LangChain OpenAI** 0.0.2 - OpenAI integration
- **LangGraph** 0.0.20 - Agent workflows
- **Qdrant Client** 1.7.0 - Vector database client
- **Tiktoken** 0.5.2 - Token counting

### Database
- **PostgreSQL** 15 - Primary relational database
- **Qdrant** - Vector database for RAG

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TS-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## Getting Started

### Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **OpenAI API Key** (optional but recommended for AI features)
- **Git** for cloning the repository

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd carbon-credit-marketplace
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
# OpenAI API Key (required for AI agents)
OPENAI_API_KEY=your-openai-api-key-here

# Database (defaults work for Docker)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/carbonmarket
QDRANT_URL=http://qdrant:6333

# Security
SECRET_KEY=your-secret-key-min-32-characters-long

# CORS (adjust for your domain)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
ENVIRONMENT=development
DEBUG=True
```

3. **Start all services**
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database (port 5432)
- Qdrant vector database (ports 6333, 6334)
- FastAPI backend (port 8000)
- React frontend (port 3000)

4. **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Qdrant Dashboard**: http://localhost:6333/dashboard

### First Time Setup

The backend automatically performs initial setup:
- ✅ Creates database tables
- ✅ Seeds mock data (2 buyers, 3 sellers, 10 listings)
- ✅ Ingests research documents into Qdrant
- ✅ Sets up formalities documents in Qdrant

### Demo Accounts

**Buyer Account:**
- Email: `buyer@demo.com`
- Password: `demo123`

**Seller Account:**
- Email: `seller@demo.com`
- Password: `demo123`

### Development Setup (Without Docker)

#### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/carbonmarket
export QDRANT_URL=http://localhost:6333
export OPENAI_API_KEY=your-key
export SECRET_KEY=your-secret-key

# Run database migrations (auto-created on first run)
uvicorn app.main:app --reload
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173 (Vite default port).

---

## Usage & Demo Flow

### Complete User Journey

#### For Buyers

1. **Registration & Login**
   - Register as a buyer with company details
   - Complete email verification (in production)
   - Login to access the dashboard

2. **Education & Learning**
   - Navigate to "Education" section
   - Ask questions about carbon credits
   - Learn about regulations and policies
   - Example: "What are carbon credits?" or "How does the CCTS work?"

3. **Calculate Emissions**
   - Go to "Calculator" section
   - Select your industry sector
   - Answer the questionnaire about your operations
   - Get detailed emission calculations (Scope 1, 2, 3)
   - Receive cost estimate for offsetting

4. **Find Sellers**
   - Use "Matching" to find suitable sellers
   - Specify credits needed, max price, preferred vintage
   - Review matched sellers with scores and reasons
   - View seller profiles and credit listings

5. **Browse Marketplace**
   - Explore all available credit listings
   - Filter by vintage, project type, price range
   - View detailed listing information
   - Place orders for credits

6. **Government Formalities**
   - Access "Formalities" section
   - Get step-by-step guidance for buyer registration
   - Learn about required documents
   - Understand MRV compliance workflows

#### For Sellers

1. **Registration & Verification**
   - Register as a seller
   - Upload verification documents (PAN, GSTIN, GCI certificate)
   - Complete automated verification process
   - Get verification status

2. **Create Listings**
   - Navigate to marketplace
   - Create credit listings with details:
     - Quantity available
     - Price per credit
     - Vintage (year)
     - Project type
     - Description
   - Verify credit balance (system checks automatically)

3. **Manage Portfolio**
   - View credit balance
   - Track issued credits
   - Monitor transactions
   - View retirement history

4. **Compliance**
   - Access formalities workflows
   - Get guidance on seller registration
   - Understand MRV compliance requirements
   - Manage compliance documents

### Demo Scenarios

#### Scenario 1: New Buyer Journey
```
1. Register → 2. Learn (Education Agent) → 3. Calculate Emissions → 
4. Find Matches → 5. Browse Marketplace → 6. Place Order
```

#### Scenario 2: Seller Onboarding
```
1. Register → 2. Upload Documents → 3. Verification → 
4. Create Listing → 5. Manage Portfolio
```

#### Scenario 3: Compliance Guidance
```
1. Go to Formalities → 2. Select Workflow → 
3. Get Step-by-Step Guidance → 4. View Document Checklist
```

### Key Features to Demo

- **AI Agents**: Show real-time responses from Education, Calculator, and Formalities agents
- **Intelligent Matching**: Demonstrate how matching agent scores and ranks sellers
- **Document OCR**: Upload a document and show automated text extraction
- **Verification Flow**: Complete verification process with fraud detection
- **Marketplace**: Browse listings, apply filters, view details
- **Responsive Design**: Show mobile-friendly interface

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

#### Education Agent
- `POST /api/education/chat` - Chat with education agent (streaming)
- `POST /api/education/chat` - Chat with education agent (non-streaming)

#### Calculator Agent
- `GET /api/calculator/questions/{sector}` - Get questionnaire for sector
- `POST /api/calculator/calculate` - Calculate emissions
- `POST /api/calculator/chat` - Interactive calculator chat (streaming)

#### Matching Agent
- `POST /api/matching/find` - Find matched sellers
  ```json
  {
    "credits_needed": 100,
    "max_price": 3000,
    "preferred_vintage": 2023,
    "preferred_project_type": "renewable_energy"
  }
  ```

#### Marketplace
- `GET /api/marketplace/listings` - Browse listings (with filters)
- `POST /api/marketplace/listings` - Create new listing (seller only)
- `GET /api/marketplace/listings/{id}` - Get listing details

#### Formalities Agent
- `GET /api/formalities/steps/{workflow_type}` - Get workflow steps
- `POST /api/formalities/chat` - Chat with formalities agent (streaming)
  - `workflow_type`: `buyer_registration`, `seller_registration`, `mrv_compliance`

#### Verification
- `POST /api/verification/documents/ocr` - Extract text from documents
- `POST /api/verification/documents/validate` - Validate documents
- `POST /api/verification/assistant/chat` - Chat with verification assistant
- `GET /api/verification/status` - Get verification status

#### Transactions
- `POST /api/transactions/orders` - Create order
- `GET /api/transactions/orders` - Get user orders
- `GET /api/transactions/orders/{id}` - Get order details

#### Portfolio
- `GET /api/registry/account` - Get credit account
- `GET /api/registry/transactions` - Get credit transactions
- `POST /api/registry/retire` - Retire credits

### Example Requests

#### Calculate Emissions
```bash
curl -X POST "http://localhost:8000/api/calculator/calculate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "sector": "cement",
    "answers": {
      "cement_produced": 1000000,
      "coal_consumed": 500000,
      "electricity_consumed": 50000
    }
  }'
```

#### Find Matched Sellers
```bash
curl -X POST "http://localhost:8000/api/matching/find" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "credits_needed": 100,
    "max_price": 3000,
    "preferred_vintage": 2023
  }'
```

For complete API documentation, visit http://localhost:8000/docs

---

## Project Structure

```
carbon-credit-marketplace/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── database.py             # Database connection and session management
│   │   ├── config.py               # Configuration and settings
│   │   │
│   │   ├── agents/                 # AI Agents
│   │   │   ├── __init__.py
│   │   │   ├── education_agent.py      # Education agent with RAG
│   │   │   ├── calculator_agent.py     # Emission calculator agent
│   │   │   ├── matching_agent.py       # Seller matching agent
│   │   │   ├── formalities_agent.py    # Government formalities agent
│   │   │   ├── verification_agent.py   # Verification assistant agent
│   │   │   ├── llm_client.py           # LLM client wrapper
│   │   │   ├── qdrant_client.py        # Qdrant client for education RAG
│   │   │   └── formalities_qdrant.py   # Qdrant client for formalities RAG
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                 # Authentication endpoints
│   │   │   ├── education.py            # Education agent API
│   │   │   ├── calculator.py           # Calculator agent API
│   │   │   ├── matching.py             # Matching agent API
│   │   │   ├── marketplace.py          # Marketplace endpoints
│   │   │   ├── formalities.py          # Formalities agent API
│   │   │   ├── verification.py         # Verification endpoints
│   │   │   ├── transactions.py         # Transaction endpoints
│   │   │   ├── payments.py             # Payment endpoints
│   │   │   ├── registry.py             # Credit registry endpoints
│   │   │   ├── compliance.py           # Compliance endpoints
│   │   │   ├── market_data.py          # Market data endpoints
│   │   │   └── projects.py             # Project endpoints
│   │   │
│   │   ├── models/                  # Database Models
│   │   │   ├── __init__.py
│   │   │   └── models.py                # SQLAlchemy models
│   │   │
│   │   ├── schemas/                 # Pydantic Schemas
│   │   │   ├── __init__.py
│   │   │   └── schemas.py               # Request/Response schemas
│   │   │
│   │   ├── services/                # Business Logic Services
│   │   │   ├── __init__.py
│   │   │   ├── document_ocr.py          # Document OCR service
│   │   │   ├── document_validator.py    # Document validation service
│   │   │   ├── fraud_detector.py        # Fraud detection service
│   │   │   └── credit_verifier.py       # Credit verification service
│   │   │
│   │   ├── data/                    # Data Utilities
│   │   │   └── seed_data.py             # Database seeding
│   │   │
│   │   └── documents/               # Knowledge Base Documents
│   │       ├── carbon_research.md       # Carbon credit research document
│   │       └── formalities/             # Government formalities documents
│   │           ├── buyer_registration.md
│   │           ├── seller_registration.md
│   │           ├── mrv_compliance.md
│   │           └── required_documents.md
│   │
│   ├── scripts/                     # Utility Scripts
│   │   └── ingest_formalities_docs.py  # Script to ingest formalities docs
│   │
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Backend Docker image
│   └── BACKEND_SEQUENCE_FLOW.md     # Backend flow documentation
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                 # React application entry point
│   │   ├── index.css                # Global styles
│   │   │
│   │   ├── pages/                   # Page Components
│   │   │   ├── Landing.tsx              # Landing page
│   │   │   ├── Login.tsx                # Login page
│   │   │   ├── Register.tsx             # Registration page
│   │   │   ├── Dashboard.tsx            # User dashboard
│   │   │   ├── Education.tsx            # Education agent page
│   │   │   ├── Calculator.tsx           # Calculator agent page
│   │   │   ├── Matching.tsx             # Matching agent page
│   │   │   ├── Marketplace.tsx          # Marketplace page
│   │   │   ├── Formalities.tsx          # Formalities agent page
│   │   │   ├── VerificationAssistant.tsx # Verification assistant page
│   │   │   ├── Portfolio.tsx            # Portfolio page
│   │   │   ├── Transactions.tsx         # Transactions page
│   │   │   └── Compliance.tsx           # Compliance page
│   │   │
│   │   ├── components/              # Reusable Components
│   │   │   ├── Layout.tsx               # Main layout component
│   │   │   ├── ProtectedRoute.tsx       # Route protection
│   │   │   ├── SellerCard.tsx           # Seller card component
│   │   │   ├── ThemeToggle.tsx          # Dark mode toggle
│   │   │   ├── Toast.tsx                # Toast notifications
│   │   │   └── ui/                      # UI primitives (Radix UI)
│   │   │
│   │   ├── api/                     # API Client
│   │   │   └── client.ts                # Axios client configuration
│   │   │
│   │   ├── store/                   # State Management
│   │   │   └── store.ts                 # Zustand store
│   │   │
│   │   ├── types/                   # TypeScript Types
│   │   │   └── index.ts                # Type definitions
│   │   │
│   │   ├── context/                 # React Contexts
│   │   │   └── ToastContext.tsx         # Toast context
│   │   │
│   │   ├── data/                    # Static Data
│   │   │   └── questionnaires.ts        # Calculator questionnaires
│   │   │
│   │   └── utils/                   # Utility Functions
│   │       └── animations.ts            # Animation utilities
│   │
│   ├── package.json                 # Node.js dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── Dockerfile                   # Frontend Docker image
│
├── qdrant/
│   └── Dockerfile                   # Qdrant Docker image
│
├── docker-compose.yml               # Docker Compose configuration
├── docker-compose.prod.yml          # Production Docker Compose
├── .env.example                     # Environment variables template
├── README.md                        # This file
├── DEPLOYMENT_GUIDE.md              # Deployment documentation
├── PRODUCTION_DEPLOYMENT.md         # Production deployment guide
└── AI_VERIFICATION_IMPLEMENTATION_PLAN.md  # AI verification plan
```

---

## Scalability & Future Roadmap

### Current MVP State

The current implementation is a **fully functional MVP** that demonstrates:
- ✅ Core marketplace functionality
- ✅ 5 AI-powered agents
- ✅ Document verification pipeline
- ✅ User authentication and authorization
- ✅ Transaction processing
- ✅ Compliance workflows

### Scalability Considerations

The architecture is designed for scalability:

**Current Architecture:**
- Single-region deployment
- Mock data for demonstration
- Basic verification workflows
- Standard database and vector DB setup

**Scalability Features:**
- Stateless backend (horizontal scaling ready)
- Async/await patterns for high concurrency
- Database connection pooling
- Vector database optimized for RAG workloads
- Containerized deployment (Kubernetes ready)

### Roadmap to Production

#### Phase 1: Foundation (Months 1-3)
- **GCI Registry Integration**
  - Real-time credit balance sync
  - Credit serial number validation
  - Automated account verification
  - Registry API integration

- **BEE API Integration**
  - Verify credit issuance
  - Certificate validation
  - Project registration verification
  - Compliance status sync

- **Enhanced Security**
  - Multi-factor authentication
  - Advanced fraud detection ML models
  - Rate limiting and DDoS protection
  - Security auditing and logging

#### Phase 2: Enterprise Features (Months 4-6)
- **Advanced Analytics**
  - Market trend analysis
  - Price forecasting
  - Portfolio analytics
  - Emission reporting dashboards

- **Enterprise APIs**
  - RESTful API for enterprise integration
  - Webhook support for event notifications
  - Bulk transaction processing
  - Custom reporting APIs

- **Multi-tenancy**
  - Organization-level accounts
  - Role-based access control (RBAC)
  - Custom workflows per organization
  - Enterprise SSO integration

#### Phase 3: Advanced Features (Months 7-12)
- **Blockchain Integration**
  - Credit tokenization
  - Immutable transaction records
  - Smart contract automation
  - Cross-platform interoperability

- **Mobile Applications**
  - iOS native app
  - Android native app
  - Mobile-optimized workflows
  - Push notifications

- **Advanced AI Features**
  - Predictive risk scoring
  - Automated verification decisions
  - Market sentiment analysis
  - Personalized recommendations

#### Phase 4: Scale & Expand (Year 2+)
- **Global Expansion**
  - Multi-currency support
  - International credit standards (VCS, Gold Standard)
  - Cross-border transactions
  - Multi-language support

- **Marketplace Enhancements**
  - Auction mechanisms
  - Futures and derivatives
  - Carbon credit bundling
  - Project financing integration

- **Infrastructure Scaling**
  - Multi-region deployment
  - CDN for global content delivery
  - Database sharding and replication
  - Microservices architecture migration

### Technical Debt & Improvements

**Short-term (Next 3 months):**
- Comprehensive test coverage (unit, integration, E2E)
- Performance optimization and caching strategies
- Enhanced error handling and logging
- API versioning strategy
- Documentation automation

**Medium-term (3-6 months):**
- Migration to microservices (if needed)
- Advanced monitoring and observability
- Automated backup and disaster recovery
- CI/CD pipeline optimization
- Load testing and capacity planning

**Long-term (6-12 months):**
- Machine learning model training on transaction data
- Advanced fraud detection with ML
- Predictive analytics for market trends
- Automated compliance checking
- Integration with IoT sensors for real-time emission tracking

### Business Model Considerations

**MVP to Production Transition:**
1. **Pilot Program**: Partner with 10-20 organizations for beta testing
2. **Regulatory Compliance**: Ensure full compliance with CCTS and BEE regulations
3. **Partnership Development**: Partner with verification agencies and registries
4. **Funding**: Secure funding for infrastructure and team expansion
5. **Market Validation**: Validate product-market fit with real users
6. **Feature Prioritization**: Focus on features with highest user demand

### Success Metrics

**MVP Success Indicators:**
- User registration and retention rates
- Transaction volume and value
- AI agent usage and satisfaction
- Verification success rates
- Platform uptime and performance

**Production Readiness:**
- 99.9% uptime SLA
- <200ms API response times
- Support for 10,000+ concurrent users
- Processing 100,000+ credits monthly
- Zero security incidents

---

## Team

This project was developed by a team of passionate developers for AutonomousHacks 2026.

**Roles & Contributions:**
- **Developer 1**: Backend Core & Infrastructure
  - FastAPI architecture design
  - Database modeling and optimization
  - Docker containerization
  - API development and documentation

- **Developer 2**: AI Agents & RAG
  - AI agent implementation (Education, Calculator, Formalities, Verification)
  - RAG system with Qdrant
  - LLM integration and prompt engineering
  - Document processing and OCR

- **Developer 3**: Frontend & UI
  - React application architecture
  - User interface design and implementation
  - State management and API integration
  - Responsive design and accessibility

### Acknowledgments

We would like to thank:
- **Google Developer Group (GDG) Gandhinagar** for organizing AutonomousHacks 2026
- **Google for Developers** for supporting the hackathon
- **AutonomousHacks organizers** for creating an amazing platform for innovation
- **Open source community** for the incredible tools and libraries we used
- **India's carbon market stakeholders** for inspiring us to build this solution

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Carbon Credit Marketplace Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Contact & Links

- **Hackathon Website**: [autonomoushacks.co.in](https://autonomoushacks.co.in/)
- **GDG Gandhinagar**: [gdg.community.dev/gdg-gandhinagar](https://gdg.community.dev/gdg-gandhinagar)
- **Project Repository**: [GitHub URL]

For questions, feedback, or collaboration opportunities, please open an issue in the repository.

---

**Built with ❤️ for AutonomousHacks 2026 | Swachh Bharat Track**
