# Carbon Credit Marketplace - Testing Guide

## 🚀 Quick Start

### 1. Start the Application
```bash
cd carbon-credit-marketplace
docker-compose up --build
```

Wait for all services to start (usually takes 1-2 minutes). You should see:
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ Database initialized with seed data
- ✅ Qdrant vector database ready

### 2. Access the Application
Open your browser and navigate to: **http://localhost:3000**

---

## 👤 Test Accounts

### Buyer Accounts (for purchasing credits)
- **Email:** `buyer@demo.com`
- **Password:** `demo123`
- **Credit Balance:** 0 (will receive credits after purchase)

- **Email:** `buyer2@demo.com`
- **Password:** `demo123`
- **Credit Balance:** 0

### Seller Accounts (for selling credits)
- **Email:** `seller@demo.com`
- **Password:** `demo123`
- **Credit Balance:** 500 credits
- **Listings:** 4 active listings

- **Email:** `seller2@demo.com`
- **Password:** `demo123`
- **Credit Balance:** 500 credits
- **Listings:** 3 active listings

- **Email:** `seller3@demo.com`
- **Password:** `demo123`
- **Credit Balance:** 500 credits
- **Listings:** 2 active listings

---

## 🧪 Testing Workflows

### **Feature 1: Marketplace & Purchase Flow** 🛒

#### Step 1: Login as Buyer
1. Go to http://localhost:3000
2. Click **"Login"** or navigate to `/login`
3. Enter:
   - Email: `buyer@demo.com`
   - Password: `demo123`
4. Click **"Sign In"**

#### Step 2: Browse Marketplace
1. Navigate to **"Marketplace"** from the sidebar or go to `/marketplace`
2. You should see **10 pre-seeded listings** with:
   - Project type (Renewable Energy, Forestry, Energy Efficiency, Green Hydrogen)
   - Price per credit (₹2,200 - ₹3,200)
   - Available quantity
   - Quality scores (Additionality, Permanence)
   - Project location
   - Co-benefits
   - Serial number ranges

#### Step 3: Purchase Credits
1. Click **"Buy Now"** on any listing
2. In the purchase dialog:
   - Enter quantity (e.g., 50 credits)
   - Review total amount
   - Click **"Confirm Purchase"**
3. This creates a transaction with status `payment_pending`

#### Step 4: Complete Payment (Simulated)
1. Navigate to **"Transactions"** from sidebar (`/transactions`)
2. You should see your transaction with status `payment_pending`
3. Click on the transaction to view details
4. Click **"Complete Payment"** button (simulates payment)
5. Wait for success notification
6. Transaction status should change to `completed`
7. Credits should be transferred to your account

#### Step 5: Verify Credit Balance
1. Navigate to **"Portfolio"** from sidebar (`/portfolio`)
2. Check **"Total Balance"** - should show 50 credits (or quantity purchased)
3. Check **"Available Balance"** - should match total balance
4. Scroll down to see **"Credit Transaction History"** - should show the purchase

---

### **Feature 2: Portfolio Management** 💼

#### Step 1: View Portfolio as Buyer
1. Login as `buyer@demo.com`
2. Navigate to **"Portfolio"** (`/portfolio`)
3. You should see:
   - **Total Balance:** 0 (initially)
   - **Available Balance:** 0
   - **Locked Balance:** 0 (used for pending orders)
   - **Retired Balance:** 0

#### Step 2: Transfer Credits (Between Users)
1. Purchase some credits first (follow Feature 1)
2. Go to Portfolio page
3. Click **"Transfer Credits"** button
4. Enter:
   - Recipient email: `buyer2@demo.com`
   - Amount: 10 credits
   - Description: "Test transfer"
5. Click **"Transfer"**
6. Verify:
   - Your balance decreased by 10
   - Check transaction history for the transfer entry

#### Step 3: Retire Credits (Compliance/Voluntary)
1. In Portfolio page, click **"Retire Credits"** button
2. Fill form:
   - Amount: 5 credits
   - Purpose: Select "Compliance" or "Voluntary"
   - Compliance Period: "2024-25" (if compliance)
   - Beneficiary: "Green Manufacturing Co."
