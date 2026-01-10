# Carbon Credit Marketplace Intelligence Platform
## Complete Implementation Plan for Hackathon-Ready Demo

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Updated Agent Architecture](#2-updated-agent-architecture)
3. [Authentication & User Management](#3-authentication--user-management)
4. [UI/UX Design](#4-uiux-design)
5. [Data Requirements](#5-data-requirements)
6. [Technology Stack](#6-technology-stack)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [Implementation Phases](#9-implementation-phases)
10. [Additional Agents Suggestions](#10-additional-agents-suggestions)
11. [Mock Data & Demo Scenario](#11-mock-data--demo-scenario)

---

## 1. System Overview

### 1.1 Platform Purpose
A comprehensive carbon credit marketplace platform with AI agents to help:
- **SMEs** learn about carbon credits (Education Agent)
- **Businesses** calculate emissions and credit needs (Calculator Agent)
- **Buyers** find suitable sellers (Matching Agent)
- **All users** navigate government formalities (Formalities Advisor)

### 1.2 User Types
1. **Buyers**: Covered entities, voluntary buyers, organizations
2. **Sellers**: Credit generators, project developers, brokers
3. **Admin**: Platform administrators

### 1.3 Core Value Propositions
- **For Buyers**: Simplified emission calculation, matched sellers, streamlined compliance
- **For Sellers**: Access to buyers, pricing intelligence, market visibility
- **For SMEs**: Education and guidance to enter carbon market

---

## 2. Updated Agent Architecture

### 2.1 Primary Agents (Must Have for MVP)

#### **Agent 1: Carbon Credit Education Agent** 🎓
**Purpose**: Help SMEs and new users understand carbon credits

**Key Features**:
- Interactive Q&A chat interface
- Educational content library
- "Getting Started" wizard
- FAQ system
- Glossary of terms
- Tutorial integration

**Data Sources**:
- Carbon Credits Research Report (primary knowledge base)
- BEE guidelines and circulars
- CCTS documentation
- Regulatory FAQs

**Technical Implementation**:
- **LLM**: GPT-4 / Claude for Q&A
- **RAG System**: ChromaDB/Pinecone with research report embeddings
- **Knowledge Base**: Ingested PDFs and documents
- **Chat Interface**: Streamlit chat widget or custom chat UI

**User Flow**:
```
User → Chat Interface → Education Agent
                    ↓
          [Check Knowledge Base]
                    ↓
          [Generate Answer with Citations]
                    ↓
          [Display Response + Related Links]
```

#### **Agent 2: Emission Calculator Agent** 📊
**Purpose**: Calculate emissions and credit needs through personalized questionnaires

**Key Features**:
- Dynamic questionnaire (industry-specific)
- Multi-step wizard interface
- Real-time calculation
- Results dashboard
- Credit requirement estimation
- Cost projections

**Questionnaire Flow**:
```
Step 1: Business Profile
  - Sector selection (9 sectors + Others)
  - Company size
  - Location
  - Business type

Step 2: Energy Consumption
  - Electricity usage (kWh)
  - Fuel consumption (type & quantity)
  - Renewable energy usage
  - Energy sources breakdown

Step 3: Production Data
  - Production volume
  - Production units (sector-specific)
  - Production processes
  - Operating hours

Step 4: Transportation
  - Fleet size and type
  - Fuel consumption
  - Logistics data
  - Employee commuting

Step 5: Waste Management
  - Waste generation
  - Waste treatment methods
  - Recycling data

Step 6: Sector-Specific Questions
  - Cement: Clinker production
  - Steel: Blast furnace operations
  - Textiles: Dyeing processes
  - etc.

Step 7: Results & Recommendations
  - Total emissions (tCO2e)
  - Emission intensity
  - Credit requirements
  - Cost estimates
  - Reduction recommendations
```

**Calculation Logic**:
```python
# Emission Calculation
total_emissions = (
    scope1_emissions +  # Direct emissions
    scope2_emissions +  # Indirect (electricity)
    scope3_emissions    # Other indirect
)

# Credit Requirement (for covered entities)
if is_covered_entity:
    target_reduction = baseline_emissions * target_percent
    credits_needed = (current_emissions - target_emissions) / 1.0  # 1 credit = 1 tCO2e
else:
    credits_needed = voluntary_offset_amount
```

**Technical Implementation**:
- **Calculation Engine**: Python-based with industry-specific emission factors
- **Database**: Store questionnaire responses and calculations
- **UI**: Multi-step form wizard (Streamlit form or React components)

#### **Agent 3: Seller Matching & Recommendation Agent** 🤝
**Purpose**: Match buyers with suitable credit sellers

**Key Features**:
- Requirement analysis
- Seller profiling
- Matching algorithm
- Recommendation ranking
- Comparison tools

**Matching Algorithm**:
```python
def match_sellers(buyer_requirements, available_sellers):
    """
    Match sellers based on:
    1. Credit quantity available
    2. Vintage preferences
    3. Project type match
    4. Price range
    5. Verification status
    6. Seller rating
    7. Transaction history
    """
    scores = []
    for seller in available_sellers:
        score = calculate_match_score(buyer_requirements, seller)
        scores.append((seller, score))
    
    # Sort by score and return top matches
    return sorted(scores, key=lambda x: x[1], reverse=True)[:5]
```

**Technical Implementation**:
- **Matching Engine**: Python-based algorithm
- **ML Component**: Optional - use XGBoost for learning preferences
- **UI**: Recommendation cards with comparison table

#### **Agent 4: Government Formalities Advisor Agent** 📋
**Purpose**: Guide users through government procedures and certifications

**Key Features**:
- Registration workflow wizard
- Document checklist generator
- Deadline tracker
- Status dashboard
- Reminder system
- Contact directory

**Workflow Types**:
1. **Buyer Registration** (GCI Registry)
   - Step 1: Company information
   - Step 2: Contact details
   - Step 3: Document upload
   - Step 4: Payment
   - Step 5: Approval tracking

2. **Seller Registration** (Offset Project Registration)
   - Step 1: Project details
   - Step 2: Methodology selection
   - Step 3: Documentation
   - Step 4: BEE approval process
   - Step 5: Verification tracking

3. **MRV Compliance** (Covered Entities)
   - Step 1: Monitoring plan preparation
   - Step 2: Data collection
   - Step 3: Report preparation
   - Step 4: Verification agency selection
   - Step 5: Submission tracking
   - Step 6: Deadline reminders

**Technical Implementation**:
- **Workflow Engine**: State machine for tracking progress
- **Document Management**: File upload and storage
- **Reminder System**: Scheduled notifications
- **UI**: Progress tracker with step-by-step guidance

### 2.2 Supporting Agents (Nice to Have)

#### **Agent 5: Market Intelligence Agent** 📈
- Real-time price tracking
- Market trends analysis
- News aggregation
- Price alerts

#### **Agent 6: Trading Platform Agent** 💱
- Order matching
- Price discovery
- Transaction execution
- Settlement coordination

#### **Agent 7: Notification Agent** 🔔
- Alert management
- Email notifications
- SMS notifications (optional)
- In-app notifications

---

## 3. Authentication & User Management

### 3.1 Registration Flow

#### Buyer Registration
```
┌─────────────────────────────────────┐
│  Step 1: Account Creation           │
│  - Email                            │
│  - Password                         │
│  - Confirm Password                 │
│  - User Type: Buyer ☑              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Step 2: Company Information        │
│  - Company Name                     │
│  - Sector (Dropdown)                │
│  - Company Size                     │
│  - Registration Number              │
│  - Address                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Step 3: Additional Details         │
│  - Contact Person                   │
│  - Phone Number                     │
│  - Tax ID                           │
│  - Business Type (Covered/Voluntary)│
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Step 4: Email Verification         │
│  - Send verification email          │
│  - Verify link                      │
└──────────────┬──────────────────────┘
               │
        [Registration Complete]
```

#### Seller Registration
```
┌─────────────────────────────────────┐
│  Step 1: Account Creation           │
│  - Email                            │
│  - Password                         │
│  - User Type: Seller ☑             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Step 2: Company Information        │
│  - Company Name                     │
│  - Business Type (Project Developer/Broker)│
│  - Registration Number              │
│  - Address                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Step 3: Credit Portfolio Info      │
│  - Project Types                    │
│  - Estimated Credits Available      │
│  - Verification Status              │
│  - GCI Registration Status          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Step 4: Verification Documents     │
│  - Upload certificates              │
│  - Bank details                     │
│  - Tax documents                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Step 5: Email Verification         │
└──────────────┬──────────────────────┘
               │
        [Registration Complete]
        [Admin Approval Required]
```

### 3.2 Authentication System

**Tech Stack**:
- **Backend**: FastAPI with JWT tokens
- **Password Hashing**: bcrypt
- **Session Management**: JWT tokens with refresh tokens
- **Email Service**: SMTP or SendGrid/Mailgun

**Database Schema**:
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- 'buyer', 'seller', 'admin'
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Buyer profiles
CREATE TABLE buyer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    company_size VARCHAR(50),
    registration_number VARCHAR(100),
    business_type VARCHAR(50), -- 'covered_entity', 'voluntary'
    contact_person VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seller profiles
CREATE TABLE seller_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50), -- 'project_developer', 'broker'
    registration_number VARCHAR(100),
    address TEXT,
    verification_status VARCHAR(50), -- 'pending', 'verified', 'rejected'
    admin_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. UI/UX Design

### 4.1 Design System

**Color Palette**:
- **Primary Green**: #10B981 (Carbon/Environment theme)
- **Secondary Blue**: #3B82F6 (Trust/Information)
- **Accent Orange**: #F59E0B (Alerts/Warnings)
- **Success**: #059669
- **Danger**: #EF4444
- **Background**: #F9FAFB
- **Text**: #111827, #6B7280

**Typography**:
- **Heading**: Inter Bold / Poppins Bold
- **Body**: Inter Regular / Poppins Regular
- **Monospace**: Source Code Pro (for numbers/data)

### 4.2 Page Layouts

#### **Landing Page** (`/`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo | Features | Pricing | Login | Sign Up   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO SECTION                                           │
│  ┌───────────────────────────────────────────────┐    │
│  │  "Your Carbon Credit Marketplace Intelligence" │    │
│  │  Subtitle: "Calculate, Match, Trade"          │    │
│  │  [Get Started as Buyer] [List as Seller]     │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  FEATURES SECTION                                       │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │ Learn  │  │Calculate│ │ Match  │  │ Trade  │      │
│  │ About  │  │Emissions│ │ Sellers│  │ Credits│      │
│  └────────┘  └────────┘  └────────┘  └────────┘      │
│                                                         │
│  AGENTS SECTION                                         │
│  - Education Agent                                      │
│  - Calculator Agent                                     │
│  - Matching Agent                                       │
│  - Formalities Advisor                                  │
│                                                         │
│  FOOTER                                                 │
└─────────────────────────────────────────────────────────┘
```

#### **Buyer Dashboard** (`/dashboard/buyer`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo | Dashboard | Calculator | Match | Trade │
│            | Profile | Notifications (🔔) | Logout     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  QUICK STATS (4 Cards)                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Emissions│ │Credits   │ │Matched   │ │Active    │  │
│  │ Calculated│ │Needed    │ │Sellers   │ │Orders    │  │
│  │ 850 tCO2e│ │ 60 credits│ │ 5 sellers│ │ 2 orders │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ MY CREDIT NEEDS      │  │ RECOMMENDED SELLERS     │ │
│  │ ┌──────────────────┐ │  │ ┌─────────────────────┐ │ │
│  │ │ Credits Needed:  │ │  │ │ Seller 1 ⭐⭐⭐⭐⭐  │ │ │
│  │ │ 60 credits       │ │  │ │ Price: ₹2,500/credit│ │ │
│  │ │ Vintage: 2023-24 │ │  │ │ Available: 100       │ │ │
│  │ │ [Calculate Now]  │ │  │ │ [View Details]       │ │ │
│  │ └──────────────────┘ │  │ └─────────────────────┘ │ │
│  │                      │  │ ┌─────────────────────┐ │ │
│  │                      │  │ │ Seller 2 ⭐⭐⭐⭐☆  │ │ │
│  │                      │  │ │ ...                 │ │ │
│  │                      │  │ └─────────────────────┘ │ │
│  └──────────────────────┘  └─────────────────────────┘ │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ COMPLIANCE STATUS    │  │ RECENT ACTIVITY         │ │
│  │ ┌──────────────────┐ │  │ • Matched with 3 sellers│ │
│  │ │ Status: At Risk  │ │  │ • Calculated emissions  │ │
│  │ │ Deadline: 45 days│ │  │ • Viewed credit listings│ │
│  │ │ [View Details]   │ │  └─────────────────────────┘ │
│  │ └──────────────────┘ │                             │
│  └──────────────────────┘                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Seller Dashboard** (`/dashboard/seller`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo | Dashboard | Inventory | Sales | Orders │
│            | Profile | Notifications (🔔) | Logout     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  QUICK STATS (4 Cards)                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Available│ │Sold      │ │Revenue   │ │Buyer     │  │
│  │ Credits  │ │Credits   │ │Earned    │ │Inquiries │  │
│  │ 500      │ │ 120      │ │ ₹3,00,000│ │ 15       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ CREDIT INVENTORY     │  │ SALES PERFORMANCE       │ │
│  │ ┌──────────────────┐ │  │ ┌─────────────────────┐ │ │
│  │ │ Listing 1        │ │  │ │ Revenue Chart       │ │ │
│  │ │ Qty: 100 credits │ │  │ │ [Line Chart]        │ │ │
│  │ │ Price: ₹2,500    │ │  │ └─────────────────────┘ │ │
│  │ │ [Edit] [Delete]  │ │  │                        │ │
│  │ └──────────────────┘ │  │ ┌─────────────────────┐ │ │
│  │ ┌──────────────────┐ │  │ │ Top Buyers          │ │ │
│  │ │ Listing 2        │ │  │ │ • Company A         │ │ │
│  │ │ ...              │ │  │ │ • Company B         │ │ │
│  │ └──────────────────┘ │  │ └─────────────────────┘ │ │
│  │ [List New Credits]   │  └─────────────────────────┘ │
│  └──────────────────────┘                             │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ BUYER INQUIRIES      │  │ ACTIVE ORDERS           │ │
│  │ ┌──────────────────┐ │  │ • Order #1234 (Pending)│ │
│  │ │ Inquiry from:    │ │  │ • Order #1235 (Processing)││
│  │ │ Company XYZ      │ │  └─────────────────────────┘ │
│  │ │ Qty: 50 credits  │ │                             │
│  │ │ [Respond]        │ │                             │
│  │ └──────────────────┘ │                             │
│  └──────────────────────┘                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Education Agent Interface** (`/learn`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Back to Dashboard                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  CARBON CREDIT EDUCATION CENTER                   │ │
│  │  "Learn everything about Carbon Credits"          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ QUICK START GUIDE    │  │ INTERACTIVE CHAT        │ │
│  │ ┌──────────────────┐ │  │ ┌─────────────────────┐ │ │
│  │ │ Step 1: Basics   │ │  │ │ Ask any question... │ │ │
│  │ │ Step 2: Trading  │ │  │ │                     │ │ │
│  │ │ Step 3: Compliance│ │ │ │                     │ │ │
│  │ │ [Start Learning] │ │  │ │                     │ │ │
│  │ └──────────────────┘ │  │ │                     │ │ │
│  │                      │  │ │ [Send]              │ │ │
│  │  POPULAR QUESTIONS   │  │ └─────────────────────┘ │ │
│  │  • What are carbon   │  │                         │ │
│  │    credits?          │  │  RECENT CHATS          │ │
│  │  • How to calculate  │  │  • Q: What is CCTS?    │ │
│  │    emissions?        │  │  • Q: Banking rules?   │ │
│  │  • How to buy?       │  │                        │ │
│  └──────────────────────┘  └─────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  RESOURCE LIBRARY                                  │ │
│  │  [Documents] [Videos] [Guides] [FAQs] [Glossary] │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Emission Calculator Interface** (`/calculator`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Back to Dashboard                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PROGRESS: Step 1 of 7  [████░░░░░░░]                   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  STEP 1: BUSINESS PROFILE                         │ │
│  │                                                    │ │
│  │  Sector *                                          │ │
│  │  [Select Sector ▼]                                 │ │
│  │    - Cement                                        │ │
│  │    - Iron & Steel                                  │ │
│  │    - Textiles                                      │ │
│  │    - ...                                           │ │
│  │                                                    │ │
│  │  Company Size *                                    │ │
│  │  ○ Small (<50 employees)                           │ │
│  │  ○ Medium (50-250 employees)                       │ │
│  │  ○ Large (>250 employees)                          │ │
│  │                                                    │ │
│  │  Location *                                        │ │
│  │  [State ▼]  [City ▼]                              │ │
│  │                                                    │ │
│  │  Are you a covered entity?                         │ │
│  │  ○ Yes  ○ No                                       │ │
│  │                                                    │ │
│  │  [Back]              [Next: Energy Consumption →]  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Seller Matching Interface** (`/match`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Back to Dashboard                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  FIND MATCHED SELLERS                             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  REQUIREMENTS FORM                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Credits Needed: [60] credits                      │ │
│  │ Vintage Preference: [2023-2024 ▼]                 │ │
│  │ Project Type: [Renewable Energy ▼]                │ │
│  │ Price Range: [₹2,000] to [₹3,000] per credit     │ │
│  │ Verification Status: ☑ Verified only              │ │
│  │                                                    │ │
│  │ [Clear]              [Find Matches]               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  MATCHED SELLERS (5 found)                              │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐⭐ Seller 1                                │ │
│  │ Company: Green Energy Pvt Ltd                     │ │
│  │ Available: 100 credits | Price: ₹2,450/credit    │ │
│  │ Vintage: 2023 | Type: Solar | Verified: Yes      │ │
│  │ Match Score: 95%                                  │ │
│  │ [View Details] [Contact Seller] [Add to Cart]    │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐☆ Seller 2                                 │ │
│  │ ...                                               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Compare Selected] [View All Listings]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Trading Platform** (`/marketplace`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Marketplace | Browse | My Orders | Cart (2)    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MARKET OVERVIEW                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Avg Price│ │ Volume   │ │ Buy      │ │ Sell     │  │
│  │ ₹2,500   │ │ 1,200    │ │ Orders   │ │ Orders   │  │
│  │ +5% ▲    │ │ credits  │ │ 25       │ │ 18       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ PRICE CHART          │  │ FILTERS                 │ │
│  │ [7D] [30D] [90D]     │  │ ┌─────────────────────┐ │ │
│  │ ┌──────────────────┐ │  │ │ Vintage: [All ▼]    │ │ │
│  │ │ [Line Chart]     │ │  │ │ Project: [All ▼]    │ │ │
│  │ │                  │ │  │ │ Price: [Range]      │ │ │
│  │ │                  │ │  │ │ Verification: ☑ Yes │ │ │
│  │ └──────────────────┘ │  │ │ [Apply Filters]     │ │ │
│  └──────────────────────┘  │ └─────────────────────┘ │ │
│                            └─────────────────────────┘ │
│                                                         │
│  AVAILABLE CREDITS (125 listings)                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Listing #1                                         │ │
│  │ Seller: Green Energy Pvt Ltd ⭐⭐⭐⭐⭐            │ │
│  │ Quantity: 100 credits | Price: ₹2,450/credit     │ │
│  │ Vintage: 2023 | Type: Solar | Verified: ✅        │ │
│  │ [View Details] [Add to Cart] [Quick Buy]         │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Listing #2                                         │ │
│  │ ...                                               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Load More]                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Government Formalities Advisor** (`/formalities`)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Back to Dashboard                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  GOVERNMENT FORMALITIES ADVISOR                   │ │
│  │  "Navigate procedures with ease"                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  SELECT WORKFLOW                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Buyer    │ │ Seller   │ │ MRV      │ │ Project  │  │
│  │ Reg.     │ │ Reg.     │ │ Compliance│ │ Approval │  │
│  │ [Start]  │ │ [Start]  │ │ [Start]  │ │ [Start]  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ACTIVE WORKFLOWS                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │ GCI Registry Registration                         │ │
│  │ Progress: Step 3 of 5 [█████░░░░░]                │ │
│  │ Current Step: Document Upload                     │ │
│  │ Deadline: 30 days remaining                       │ │
│  │ [Continue Workflow →]                             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  DOCUMENT CHECKLIST                                     │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ☑ Company Registration Certificate                │ │
│  │ ☑ PAN Card                                         │ │
│  │ ☐ GST Certificate [Upload]                        │ │
│  │ ☐ Bank Details [Upload]                           │ │
│  │ ☐ Address Proof [Upload]                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  DEADLINE TRACKER                                       │
│  • MRV Report Submission: 45 days                      │
│  • GCI Registration: 30 days                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Data Requirements

### 5.1 Core Data Entities

See previous implementation plan document for detailed data models. Key entities:
- Users & Profiles (Buyer/Seller)
- Emissions Data
- Credit Listings
- Transactions
- Regulatory Documents (for RAG)
- Workflow States (for Formalities Advisor)

### 5.2 Industry-Specific Data

**Emission Factors Database**:
```python
EMISSION_FACTORS = {
    "cement": {
        "scope1": {
            "clinker_production": 0.85,  # tCO2e per tonne clinker
            "fuel_combustion": {}  # fuel-specific factors
        },
        "scope2": {
            "electricity": 0.82  # tCO2e per MWh (grid average)
        }
    },
    "iron_steel": {
        "scope1": {
            "blast_furnace": 1.2,  # tCO2e per tonne steel
            "electric_arc": 0.15   # tCO2e per tonne steel
        },
        # ...
    },
    # ... other sectors
}
```

**Sector-Specific Questions Database**:
- Each sector has predefined questionnaire templates
- Questions are dynamically selected based on sector choice
- Calculation formulas are sector-specific

---

## 6. Technology Stack

### 6.1 Recommended Stack (Hackathon-Optimized)

**Frontend**:
- **Framework**: Next.js 14 (React) with TypeScript
  - **Alternative**: Streamlit (faster for MVP)
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Charts**: Chart.js or Recharts
- **State Management**: Zustand or React Context
- **Forms**: React Hook Form + Zod validation

**Backend**:
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL 15+ (primary), ChromaDB (vector DB)
- **ORM**: SQLAlchemy 2.0 (async)
- **Authentication**: JWT (python-jose)
- **File Storage**: Local storage (for demo) or S3 (production)

**AI/ML**:
- **LLM**: OpenAI GPT-4 Turbo / Claude 3.5 Sonnet
- **Vector DB**: ChromaDB (embedded) or Pinecone
- **Agent Framework**: LangGraph / LangChain
- **Embeddings**: OpenAI text-embedding-3-small
- **ML Models**: XGBoost (for matching algorithm)

**Other Services**:
- **Email**: SMTP or SendGrid
- **Caching**: Redis (optional for demo)
- **Task Queue**: Celery (optional) or FastAPI BackgroundTasks

**Deployment**:
- **Frontend**: Vercel / Netlify
- **Backend**: Railway / Render / Fly.io
- **Database**: Supabase (PostgreSQL) or Railway
- **Containerization**: Docker (for local development)

### 6.2 Complete requirements.txt

```txt
# Backend Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy[asyncio]==2.0.23
asyncpg==0.29.0
alembic==1.12.1
psycopg2-binary==2.9.9

# Vector DB & AI
chromadb==0.4.18
langchain==0.1.0
langchain-openai==0.0.2
langgraph==0.0.20
openai==1.6.0
tiktoken==0.5.2

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# ML/Analytics
xgboost==2.0.3
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.4

# Data Processing
pdfplumber==0.10.3
beautifulsoup4==4.12.2
requests==2.31.0

# Utilities
python-dotenv==1.0.0
pytz==2023.3
email-validator==2.1.0
```

---

## 7. Database Schema

### 7.1 Core Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('buyer', 'seller', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE buyer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    company_size VARCHAR(50),
    registration_number VARCHAR(100),
    business_type VARCHAR(50) CHECK (business_type IN ('covered_entity', 'voluntary')),
    contact_person VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    is_covered_entity BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE seller_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) CHECK (business_type IN ('project_developer', 'broker')),
    registration_number VARCHAR(100),
    address TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending',
    admin_approved BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_transactions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Emission Calculations
CREATE TABLE emission_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    sector VARCHAR(100),
    calculation_date TIMESTAMP DEFAULT NOW(),
    total_emissions DECIMAL(10,2), -- tCO2e
    emission_intensity DECIMAL(10,4),
    scope1_emissions DECIMAL(10,2),
    scope2_emissions DECIMAL(10,2),
    scope3_emissions DECIMAL(10,2),
    credits_needed INTEGER,
    questionnaire_data JSONB, -- Store full questionnaire responses
    created_at TIMESTAMP DEFAULT NOW()
);

-- Credit Listings (for Sellers)
CREATE TABLE credit_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id),
    quantity INTEGER NOT NULL,
    price_per_credit DECIMAL(10,2) NOT NULL,
    vintage INTEGER, -- Year
    project_type VARCHAR(100),
    verification_status VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    listing_id UUID REFERENCES credit_listings(id),
    quantity INTEGER NOT NULL,
    price_per_credit DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Matching Records
CREATE TABLE seller_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    listing_id UUID REFERENCES credit_listings(id),
    match_score DECIMAL(5,2), -- 0-100
    requirements JSONB, -- Buyer requirements
    viewed BOOLEAN DEFAULT FALSE,
    contacted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workflow States (for Formalities Advisor)
CREATE TABLE workflow_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    workflow_type VARCHAR(100), -- 'buyer_registration', 'seller_registration', 'mrv_compliance'
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER,
    status VARCHAR(50) DEFAULT 'in_progress',
    data JSONB, -- Store workflow data
    deadline DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document Checklist
CREATE TABLE document_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_states(id),
    document_type VARCHAR(100),
    is_required BOOLEAN DEFAULT TRUE,
    is_uploaded BOOLEAN DEFAULT FALSE,
    file_path VARCHAR(500),
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Educational Chat History (for Education Agent)
CREATE TABLE education_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    question TEXT,
    answer TEXT,
    sources JSONB, -- References from knowledge base
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. API Endpoints

### 8.1 Authentication Endpoints

```
POST   /api/auth/register/buyer
POST   /api/auth/register/seller
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### 8.2 Education Agent Endpoints

```
POST   /api/education/chat
GET    /api/education/history
GET    /api/education/faqs
GET    /api/education/glossary
GET    /api/education/resources
```

### 8.3 Calculator Agent Endpoints

```
POST   /api/calculator/questionnaire
GET    /api/calculator/sectors
GET    /api/calculator/questions/:sector
POST   /api/calculator/calculate
GET    /api/calculator/history/:user_id
GET    /api/calculator/:calculation_id
```

### 8.4 Matching Agent Endpoints

```
POST   /api/matching/find-sellers
GET    /api/matching/sellers/:seller_id
GET    /api/matching/matches/:user_id
POST   /api/matching/contact-seller
GET    /api/matching/comparison
```

### 8.5 Formalities Advisor Endpoints

```
POST   /api/formalities/start-workflow
GET    /api/formalities/workflows/:user_id
GET    /api/formalities/workflow/:workflow_id
PUT    /api/formalities/workflow/:workflow_id/step
POST   /api/formalities/workflow/:workflow_id/documents
GET    /api/formalities/checklist/:workflow_id
GET    /api/formalities/deadlines/:user_id
```

### 8.6 Trading Platform Endpoints

```
# Listings
GET    /api/marketplace/listings
GET    /api/marketplace/listings/:id
POST   /api/marketplace/listings (seller only)
PUT    /api/marketplace/listings/:id (seller only)
DELETE /api/marketplace/listings/:id (seller only)

# Transactions
POST   /api/marketplace/orders
GET    /api/marketplace/orders/:user_id
GET    /api/marketplace/orders/:order_id
PUT    /api/marketplace/orders/:order_id/status

# Cart
POST   /api/marketplace/cart
GET    /api/marketplace/cart/:user_id
PUT    /api/marketplace/cart/:item_id
DELETE /api/marketplace/cart/:item_id
POST   /api/marketplace/cart/checkout
```

### 8.7 Dashboard Endpoints

```
GET    /api/dashboard/buyer/:user_id
GET    /api/dashboard/seller/:user_id
GET    /api/dashboard/stats/:user_id
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Hours 0-10)
**Goal**: Set up infrastructure and basic authentication

**Tasks**:
- [ ] Project setup (backend + frontend)
- [ ] Database setup (PostgreSQL + ChromaDB)
- [ ] Authentication system (register/login)
- [ ] User profiles (buyer/seller)
- [ ] Basic UI components
- [ ] Landing page

**Deliverable**: Working registration/login with user profiles

### Phase 2: Core Agents (Hours 10-20)
**Goal**: Implement 4 primary agents

**Tasks**:
- [ ] **Education Agent**:
  - Ingest research report into vector DB
  - Build RAG system
  - Create chat interface
  
- [ ] **Calculator Agent**:
  - Build questionnaire system
  - Implement calculation engine
  - Create results dashboard
  
- [ ] **Matching Agent**:
  - Build matching algorithm
  - Create seller recommendation UI
  
- [ ] **Formalities Advisor**:
  - Create workflow engine
  - Build step-by-step wizards
  - Document checklist system

**Deliverable**: All 4 agents functional

### Phase 3: Trading Platform (Hours 20-26)
**Goal**: Build trading marketplace

**Tasks**:
- [ ] Credit listing system (seller)
- [ ] Browse and filter credits (buyer)
- [ ] Cart and checkout
- [ ] Order management
- [ ] Transaction history

**Deliverable**: Functional trading platform

### Phase 4: Integration & Polish (Hours 26-30)
**Goal**: Integrate everything and prepare for demo

**Tasks**:
- [ ] Dashboard integration
- [ ] End-to-end workflows
- [ ] UI/UX polish
- [ ] Mock data generation
- [ ] Demo scenario preparation
- [ ] Bug fixes and testing

**Deliverable**: Complete demo-ready system

---

## 10. Additional Agents Suggestions

### Suggested Additional Agents

#### **Agent 8: Credit Quality Scorer Agent** ⭐
**Purpose**: Assess and score credit quality for buyers

**Why Needed**:
- Buyers need to evaluate credit quality beyond price
- Helps prevent purchasing low-quality credits
- Builds trust in marketplace

**Capabilities**:
- Analyze credit attributes (vintage, project type, verification)
- Score credits (0-100) based on multiple factors
- Compare credit quality across listings
- Risk assessment

**Priority**: Medium (Nice to have for MVP)

#### **Agent 9: Price Intelligence Agent** 💰
**Purpose**: Provide pricing insights and recommendations

**Why Needed**:
- Helps buyers/sellers determine fair market prices
- Prevents overpaying or underpricing
- Market analysis and trends

**Capabilities**:
- Historical price analysis
- Fair price recommendations
- Price alerts (when prices drop/rise)
- Market trend predictions (basic ML)

**Priority**: Medium (Can be combined with Market Intelligence)

#### **Agent 10: Compliance Tracker Agent** ✅
**Purpose**: Track compliance status and deadlines for covered entities

**Why Needed**:
- Covered entities need to track compliance obligations
- Deadline reminders are critical
- Reduces compliance risk

**Capabilities**:
- Compliance status dashboard
- Deadline tracking and reminders
- Credit requirement calculations
- Compliance gap analysis
- MRV report tracking

**Priority**: High (Should be included if time permits)

#### **Agent 11: Notification & Alert Agent** 🔔
**Purpose**: Manage all notifications and alerts

**Why Needed**:
- Users need timely updates
- Keeps users engaged
- Prevents missed deadlines

**Capabilities**:
- Price alerts
- Deadline reminders
- Order updates
- Seller match notifications
- Email and in-app notifications

**Priority**: High (Essential for user experience)

#### **Agent 12: Analytics & Reporting Agent** 📊
**Purpose**: Generate insights and reports

**Why Needed**:
- Users need performance analytics
- Helps with decision-making
- Professional reporting

**Capabilities**:
- Sales reports (sellers)
- Purchase history (buyers)
- Emission trends
- Compliance reports
- Financial reports

**Priority**: Low (Can be added post-hackathon)

### Recommended Agent Priority for MVP

**Must Have** (Core 4):
1. ✅ Education Agent
2. ✅ Calculator Agent
3. ✅ Matching Agent
4. ✅ Formalities Advisor

**Should Have** (If time permits):
5. ⭐ Compliance Tracker Agent (important for buyers)
6. 🔔 Notification Agent (essential for UX)

**Nice to Have** (Post-hackathon):
7. 💰 Price Intelligence Agent
8. ⭐ Credit Quality Scorer Agent
9. 📊 Analytics Agent

---

## 11. Mock Data & Demo Scenario

### 11.1 Mock Data Requirements

#### Users
- 3-5 Buyer accounts (different sectors)
- 3-5 Seller accounts (different project types)
- 1 Admin account

#### Credit Listings
- 20-30 mock credit listings
- Various vintages (2022-2024)
- Different project types
- Price range: ₹2,000 - ₹3,500 per credit

#### Transactions
- 5-10 completed transactions
- Various statuses (pending, completed, cancelled)

### 11.2 Demo Scenario

**Scenario 1: New SME Buyer Journey** (5-7 minutes)

1. **Landing Page** → Click "Get Started as Buyer"
2. **Registration** → Fill buyer registration form
3. **Education Agent** → Ask: "What are carbon credits?"
4. **Calculator** → Calculate emissions for cement company
5. **Results** → See credit needs (60 credits)
6. **Matching Agent** → Find matched sellers
7. **Trading Platform** → Browse and add to cart
8. **Formalities Advisor** → Start GCI registration workflow

**Scenario 2: Seller Onboarding** (3-5 minutes)

1. **Registration** → Seller registration
2. **Dashboard** → View seller dashboard
3. **List Credits** → Create new listing
4. **Formalities Advisor** → Complete project registration
5. **View Inquiries** → See buyer inquiries

---

## 12. Quick Start Guide

### For Development Team

```bash
# 1. Clone repository
git clone <repo-url>
cd carbon-marketplace-platform

# 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Database Setup
# Create PostgreSQL database
createdb carbonmarket

# Run migrations
alembic upgrade head

# 4. Environment Variables
cp .env.example .env
# Edit .env with your settings

# 5. Ingest Data
python scripts/ingest_documents.py  # Ingest research report
python scripts/generate_mock_data.py  # Generate mock data

# 6. Start Backend
uvicorn app.main:app --reload

# 7. Frontend Setup (if using Next.js)
cd ../frontend
npm install
npm run dev

# 8. Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

**Document Version**: 2.0  
**Created**: January 2025  
**Status**: Complete Implementation Plan for Hackathon  
**Next Steps**: Begin Phase 1 implementation
