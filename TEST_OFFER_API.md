# 🧪 Offer APIs - Testing Guide

## ✅ What Was Built

All Offer API endpoints are now complete:

### Professional Endpoints
- ✅ `POST /api/offers` - Create offer (send to client)
- ✅ `GET /api/offers` - List own offers
- ✅ `GET /api/offers/[id]` - View offer details
- ✅ `PUT /api/offers/[id]` - Update pending offer
- ✅ `DELETE /api/offers/[id]` - Withdraw offer
- ✅ `POST /api/professionals/services` - Add service
- ✅ `GET /api/professionals/services` - List services
- ✅ `PUT /api/professionals/services/[id]` - Update service
- ✅ `DELETE /api/professionals/services/[id]` - Delete service

### Client Endpoints
- ✅ `POST /api/offers/[id]/accept` - Accept offer (creates job)
- ✅ `POST /api/offers/[id]/click` - Record click (charges professional)
- ✅ `GET /api/offers` - List offers on own requests

**Total: 12 endpoints, ~1000 lines of code**

---

## 🔧 Features Implemented

### For Professionals
✅ Send offers to requests
✅ 10-offer limit per request (enforced)
✅ Update pending offers
✅ Withdraw pending offers
✅ View offer status
✅ Manage services (CRUD)
✅ Auto-update profile completion

### For Clients
✅ View all offers on requests
✅ Accept offers (creates job)
✅ Click tracking (charges pro)
✅ Phone number reveal on acceptance
✅ Auto-reject other offers on acceptance
✅ Auto-close request on acceptance

### Business Logic
✅ 10-offer limit per request (atomic)
✅ Idempotent click billing
✅ Status management (PENDING, ACCEPTED, REJECTED, WITHDRAWN)
✅ Terms acceptance required
✅ No duplicate offers per professional
✅ Only update/withdraw PENDING offers
✅ Contact info revealed on acceptance

---

## 📋 Offer Status Flow

```
PENDING → Professional sends offer
   ↓
   [Client decides]
   ↓
   ├─→ ACCEPTED → Job created, phones revealed
   ├─→ REJECTED → Client chose another professional
   └─→ WITHDRAWN → Professional withdrew offer
```

---

## 🧪 Testing the APIs

### Prerequisites
```bash
# Make sure:
# 1. Request APIs are working
# 2. Professional has services added
# 3. Professional has accepted terms
# 4. Client has created a request
```

---

## 1️⃣ Professional Tests

### Add a Service First

```bash
curl -X POST http://localhost:3000/api/professionals/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PRO_TOKEN" \
  -d '{
    "subcategoryId": "YOUR_SUBCATEGORY_ID",
    "priceHourly": 4500,
    "description": "Expert math tutoring for high school students"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "svc_xxxxx",
      "category": "Education & Tutoring",
      "subcategory": "Math Tutoring",
      "priceHourly": 4500,
      "description": "Expert math tutoring..."
    },
    "profileCompletion": 85
  },
  "message": "Service added successfully"
}
```

---

### Send an Offer

```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PRO_TOKEN" \
  -d '{
    "requestId": "req_xxxxx",
    "message": "Hi! I have 5 years of experience teaching algebra to high school students. I can help your daughter master quadratic equations with personalized lessons tailored to her learning style. I am available Tuesday and Thursday evenings as you requested.",
    "proposedPrice": 4000,
    "estimatedDuration": "6 weeks",
    "availableSlots": "Tuesday 6-8 PM, Thursday 6-8 PM"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "offer": {
      "id": "offer_xxxxx",
      "message": "Hi! I have 5 years...",
      "proposedPrice": 4000,
      "status": "PENDING",
      "request": {
        "id": "req_xxxxx",
        "title": "Math tutor needed",
        "category": "Education & Tutoring",
        "subcategory": "Math Tutoring"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Offer sent successfully"
}
```

---

### List Own Offers