3. Click **"Retire"**
4. Verify:
   - Total balance decreased
   - Retired balance increased
   - Check **"Retirement Records"** section at bottom

#### Step 4: View as Seller (with Initial Credits)
1. Logout and login as `seller@demo.com`
2. Navigate to **"Portfolio"** (`/portfolio`)
3. You should see:
   - **Total Balance:** 500 credits (from seed data)
   - **Available Balance:** 500 credits
4. View transaction history (should show initial issuance)

#### Step 5: Demo Credit Issuance (For Sellers)
1. As `seller@demo.com`, go to Portfolio
2. Scroll to bottom, find **"Demo Actions"** section
3. Click **"Issue Credits (Demo)"** button
4. This simulates BEE issuing new credits
5. Verify balance increases

---

### **Feature 3: Transaction Management** 📊

#### Step 1: View All Transactions
1. Login as `buyer@demo.com`
2. Navigate to **"Transactions"** (`/transactions`)
3. You should see:
   - Transaction summary cards (Total, Completed, Pending, etc.)
   - List of all transactions with:
     - Transaction number
     - Seller name
     - Quantity
     - Total amount
     - Status badges
     - Date

#### Step 2: Filter Transactions
1. Use filter dropdowns:
   - **Status:** All, Pending, Completed, Cancelled
   - **Type:** All, Purchase, Sale
   - **Date Range:** Last week, month, etc.
2. Verify filtering works correctly

#### Step 3: View Transaction Details
1. Click on any transaction from the list
2. Modal should show:
   - Full transaction details
   - Payment status
   - Credit transfer status
   - Timeline
3. For `payment_pending` transactions, you should see **"Complete Payment"** button
4. For `completed` transactions, you should see full details only

#### Step 4: Cancel Transaction
1. Find a transaction with status `payment_pending`
2. Click **"Cancel"** button
3. Transaction status should change to `cancelled`
4. Listing quantity should be restored

#### Step 5: Test as Seller
1. Logout and login as `seller@demo.com`
2. Navigate to **"Transactions"** (`/transactions`)
3. You should see:
   - Transactions where you are the seller
   - Payment received notifications
   - Sale completion notifications

---

### **Feature 4: Compliance Tracking** ✅

#### Step 1: View Compliance Dashboard
1. Login as `buyer@demo.com` (buyers have compliance requirements)
2. Navigate to **"Compliance"** (`/compliance`)
3. You should see:
   - Compliance summary cards
   - Current compliance period
   - Status overview (Compliant, At Risk, Non-Compliant)

#### Step 2: Create Compliance Record
1. Click **"Create Compliance Record"** button
2. Fill form:
   - Compliance Period: "2024-25"
   - Sector: "cement" (auto-filled from user profile)
   - Target Emission Intensity: 0.85 (tCO2e per ton)
   - Baseline Emission Intensity: 0.90
   - Deadline: Select future date
3. Click **"Create"**
4. Verify record appears in the list

#### Step 3: Submit Actual Emission Data
1. Click on a compliance record
2. Click **"Submit Emission Data"** button
3. Fill form:
   - Actual Emissions: 10000 (tCO2e)
   - Actual Production: 12000 (tons)
   - Actual Emission Intensity: 0.83 (calculated automatically)
4. Click **"Submit"**
5. System should:
   - Calculate credits required
   - Show shortfall/surplus
   - Update status

#### Step 4: Surrender Credits for Compliance
1. In a compliance record that requires credits
2. Click **"Surrender Credits"** button
3. Enter amount of credits to surrender
4. Click **"Surrender"**
5. Verify:
   - Credits deducted from portfolio
   - Compliance status updated
   - Record shows credits surrendered

#### Step 5: View Compliance Calendar
1. In Compliance page, look for **"Compliance Calendar"** section
2. Should show upcoming deadlines
3. Should highlight overdue periods

---

### **Feature 5: Market Data & Analytics** 📈

