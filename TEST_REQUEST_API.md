# 🧪 Request APIs - Testing Guide

## ✅ What Was Built

All Request API endpoints are now complete:

### Client Endpoints
- ✅ `POST /api/requests` - Create service request
- ✅ `GET /api/requests` - List own requests
- ✅ `GET /api/requests/[id]` - View request details
- ✅ `PUT /api/requests/[id]` - Update request
- ✅ `DELETE /api/requests/[id]` - Cancel request
- ✅ `POST /api/requests/[id]/close` - Close request
- ✅ `GET /api/requests/[id]/offers` - View all offers for request

### Professional Endpoints
- ✅ `GET /api/professionals/matching-requests` - Find matching requests
- ✅ `GET /api/requests` - Browse open requests

**Total: 9 endpoints, ~800 lines of code**

---

## 🔧 Features Implemented

### For Clients
✅ Create requests with full validation
✅ List own requests with filters (status, category)
✅ View request details with all offers
✅ Update open requests
✅ Cancel requests (soft delete)
✅ Close requests (rejects pending offers)
✅ View all offers with professional details

### For Professionals
✅ Smart matching based on services
✅ Location-based filtering
✅ Remote availability matching
✅ Match score calculation (0-100)
✅ Hide requests where already offered
✅ Client info hidden until offer accepted

### Business Logic
✅ Category/subcategory validation
✅ Access control (ownership checks)
✅ Status management (OPEN, CLOSED, CANCELLED)
✅ Offer counting
✅ Auto-reject offers when closing
✅ Pagination support

---

## 📋 Request Status Flow

```
OPEN → Client creates request
  ↓
  → Professionals can send offers
  ↓
CLOSED → Client closes request (job done or chosen someone)
  ↓
  → All pending offers auto-rejected
  
OR

CANCELLED → Client cancels request (no longer needed)
  ↓
  → Request removed from matching
```

---

## 🧪 Testing the APIs

### Prerequisites
```bash
# Make sure server is running
npm run dev

# You need:
# 1. Clerk authentication set up
# 2. A CLIENT user account
# 3. A PROFESSIONAL user account
# 4. Categories seeded in database
```

---

## 1️⃣ Client Tests

### Create a Request

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "categoryId": "YOUR_CATEGORY_ID",
    "subcategoryId": "YOUR_SUBCATEGORY_ID",
    "title": "Math tutor needed for 10th grade algebra",
    "description": "Looking for an experienced tutor to help my daughter with algebra. She needs help understanding quadratic equations and functions. Prefer evening sessions, twice a week.",
    "budget": 4500,
    "location": "Vienna",
    "remoteOk": true,
    "preferredDays": "Weekday evenings, preferably Tuesday and Thursday"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "req_xxxxx",
      "title": "Math tutor needed for 10th grade algebra",
      "status": "OPEN",
      "category": { "id": "...", "name": "Education & Tutoring" },
      "subcategory": { "id": "...", "name": "Math Tutoring" },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Request created successfully"
}
```

---

### List Own Requests

```bash
# All requests
curl http://localhost:3000/api/requests \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"

# Filter by status
curl "http://localhost:3000/api/requests?status=OPEN" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"

# With pagination
curl "http://localhost:3000/api/requests?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_xxxxx",
        "title": "Math tutor needed",
        "status": "OPEN",
        "budget": 4500,
        "offerCount": 3,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### View Request Details

```bash
curl http://localhost:3000/api/requests/req_xxxxx \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "req_xxxxx",
      "title": "Math tutor needed",
      "description": "...",
      "status": "OPEN",
      "budget": 4500,
      "location": "Vienna",
      "remoteOk": true,
      "offers": [
        {
          "id": "offer_123",
          "message": "I'd love to help...",
          "proposedPrice": 4000,
          "status": "PENDING",
          "professional": {
            "title": "Math & Physics Tutor",
            "user": {
              "firstName": "Alex",
              "city": "Vienna"
            }
          }
        }
      ],
      "offerCount": 3
    }
  }
}
```

---

### View All Offers for a Request

```bash
curl http://localhost:3000/api/requests/req_xxxxx/offers \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "offers": [...],
    "offersByStatus": {
      "pending": [/* pending offers */],
      "accepted": [/* accepted offers */],
      "rejected": [/* rejected offers */],
      "withdrawn": [/* withdrawn offers */]
    },
    "totalCount": 5,
    "pendingCount": 3
  }
}
```

---

### Update a Request