```bash
# All offers
curl http://localhost:3000/api/offers \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"

# Filter by status
curl "http://localhost:3000/api/offers?status=PENDING" \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"

# Filter by request
curl "http://localhost:3000/api/offers?requestId=req_xxxxx" \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "id": "offer_xxxxx",
        "message": "Hi! I have 5 years...",
        "proposedPrice": 4000,
        "status": "PENDING",
        "request": {
          "id": "req_xxxxx",
          "title": "Math tutor needed",
          "status": "OPEN",
          "budget": 4500,
          "client": {
            "city": "Vienna"
          }
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3
  }
}
```

---

### View Offer Details

```bash
curl http://localhost:3000/api/offers/offer_xxxxx \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"
```

---

### Update Offer (Pending Only)

```bash
curl -X PUT http://localhost:3000/api/offers/offer_xxxxx \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PRO_TOKEN" \
  -d '{
    "proposedPrice": 3800,
    "message": "Updated: I can offer a discount if we start this week!"
  }'
```

---

### Withdraw Offer

```bash
curl -X DELETE http://localhost:3000/api/offers/offer_xxxxx \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Offer withdrawn successfully"
  },
  "message": "Offer withdrawn successfully"
}
```

---

### List Services

```bash
curl http://localhost:3000/api/professionals/services \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"
```

---

### Update Service

```bash
curl -X PUT http://localhost:3000/api/professionals/services/svc_xxxxx \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PRO_TOKEN" \
  -d '{
    "priceHourly": 5000,
    "description": "Updated description"
  }'
```

---

### Delete Service

```bash
curl -X DELETE http://localhost:3000/api/professionals/services/svc_xxxxx \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"
```

---

## 2️⃣ Client Tests

### Record Click (Charges Professional)

```bash
curl -X POST http://localhost:3000/api/offers/offer_xxxxx/click \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "click": {
      "id": "click_xxxxx",
      "feeCents": 10,
      "feeEuros": 0.10,
      "clickType": "OFFER_VIEW",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "professional": {
      "newBalance": 2390
    },
    "message": "Click recorded. Professional has been charged €0.10"
  },
  "message": "Click recorded successfully"
}
```

**Note:** Clicking again will fail (idempotent):
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Click already recorded for this offer and client"
  }
}
```

---

### Accept Offer (Creates Job)

```bash
curl -X POST http://localhost:3000/api/offers/offer_xxxxx/accept \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "offer": {
      "id": "offer_xxxxx",
      "status": "ACCEPTED"
    },
    "job": {
      "id": "job_xxxxx",
      "status": "PENDING",
      "agreedPrice": 4000
    },
    "contactInfo": {
      "professional": {
        "firstName": "Alex",
        "lastName": "Mayer",
        "email": "alex@example.com",
        "phoneNumber": "+43123456789"
      },
      "client": {
        "firstName": "Sofia",
        "lastName": "Schmidt",
        "email": "sofia@example.com",
        "phoneNumber": "+43987654321"
      }
    },
    "message": "Offer accepted successfully! Contact information has been exchanged."
  },
  "message": "Offer accepted successfully"
}
```

**What happens:**
1. ✅ Offer status → ACCEPTED
2. ✅ Request status → CLOSED
3. ✅ Other pending offers → REJECTED
4. ✅ Job created with status PENDING
5. ✅ Phone numbers revealed to both parties

---

### View Offers (Client)

```bash
# All offers on my requests
curl http://localhost:3000/api/offers \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"