#### Step 1: View Market Overview
1. Login as any user
2. Navigate to **"Marketplace"** (`/marketplace`)
3. Look for market statistics (if displayed):
   - Average price
   - Total volume
   - Active listings

#### Step 2: View Price History (API Testing)
You can test the market data API directly via:
- **GET** http://localhost:8000/api/market/overview
- **GET** http://localhost:8000/api/market/price-history?days=30
- **GET** http://localhost:8000/api/market/stats

Or use the API docs at: http://localhost:8000/docs

---

### **Feature 6: Enhanced Marketplace Listings** 🏷️

#### Step 1: View Enhanced Listing Details
1. Login as buyer
2. Go to Marketplace
3. Each listing card now shows:
   - **Project Location:** e.g., "Rajasthan, India"
   - **Quality Scores:**
     - Additionality Score (0-100)
     - Permanence Score (0-100)
   - **Serial Numbers:** Range (e.g., "CCC-2024-0001-0001 to CCC-2024-0001-0150")
   - **Methodology:** e.g., "Renewable Energy (including hydro and pumped storage)"
   - **Co-benefits:** e.g., "Local employment, Grid stability, Air quality improvement"
   - **Available Quantity:** Updates after purchases

#### Step 2: Filter by Quality
1. In Marketplace, use filters:
   - Filter by project type
   - Filter by vintage
   - Sort by price, quality scores

---

### **Feature 7: Verification Workflow** 🔍