```bash
curl -X PUT http://localhost:3000/api/requests/req_xxxxx \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "title": "Math tutor needed - URGENT",
    "budget": 5000,
    "description": "Updated: Need help before exam next week"
  }'
```

---

### Close a Request

```bash
curl -X POST http://localhost:3000/api/requests/req_xxxxx/close \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "reason": "COMPLETED",
    "feedback": "Found a great tutor, thanks!"
  }'
```

---

### Cancel a Request

```bash
curl -X DELETE http://localhost:3000/api/requests/req_xxxxx \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

---

## 2️⃣ Professional Tests

### View Matching Requests

```bash
# All matching requests (based on professional's services)
curl http://localhost:3000/api/professionals/matching-requests \
  -H "Authorization: Bearer YOUR_PROFESSIONAL_TOKEN"

# Filter by category
curl "http://localhost:3000/api/professionals/matching-requests?categoryId=cat_123" \
  -H "Authorization: Bearer YOUR_PROFESSIONAL_TOKEN"

# Remote only
curl "http://localhost:3000/api/professionals/matching-requests?remoteOnly=true" \
  -H "Authorization: Bearer YOUR_PROFESSIONAL_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_xxxxx",
        "title": "Math tutor needed",
        "description": "...",
        "budget": 4500,
        "location": "Vienna",
        "remoteOk": true,
        "matchScore": 90,
        "daysOld": 1,
        "category": { "name": "Education & Tutoring" },
        "subcategory": { "name": "Math Tutoring" },
        "client": {
          "city": "Vienna",
          "verified": true
        },
        "offerCount": 2
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

---

### View Request as Professional

```bash
curl http://localhost:3000/api/requests/req_xxxxx \
  -H "Authorization: Bearer YOUR_PROFESSIONAL_TOKEN"
```

**Expected Response (limited info):**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "req_xxxxx",
      "title": "Math tutor needed",
      "description": "...",
      "client": {
        "city": "Vienna"
        // Name hidden until offer accepted
      },
      "myOffers": [
        // Only shows offers from this professional
      ],
      "hasOffered": false
    }
  }
}
```

---

## 🔍 Match Score Algorithm

The matching system calculates a score (0-100) for each request:

- **Base Score**: 50 points
- **Exact Subcategory Match**: +30 points
- **Same Location**: +10 points
- **Remote Available**: +10 points

**Example:**
- Professional offers "Math Tutoring" in Vienna
- Request for "Math Tutoring" in Vienna, remote OK
- **Score: 100** (perfect match!)

---

## 🎯 Business Rules Enforced

### Client Side
✅ Can only create requests if CLIENT role
✅ Can only view/update/delete own requests
✅ Cannot update closed or cancelled requests
✅ Closing request auto-rejects pending offers
✅ Title: 10-100 characters
✅ Description: 20-2000 characters
✅ Budget: optional, must be positive

### Professional Side
✅ Only sees OPEN requests
✅ Smart matching by services
✅ Location-based filtering
✅ Excludes requests where already offered
✅ Client contact hidden until accepted
✅ Match score helps prioritize

### General
✅ Category/subcategory validation
✅ Subcategory must belong to category
✅ Pagination on all list endpoints
✅ Full error handling
✅ Type-safe responses

---

## ⚠️ Error Cases

### Invalid Category
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Category not found"
  }
}
```

### Wrong Role
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied"
  }
}
```

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "path": "title",
        "message": "Title must be at least 10 characters"
      }
    ]
  }
}
```

---

## 📊 What's Next?

Now that Request APIs are complete, you should build:

### Priority 1: Offer APIs ⭐
- `POST /api/offers` - Create offer
- `GET /api/offers` - List offers
- `PUT /api/offers/[id]` - Update offer
- `DELETE /api/offers/[id]` - Withdraw offer
- `POST /api/offers/[id]/accept` - Accept offer

### Priority 2: Click Billing
- `POST /api/offers/[id]/click` - Record click + charge

### Priority 3: Wallet
- `GET /api/wallet` - Get balance
- `POST /api/wallet/deposit` - Top up

---

## ✅ Testing Checklist

- [ ] Create request as client
- [ ] List own requests
- [ ] View request details
- [ ] Update request
- [ ] Close request
- [ ] Cancel request
- [ ] View offers for request
- [ ] View matching requests as professional
- [ ] Test pagination
- [ ] Test filters (status, category)
- [ ] Test access control (try accessing others' requests)
- [ ] Test validation errors

---

**Request APIs Complete! 🎉 Ready to build Offer APIs?**
