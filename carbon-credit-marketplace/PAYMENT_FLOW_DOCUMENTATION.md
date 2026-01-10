# Payment Flow Documentation - Carbon Credit Marketplace

## 🎯 Overview

The marketplace currently uses a **simulated payment system** for MVP/demo purposes. This allows you to demonstrate the complete transaction flow without integrating a real payment gateway (like Razorpay, Stripe, or PayU). The simulation mimics the real-world payment flow including escrow, credit transfer, and notifications.

---

## 🔄 Current Transaction & Payment Flow

### **Step 1: Purchase Initiation** (`POST /api/transactions/buy`)
When a buyer clicks "Buy Now" on a listing:

1. ✅ **Creates a Transaction** with status `payment_pending`
2. ✅ **Creates a Payment record** with status `pending`
3. ✅ **Locks the credits** in the listing (reduces `available_quantity`)
4. ✅ **Sends notifications** to buyer and seller
5. ✅ **Returns transaction details** to frontend

**What happens:**
- No actual money is processed
- Listing quantity is reduced (credits are "locked")
- Transaction appears in both buyer's and seller's transaction list
- Status: `payment_pending`

---

### **Step 2: Payment Simulation** (`POST /api/payments/simulate-complete/{transaction_id}`)
The "Complete Payment" button in the Transactions page calls this endpoint:

1. ✅ **Simulates payment gateway** (generates fake order/payment IDs)
2. ✅ **Updates payment status** to `completed`
3. ✅ **Updates escrow status** to `released`
4. ✅ **Transfers credits** from seller to buyer:
   - Deducts from seller's credit account
   - Adds to buyer's credit account
   - Creates credit transaction records for both
5. ✅ **Updates transaction status** to `completed`
6. ✅ **Sends completion notifications** to both parties
7. ✅ **Deactivates listing** if all credits are sold

**What happens:**
- Credits are actually transferred to buyer's portfolio
- Transaction status changes to `completed`
- Both parties receive notifications
- Buyer can see credits in their Portfolio page

---

## 🎬 How to Demonstrate the Payment Flow

### **Demo Scenario 1: Complete Purchase Flow** (Recommended for VC Pitch)

#### **Setup:**
1. Start the application: `docker-compose up --build`
2. Open browser: http://localhost:3000

#### **Step-by-Step Demo:**

1. **Login as Buyer**
   - Email: `buyer@demo.com`
   - Password: `demo123`

2. **Browse Marketplace**
   - Navigate to `/marketplace`
   - You'll see 10 listings with different prices and quantities
   - Note: Sellers have 500 credits each from seed data

3. **Click "Buy Now" on any listing**
   - Dialog opens asking for quantity
   - Enter quantity (e.g., 50 credits)
   - Click "Confirm Purchase"
   - ✅ Transaction is created with status `payment_pending`
   - ✅ Listing quantity is reduced
   - ✅ You're redirected to `/transactions` page

4. **View Transaction**
   - On `/transactions` page, you'll see your new transaction
   - Status badge shows: `Payment Pending` (orange/blue)
   - Click on the transaction to see details

5. **Complete Payment (Simulated)**
   - In the transaction details dialog, click **"Complete Payment"** button
   - ✅ Payment is simulated (no real money)
   - ✅ Credits are transferred to your account
   - ✅ Status changes to `Completed` (green)
   - ✅ Success notification appears

6. **Verify Credits Received**
   - Navigate to `/portfolio` page
   - ✅ You'll see your credit balance updated
   - ✅ Check "Credit Transaction History" - shows the purchase

7. **Verify Seller's Perspective** (Optional)
   - Logout and login as `seller@demo.com` / `demo123`
   - Go to `/transactions` - see the sale transaction
   - Go to `/portfolio` - see credits deducted from their account

---

### **Demo Scenario 2: Multiple Purchases**

1. As buyer, purchase from multiple sellers
2. Complete each payment individually
3. Show how credits accumulate in portfolio
4. Show how seller listings get updated/deactivated

---

### **Demo Scenario 3: Transaction Cancellation**

1. Create a purchase (transaction with `payment_pending`)
2. Instead of completing payment, click **"Cancel"**
3. ✅ Transaction status changes to `cancelled`
4. ✅ Listing quantity is restored
5. ✅ Credits are unlocked

---

## 📊 Transaction Status Flow

```
payment_pending → [Complete Payment] → completed
                ↓
            [Cancel] → cancelled
```

**Status Meanings:**
- `payment_pending`: Transaction created, waiting for payment
- `payment_completed`: Payment verified, credits in escrow
- `completed`: Credits transferred, transaction finalized
- `cancelled`: Transaction cancelled, credits restored
- `refunded`: Payment refunded (advanced flow)

---

## 🔧 Technical Implementation Details

### **Payment Endpoints:**

1. **`POST /api/transactions/buy`**
   - Creates transaction and payment record
   - Locks credits in listing
   - Returns transaction details

2. **`POST /api/payments/simulate-complete/{transaction_id}`** ⭐ **Demo Endpoint**
   - Simulates complete payment flow in one call
   - Transfers credits between accounts
   - Updates all related records
   - **This is the key endpoint for demonstrations**