#### Step 1: Create Verification Request (API Testing)
Test via API docs (http://localhost:8000/docs):
- **POST** `/api/verification/requests`
- Body:
```json
{
  "verification_type": "listing",
  "verifier_agency": "Demo Verification Agency",
  "verifier_contact": "contact@demo-verifier.com"
}
```

#### Step 2: Submit Documents (API Testing)
- **POST** `/api/verification/{verification_id}/documents`
- Body:
```json
{
  "document_type": "project_document",
  "filename": "project_plan.pdf",
  "file_url": "https://example.com/doc.pdf"
}
```

---

### **Feature 8: Project Registration** 🏗️

#### Step 1: Create Project (API Testing)
1. Login as `seller@demo.com`
2. Use API docs: http://localhost:8000/docs
3. **POST** `/api/projects`
4. Body:
```json
{
  "project_name": "Solar Farm Project Alpha",
  "project_type": "Renewable Energy",
  "methodology": "Renewable Energy (including hydro and pumped storage)",
  "description": "Large-scale solar installation",
  "location": "Rajasthan, India",
  "state": "Rajasthan",
  "country": "India",
  "start_date": "2024-01-01",
  "expected_annual_credits": 1000
}
```

#### Step 2: Validate Project (API Testing)
- **POST** `/api/projects/{project_id}/validate`
- This simulates BEE validation

---

## 🔍 Testing Checklist

### ✅ Core Features
- [ ] Login with test accounts
- [ ] Browse marketplace listings
- [ ] Purchase credits (Buy Now)
- [ ] Complete payment simulation
- [ ] View portfolio balance
- [ ] Transfer credits between users
- [ ] Retire credits
- [ ] View transaction history
- [ ] Filter transactions
- [ ] Create compliance record
- [ ] Submit emission data
- [ ] Surrender credits for compliance

### ✅ UI/UX
- [ ] Navigation works across all pages
- [ ] Responsive design (mobile/tablet)
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Success notifications appear
- [ ] Data refreshes after actions

### ✅ Data Integrity
- [ ] Credit balances update correctly
- [ ] Transaction statuses update properly
- [ ] Listing quantities decrease after purchase
- [ ] Compliance calculations are correct
- [ ] Credit transfers are recorded

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:** 
- Check if backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify backend URL in frontend: Should be `http://localhost:8000`

### Issue: "Login fails"
**Solution:**
- Verify database is seeded: Check backend logs for "Database seeded"
- Try resetting: `docker-compose down -v && docker-compose up --build`

### Issue: "No listings showing"
**Solution:**
- Check if seed data ran successfully
- Login as seller to verify listings exist
- Check backend API: `GET http://localhost:8000/api/marketplace/listings`

### Issue: "Payment not completing" or "Failed to initiate purchase"
**Solution:**
- Check browser console (F12 → Console tab) for detailed errors
- Check Network tab (F12 → Network) to see the actual API request/response
- Look for the actual error message in the toast notification (now shows detailed errors)
- Verify you're logged in (check if token exists: F12 → Application → Local Storage → `token`)
- Check backend logs: `docker-compose logs -f backend` to see detailed error messages
- Verify listing ID format is correct (should be UUID format)
- Common errors:
  - **401 Unauthorized**: Token expired or missing - try logging in again
  - **404 Not Found**: Listing doesn't exist or was deleted
  - **400 Bad Request**: Quantity exceeds available, or trying to buy own listing
  - **422 Validation Error**: Invalid data format (listing_id not UUID, quantity not number)

---

## 📱 API Testing with Swagger Docs

### Access API Documentation
1. Navigate to: http://localhost:8000/docs
2. This opens interactive Swagger UI
3. Click **"Authorize"** button (lock icon)
4. Login first, then get JWT token from browser DevTools → Application → Local Storage → `token`
5. Enter token as: `Bearer <your-token>`
6. Now you can test all endpoints directly

### Key Endpoints to Test

#### Transactions
- `POST /api/transactions/purchase` - Create purchase
- `GET /api/transactions` - List transactions
- `GET /api/transactions/{id}` - Get transaction details

#### Payments
- `POST /api/payments/simulate-complete/{transaction_id}` - Complete payment
- `GET /api/payments/{transaction_id}` - Get payment status

#### Portfolio
- `GET /api/registry/account` - Get credit account
- `POST /api/registry/transfer` - Transfer credits
- `POST /api/registry/retire` - Retire credits

#### Compliance
- `POST /api/compliance/records` - Create compliance record
- `POST /api/compliance/{id}/emissions` - Submit emissions
- `POST /api/compliance/{id}/surrender` - Surrender credits

---

## 🎯 Demo Scenarios for VC Pitch

### Scenario 1: Complete Purchase Flow (2 minutes)
1. Login as buyer → Browse marketplace → Purchase 100 credits → Complete payment → Check portfolio (should show 100 credits)

### Scenario 2: Compliance Workflow (3 minutes)
1. Login as buyer → Create compliance record → Submit emissions → Surrender credits → Verify compliance status

### Scenario 3: Seller Experience (2 minutes)
1. Login as seller → View portfolio (500 credits) → View listings → View sales transactions → Check revenue

### Scenario 4: Credit Transfer (1 minute)
1. Login as buyer → Purchase credits → Transfer to another user → Verify both accounts updated

---

## 📊 Expected Data After Seed

### Listings: 10 active listings
- 3x Renewable Energy projects
- 3x Forestry projects
- 2x Energy Efficiency projects
- 2x Green Hydrogen projects

### Users: 5 users
- 2 buyers (0 credits each)
- 3 sellers (500 credits each)

### Credit Accounts: 5 accounts
- All users have accounts
- Sellers have 500 available credits
- Buyers have 0 credits

---

## 🚨 Notes for Testing

1. **Simulated Features:** Payment gateway, GCI/BEE integrations are simulated for MVP
2. **No Real Payments:** All payment flows are simulated - no actual money is processed
3. **Demo Mode:** Some features like "Issue Credits" are demo-only buttons
4. **Data Persistence:** Data persists in Docker volumes - use `docker-compose down -v` to reset
5. **API First:** Most features work via API - frontend may not have UI for everything yet

---

## 💡 Tips

- Use browser DevTools (F12) to inspect network requests
- Check backend logs: `docker-compose logs -f backend`
- Use Postman/Insomnia for API testing alongside UI
- Test with multiple browsers to check compatibility
- Use mobile view (DevTools responsive mode) to test mobile UI

---

**Happy Testing! 🎉**

For issues or questions, check the backend logs or API documentation at http://localhost:8000/docs