# Offers on specific request
curl "http://localhost:3000/api/offers?requestId=req_xxxxx" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "id": "offer_xxxxx",
        "message": "Hi! I have 5 years...",
        "proposedPrice": 4000,
        "status": "PENDING",
        "professional": {
          "id": "pro_xxxxx",
          "title": "Math & Physics Tutor",
          "bio": "...",
          "yearsOfExperience": 5,
          "hourlyRate": 4500,
          "user": {
            "firstName": "Alex",
            "lastName": "Mayer",
            "city": "Vienna",
            "profilePhotoUrl": "..."
          },
          "services": [...]
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 🎯 Business Rules Enforced

### Offer Creation
✅ Professional must have services
✅ Professional must accept terms
✅ Request must be OPEN
✅ Max 10 offers per request (atomic)
✅ No duplicate offers (one per professional per request)
✅ Message: 50-1000 characters

### Offer Updates
✅ Can only update PENDING offers
✅ Can only update own offers
✅ Request must still be OPEN

### Offer Withdrawal
✅ Can only withdraw PENDING offers
✅ Can only withdraw own offers

### Offer Acceptance
✅ Only request owner can accept
✅ Only PENDING offers can be accepted
✅ Request must be OPEN
✅ Auto-reject other offers
✅ Auto-close request
✅ Create job
✅ Reveal phone numbers

### Click Billing
✅ Only request owner can trigger click
✅ Idempotent (one charge per offer per client)
✅ Charges €0.10
✅ Daily limit enforcement (100 clicks)
✅ Minimum balance check (€2.00)

---

## 🔍 10-Offer Limit

The system enforces a maximum of 10 offers per request:

```typescript
// Enforced atomically in transaction
if (offerCount >= 10) {
  throw new LimitExceededError(
    'This request has reached the maximum of 10 offers'
  );
}
```

**Why?** Prevents request spam and keeps quality high.

---

## 💰 Click Billing Flow

```
1. Client views offer
   ↓
2. POST /api/offers/[id]/click
   ↓
3. Check: Already clicked? → Reject
   ↓
4. Check: Daily limit? → Reject
   ↓
5. Check: Minimum balance? → Reject
   ↓
6. Debit €0.10 from professional wallet
   ↓
7. Record click event
   ↓
8. Return success
```

---

## 🎊 Acceptance Flow

```
1. Client accepts offer
   ↓
2. POST /api/offers/[id]/accept
   ↓
3. Transaction starts:
   ├─→ Update offer → ACCEPTED
   ├─→ Reject other offers → REJECTED
   ├─→ Close request → CLOSED
   └─→ Create job → PENDING
   ↓
4. Reveal phone numbers
   ↓
5. Return contact info
```

---

## ⚠️ Error Cases

### 10-Offer Limit Reached
```json
{
  "success": false,
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "This request has reached the maximum of 10 offers"
  }
}
```

### Already Sent Offer
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "You have already sent an offer for this request"
  }
}
```

### Terms Not Accepted
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You must accept terms and conditions before sending offers"
  }
}
```

### Insufficient Balance (Click)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Wallet balance below minimum requirement of €2.00"
  }
}
```

### Request Closed
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "This request is no longer accepting offers"
  }
}
```

---

## 📊 Complete Marketplace Flow

```
┌──────────────────────────────────────────┐
│  CLIENT CREATES REQUEST                  │
│  POST /api/requests                      │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  PROFESSIONAL SEES MATCHING REQUESTS     │
│  GET /api/professionals/matching-requests│
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  PROFESSIONAL SENDS OFFER                │
│  POST /api/offers                        │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  CLIENT VIEWS OFFERS                     │
│  GET /api/requests/[id]/offers           │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  CLIENT CLICKS OFFER (€0.10 charged)     │
│  POST /api/offers/[id]/click             │
└────────────┬─────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  CLIENT ACCEPTS OFFER                    │
│  POST /api/offers/[id]/accept            │
│  • Job created                           │
│  • Phones revealed                       │
│  • Other offers rejected                 │
└──────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

**Professional:**
- [ ] Add service
- [ ] View matching requests
- [ ] Send offer
- [ ] View own offers
- [ ] Update pending offer
- [ ] Withdraw offer
- [ ] Try to exceed 10-offer limit
- [ ] Try to send duplicate offer
- [ ] Update/delete services

**Client:**
- [ ] View offers on request
- [ ] Click on offer (charge professional)
- [ ] Try to click same offer twice (should fail)
- [ ] Accept offer
- [ ] Verify other offers rejected
- [ ] Verify request closed
- [ ] Verify phone numbers revealed
- [ ] Verify job created

**Edge Cases:**
- [ ] Try to update accepted offer (should fail)
- [ ] Try to accept withdrawn offer (should fail)
- [ ] Try to send offer without services (should fail)
- [ ] Try to send offer without terms (should fail)

---

**Offer APIs Complete! 🎉**

**Next Steps:**
1. Test the complete flow
2. Build Wallet APIs (balance, deposits)
3. Build Job APIs (complete, review)
4. Build Review APIs

**Want me to build Wallet APIs next?** 💰