3. **`POST /api/payments/initiate`**
   - Would initiate real payment gateway order (currently simulated)
   - Generates fake gateway order ID

4. **`POST /api/payments/verify`**
   - Would verify payment gateway callback (currently simulated)
   - Updates payment and escrow status

5. **`POST /api/transactions/{transaction_id}/cancel`**
   - Cancels pending transaction
   - Restores listing quantity

---

## 💡 Why This Approach?

### **For MVP/Demo:**
✅ **No payment gateway needed** - Reduces setup complexity  
✅ **Fast demonstration** - One-click to complete entire flow  
✅ **Full functionality** - Shows credit transfer, notifications, status updates  
✅ **Realistic flow** - Mimics actual payment gateway behavior  
✅ **Easy testing** - No need for test cards or gateway accounts  

### **For Production (Future):**
When ready to integrate real payment gateway:

1. Replace `/simulate-complete` with real gateway integration
2. Use `/initiate` to create real Razorpay/Stripe order
3. Use `/verify` to handle gateway callbacks with signature verification
4. Keep the same transaction/credit transfer logic
5. Add webhook handlers for payment status updates

**Integration Points:**
- Razorpay: Use `razorpay-python` SDK
- Stripe: Use `stripe` Python SDK
- PayU: Use their REST API

---

## 🎯 Key Features Demonstrated

### **1. Credit Transfer System**
- ✅ Credits move from seller to buyer account
- ✅ Transaction history tracks all transfers
- ✅ Account balances update in real-time

### **2. Escrow Simulation**
- ✅ Payment goes through escrow status (`in_escrow` → `released`)
- ✅ Credits only transfer after payment verification
- ✅ Both parties can track escrow status

### **3. Notification System**
- ✅ Buyer gets: "Purchase Initiated", "Transaction Completed"
- ✅ Seller gets: "New Purchase Order", "Sale Completed"
- ✅ All notifications stored in database

### **4. Listing Management**
- ✅ Listing quantity decreases after purchase
- ✅ Listing deactivates when fully sold
- ✅ Quantity restored if transaction cancelled

### **5. Transaction Tracking**
- ✅ Full transaction history for both buyers and sellers
- ✅ Filter by status, role, date range
- ✅ Detailed transaction view with payment info

---

## 🚀 For VC Pitch - Key Talking Points

### **"How do payments work?"**
> "We've built a complete payment flow with escrow protection. For the MVP, we're using a simulated payment system that demonstrates the full functionality. When ready for production, we'll integrate with Razorpay or Stripe - the architecture is already in place, just swap the simulation endpoint with the real gateway."

### **"How do you ensure trust?"**
> "Every transaction goes through an escrow system. Payment is held until credits are verified and transferred. Both parties receive real-time notifications at every step. The entire flow is transparent and trackable."

### **"Can you demonstrate a purchase?"**
> "Absolutely! [Show the demo flow above] Notice how credits are locked during payment, then transferred after verification. The seller's listing updates automatically, and both parties get notifications. This same flow works with real payment gateways - we just simulate it for demo purposes."

---

## 📝 Current Limitations (For Demo)

1. **No Real Money**: All payments are simulated
2. **No Gateway Integration**: Uses fake order/payment IDs
3. **No Signature Verification**: Payment verification is simulated
4. **No Webhooks**: No external callbacks for payment updates

**These are intentional for MVP and can be easily replaced with real gateway integration.**

---

## 🔄 Future Integration Plan

### **Phase 1: Gateway Selection**
- Choose Razorpay (India) or Stripe (International)
- Set up gateway account and test mode

### **Phase 2: Integration**
- Replace `/simulate-complete` with gateway order creation
- Implement gateway callback/webhook handlers
- Add signature verification for security

### **Phase 3: Production**
- Switch to live gateway credentials
- Add payment method selection (card, UPI, netbanking)
- Implement retry logic for failed payments

**Estimated Integration Time: 1-2 weeks**

---

## 🎬 Quick Demo Script (2 minutes)

1. **"Let me show you how a buyer purchases carbon credits"**
   - [Login as buyer]
   - [Browse marketplace, click Buy Now]
   - "Transaction is created, credits are locked"

2. **"Now the buyer completes payment"**
   - [Go to transactions, click Complete Payment]
   - "Credits are instantly transferred to buyer's account"
   - [Show portfolio with updated balance]

3. **"The seller is automatically notified"**
   - [Login as seller]
   - [Show transaction and updated portfolio]

4. **"The entire flow is tracked and transparent"**
   - [Show transaction details with all timestamps]
   - [Show notifications for both parties]

**Total time: ~2 minutes for full demo**

---

## ✅ Conclusion

The current simulated payment system is **perfect for MVP/demo purposes**. It demonstrates:
- ✅ Complete transaction flow
- ✅ Credit transfer mechanics
- ✅ Escrow protection
- ✅ Notification system
- ✅ Real-time updates

**For production, simply replace the simulation endpoints with real gateway integration - the architecture is ready!**
