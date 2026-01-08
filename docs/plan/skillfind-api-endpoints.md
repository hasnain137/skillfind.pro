# API Endpoints Reference

## Overview

This document lists all API endpoints for SkillFind.pro, organized by user role.

**Authentication**: All endpoints except Public ones require Clerk authentication via middleware.

---

## Public Endpoints (No Auth Required)

### GET /api/categories

**Purpose**: List all categories with subcategories

**Query Params**: None

**Response**:
```typescript
{
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    subcategories: Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }>;
  }>;
}
```

**Business Rules**:
- Return categories ordered by `order` field
- Include only active subcategories

---

### GET /api/professionals/search

**Purpose**: Search for professionals

**Query Params**:
- `category?: string` - Category slug
- `subcategory?: string` - Subcategory slug
- `location?: string` - City/region
- `remote?: boolean` - Include remote pros
- `minRating?: number` - Minimum average rating
- `maxPrice?: number` - Maximum hourly rate
- `page?: number` - Pagination (default: 1)
- `limit?: number` - Results per page (default: 20)

**Response**:
```typescript
{
  professionals: Array<{
    id: string;
    bio: string;
    location: string;
    remoteAvailable: boolean;
    profilePhotoUrl: string | null;
    averageRating: number;
    totalReviews: number;
    services: Array<{
      subcategory: { name: string; slug: string };
      priceHourly: number | null;
      priceFlat: number | null;
    }>;
  }>;
  total: number;
  page: number;
  totalPages: number;
}
```

**Business Rules**:
- Only show `isActive = true` professionals
- If `subcategory` provided, filter by that subcategory
- If `location` provided, match exact location OR remoteAvailable pros
- Sort by averageRating DESC, then totalReviews DESC

---

### GET /api/professionals/[id]

**Purpose**: Get public professional profile (for clients viewing)

**Path Params**:
- `id` - Professional profile ID

**Response**:
```typescript
{
  id: string;
  bio: string;
  location: string;
  remoteAvailable: boolean;
  profilePhotoUrl: string | null;
  averageRating: number;
  totalReviews: number;
  emailVerified: boolean;
  idVerified: boolean;
  services: Array<{
    id: string;
    subcategory: { name: string; categoryName: string };
    priceHourly: number | null;
    priceFlat: number | null;
    description: string | null;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    content: string;
    tags: string[];
    wouldRecommend: boolean;
    createdAt: string;
  }>;
}
```

**Business Rules**:
- Return 404 if professional not found or not active
- `recentReviews`: Only last 5, ordered by createdAt DESC
- Don't show flagged reviews

---

## Client Endpoints (Auth Required, Role: CLIENT)

### POST /api/client/requests

**Purpose**: Create a new service request

**Request Body**:
```typescript
{
  categoryId: string;
  subcategoryId: string;
  title: string; // Max 100 chars
  description: string; // Min 20 chars
  budget?: number; // Optional, in euros
  location?: string; // City or "Online"
  remoteOk: boolean;
  preferredDays?: string; // Optional
}
```

**Response**:
```typescript
{
  request: {
    id: string;
    title: string;
    description: string;
    status: "OPEN";
    createdAt: string;
  };
}
```

**Business Rules**:
- Validate subcategory belongs to category
- Title: 10-100 characters
- Description: minimum 20 characters
- Budget: if provided, must be > 0
- Set status to OPEN by default

---

### GET /api/client/requests

**Purpose**: List client's own requests

**Query Params**:
- `status?: "OPEN" | "CLOSED" | "CANCELLED"` - Filter by status

**Response**:
```typescript
{
  requests: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    budget: number | null;
    location: string | null;
    remoteOk: boolean;
    subcategory: { name: string; category: { name: string } };
    offerCount: number;
    createdAt: string;
  }>;
}
```

**Business Rules**:
- Only return requests belonging to current client
- Include count of offers received
- Order by createdAt DESC

---

### GET /api/client/requests/[id]

**Purpose**: Get request detail with offers

**Path Params**:
- `id` - Request ID

**Response**:
```typescript
{
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: number | null;
    location: string | null;
    remoteOk: boolean;
    preferredDays: string | null;
    subcategory: { name: string; category: { name: string } };
    createdAt: string;
  };
  offers: Array<{
    id: string;
    price: number;
    message: string;
    availableSlots: string | null;
    status: string;
    createdAt: string;
    professional: {
      id: string;
      profilePhotoUrl: string | null;
      location: string;
      averageRating: number;
      totalReviews: number;
      // Limited preview info
    };
  }>;
}
```

**Business Rules**:
- Return 403 if request doesn't belong to current client
- Only show offers with status PENDING or ACCEPTED
- Order offers by createdAt DESC

---

### POST /api/client/requests/[requestId]/offers/[offerId]/view-profile

**Purpose**: View full professional profile from an offer (triggers €0.10 charge)

**Path Params**:
- `requestId` - Request ID
- `offerId` - Offer ID

**Request Body**: None

**Response**:
```typescript
{
  alreadyViewed: boolean; // True if no charge (already viewed before)
  charged: boolean; // True if €0.10 was deducted
  professional: {
    // Same as GET /api/professionals/[id] but with full details
    id: string;
    bio: string;
    location: string;
    remoteAvailable: boolean;
    profilePhotoUrl: string | null;
    averageRating: number;
    totalReviews: number;
    services: Array<{...}>;
    recentReviews: Array<{...}>;
  };
}
```

**Business Rules**:
1. Verify request belongs to current client
2. Verify offer belongs to this request
3. Check if ClickEvent already exists for (offerId, clientId)
   - If yes: Return profile, set `alreadyViewed: true`, `charged: false`
4. If not viewed before:
   - Check pro's wallet balance >= 10 cents
   - If insufficient: Return 402 error "Professional wallet insufficient"
   - If sufficient:
     - Start DB transaction
     - Deduct 10 cents from wallet
     - Insert WalletTransaction (type: CLICK_CHARGE, amountCents: -10)
     - Insert ClickEvent (offerId, clientId, proId, chargedCents: 10)
     - Commit transaction
   - Return profile with `charged: true`

---

### POST /api/client/requests/[requestId]/accept-offer

**Purpose**: Accept an offer (creates a Job)

**Path Params**:
- `requestId` - Request ID

**Request Body**:
```typescript
{
  offerId: string;
}
```

**Response**:
```typescript
{
  job: {
    id: string;
    status: "ACCEPTED";
    createdAt: string;
  };
  clientPhone: string; // Current client's phone
  proPhone: string; // Pro's phone (revealed)
}
```

**Business Rules**:
- Verify request belongs to current client
- Verify offer belongs to this request and status is PENDING
- Create Job with status ACCEPTED
- Update Offer status to ACCEPTED
- Update Request status to CLOSED
- Reject all other pending offers for this request (set status to REJECTED)
- Return phone numbers of both parties
- Send email notification to professional

---

### POST /api/client/jobs/[id]/complete

**Purpose**: Mark job as completed

**Path Params**:
- `id` - Job ID

**Request Body**: None

**Response**:
```typescript
{
  job: {
    id: string;
    status: "COMPLETED";
    completedAt: string;
  };
  message: "Job marked as completed. You can now leave a review.";
}
```

**Business Rules**:
- Verify job belongs to current client
- Update job status to COMPLETED
- Set completedAt timestamp
- Send email reminder to client to leave review

---

### POST /api/client/reviews

**Purpose**: Submit a review for a completed job

**Request Body**:
```typescript
{
  jobId: string;
  rating: number; // 1-5
  title?: string; // Optional, max 50 chars
  content: string; // Min 30 chars
  tags?: string[]; // Optional, e.g., ["on time", "professional"]
  wouldRecommend: boolean;
}
```

**Response**:
```typescript
{
  review: {
    id: string;
    rating: number;
    content: string;
    createdAt: string;
  };
}
```

**Business Rules**:
1. Verify job exists and belongs to current client
2. Verify job status is COMPLETED
3. Verify no review already exists for this job
4. Validate content length >= 30 characters
5. Run Google Perspective API moderation on content
   - If toxicity score > 0.8: Create ModerationQueue entry, flag review
6. Create review
7. Update professional's averageRating and totalReviews
   - Recalculate average from all reviews
8. Send notification to professional

---

## Professional Endpoints (Auth Required, Role: PROFESSIONAL)

### GET /api/pro/profile

**Purpose**: Get own professional profile

**Response**:
```typescript
{
  profile: {
    id: string;
    bio: string | null;
    location: string | null;
    remoteAvailable: boolean;
    profilePhotoUrl: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    idVerified: boolean;
    walletConnected: boolean;
    termsAccepted: boolean;
    profileCompletionPercent: number;
    averageRating: number;
    totalReviews: number;
    isActive: boolean;
  };
  services: Array<{
    id: string;
    subcategory: { id: string; name: string; categoryName: string };
    priceHourly: number | null;
    priceFlat: number | null;
    description: string | null;
  }>;
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: string;
    createdAt: string;
  }>;
}
```

**Business Rules**:
- Return 404 if professional profile doesn't exist for user
- Calculate profileCompletionPercent in application logic

---

### PUT /api/pro/profile

**Purpose**: Update professional profile

**Request Body**:
```typescript
{
  bio?: string;
  location?: string;
  remoteAvailable?: boolean;
  profilePhotoUrl?: string;
  termsAccepted?: boolean;
}
```

**Response**:
```typescript
{
  profile: {
    id: string;
    // Updated profile fields
    profileCompletionPercent: number;
    isActive: boolean;
  };
}
```

**Business Rules**:
- Update provided fields only
- Recalculate profileCompletionPercent after update
- Update isActive based on 100% completion
- Run Google Perspective API on bio if changed
  - If toxicity > 0.8: Flag for moderation, notify admin

---

### POST /api/pro/services

**Purpose**: Add a service to profile

**Request Body**:
```typescript
{
  subcategoryId: string;
  priceHourly?: number;
  priceFlat?: number;
  description?: string;
}
```

**Response**:
```typescript
{
  service: {
    id: string;
    subcategory: { name: string };
    priceHourly: number | null;
    priceFlat: number | null;
  };
}
```

**Business Rules**:
- Verify subcategory exists
- Must provide at least one of priceHourly or priceFlat
- Can't add same subcategory twice (unique constraint)
- Recalculate profileCompletionPercent (services count > 0)

---

### DELETE /api/pro/services/[id]

**Purpose**: Remove a service

**Path Params**:
- `id` - Service ID

**Response**:
```typescript
{
  message: "Service removed successfully";
}
```

**Business Rules**:
- Verify service belongs to current professional
- Recalculate profileCompletionPercent after deletion

---

### POST /api/pro/documents/upload

**Purpose**: Upload verification document

**Request Body**: `FormData`
- `file`: File (PDF, PNG, JPG)
- `type`: "ID_DOCUMENT" | "DIPLOMA" | "CERTIFICATE" | "PORTFOLIO_IMAGE"

**Response**:
```typescript
{
  document: {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: "PENDING";
    createdAt: string;
  };
}
```

**Business Rules**:
- Upload file to Supabase Storage
- Generate unique filename with timestamp
- Store file URL in database
- Set status to PENDING (awaits admin review)
- File size limit: 10MB
- Allowed formats: PDF, PNG, JPG

---

### GET /api/pro/matching-requests

**Purpose**: Get service requests matching pro's services

**Query Params**:
- `page?: number` - Pagination
- `limit?: number` - Results per page (default: 20)

**Response**:
```typescript
{
  requests: Array<{
    id: string;
    title: string;
    description: string;
    budget: number | null;
    location: string | null;
    remoteOk: boolean;
    preferredDays: string | null;
    subcategory: { name: string; category: { name: string } };
    offerCount: number;
    alreadyOffered: boolean; // True if pro sent offer already
    createdAt: string;
  }>;
  total: number;
}
```

**Business Rules**:
- Get pro's ProfessionalServices (list of subcategory IDs)
- Query Requests WHERE:
  - status = OPEN
  - subcategoryId IN (pro's subcategories)
  - AND (location = pro.location OR remoteOk = true OR pro.remoteAvailable = true)
  - offerCount < 10 (max 10 offers per request)
- For each request, check if pro already sent an offer
- Order by createdAt DESC (newest first)

---

### POST /api/pro/offers

**Purpose**: Send an offer to a request

**Request Body**:
```typescript
{
  requestId: string;
  price: number; // In euros
  message: string; // Custom message
  availableSlots?: string; // e.g., "Mon-Fri 9am-5pm"
}
```

**Response**:
```typescript
{
  offer: {
    id: string;
    price: number;
    message: string;
    status: "PENDING";
    createdAt: string;
  };
}
```

**Business Rules**:
- Verify request exists and status is OPEN
- Verify request matches pro's services (subcategory)
- Verify pro hasn't sent offer already (unique constraint)
- Count existing offers for this request
  - If count >= 10: Return 400 error "Maximum offers reached"
- Price must be > 0
- Message: minimum 20 characters
- Create offer with status PENDING
- Send email notification to client

---

### GET /api/pro/offers

**Purpose**: List pro's sent offers

**Query Params**:
- `status?: "PENDING" | "ACCEPTED" | "REJECTED"`

**Response**:
```typescript
{
  offers: Array<{
    id: string;
    price: number;
    message: string;
    status: string;
    createdAt: string;
    request: {
      id: string;
      title: string;
      description: string;
      client: {
        // Limited info for privacy
        location: string;
      };
    };
    clickCount: number; // How many times client viewed profile from this offer
  }>;
}
```

**Business Rules**:
- Only show offers belonging to current pro
- Include clickCount from ClickEvents
- Order by createdAt DESC

---

### GET /api/pro/wallet

**Purpose**: Get wallet balance and transaction history

**Response**:
```typescript
{
  wallet: {
    id: string;
    balanceCents: number;
    balanceEuros: number; // Calculated: balanceCents / 100
    currency: string;
    stripeCustomerId: string | null;
    lastTopupAt: string | null;
  };
  transactions: Array<{
    id: string;
    amountCents: number;
    amountEuros: number;
    type: string; // "TOPUP" | "CLICK_CHARGE" | "REFUND"
    description: string | null;
    createdAt: string;
  }>;
}
```

**Business Rules**:
- If wallet doesn't exist, create it with balance 0
- Transactions ordered by createdAt DESC
- Convert cents to euros for display

---

### POST /api/pro/wallet/topup

**Purpose**: Create Stripe Checkout session for wallet top-up

**Request Body**:
```typescript
{
  amountEuros: number; // Amount to add, e.g., 10 for €10
}
```

**Response**:
```typescript
{
  checkoutUrl: string; // Stripe Checkout URL to redirect user
  sessionId: string; // Stripe session ID for tracking
}
```

**Business Rules**:
- Minimum top-up: €2
- Maximum top-up: €500 (prevent abuse)
- Create Stripe Checkout Session:
  - mode: "payment"
  - success_url: `/dashboard/pro/wallet?success=true`
  - cancel_url: `/dashboard/pro/wallet?cancelled=true`
  - line_items: [{price_data: {currency: "eur", amount: amountEuros * 100}}]
- Store sessionId in metadata for webhook handling
- Return checkout URL for frontend to redirect

---

### GET /api/pro/clicks

**Purpose**: View click history (when clients viewed profile)

**Response**:
```typescript
{
  clicks: Array<{
    id: string;
    chargedCents: number;
    createdAt: string;
    offer: {
      id: string;
      request: {
        title: string;
      };
    };
  }>;
  totalClicks: number;
  totalSpentCents: number;
  totalSpentEuros: number;
}
```

**Business Rules**:
- Only show clicks for current pro
- Calculate totals
- Order by createdAt DESC

---

## Admin Endpoints (Auth Required, Role: ADMIN)

### GET /api/admin/users

**Purpose**: List and filter users

**Query Params**:
- `role?: "CLIENT" | "PROFESSIONAL" | "ADMIN"`
- `isActive?: boolean`
- `search?: string` - Search by email
- `page?: number`
- `limit?: number`

**Response**:
```typescript
{
  users: Array<{
    id: string;
    email: string;
    phone: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    // If PROFESSIONAL: include profile completion %
    professionalProfile?: {
      profileCompletionPercent: number;
      isActive: boolean;
    };
  }>;
  total: number;
  page: number;
  totalPages: number;
}
```

**Business Rules**:
- Apply filters if provided
- Search matches email (case-insensitive, partial match)
- Order by createdAt DESC

---

### PUT /api/admin/users/[id]/verify

**Purpose**: Manually verify a professional's ID

**Path Params**:
- `id` - User ID

**Request Body**:
```typescript
{
  idVerified: boolean;
}
```

**Response**:
```typescript
{
  user: {
    id: string;
    professionalProfile: {
      idVerified: boolean;
      profileCompletionPercent: number;
    };
  };
}
```

**Business Rules**:
- Verify user has role PROFESSIONAL
- Update idVerified flag
- Recalculate profileCompletionPercent
- Send email notification to professional

---

### PUT /api/admin/users/[id]/suspend

**Purpose**: Suspend or reactivate a user

**Path Params**:
- `id` - User ID

**Request Body**:
```typescript
{
  isActive: boolean;
  reason?: string; // Suspension reason
}
```

**Response**:
```typescript
{
  user: {
    id: string;
    isActive: boolean;
  };
}
```

**Business Rules**:
- Update isActive flag
- If suspending professional: also set professionalProfile.isActive = false
- Send email notification to user

---

### GET /api/admin/moderation

**Purpose**: Get flagged content queue

**Query Params**:
- `status?: "PENDING" | "APPROVED" | "REJECTED"`
- `contentType?: "REVIEW" | "BIO" | "REQUEST" | "OFFER"`

**Response**:
```typescript
{
  items: Array<{
    id: string;
    contentType: string;
    contentId: string;
    flaggedReason: string;
    toxicityScore: number | null;
    status: string;
    createdAt: string;
    // Include the actual content for review
    content: {
      // Different fields based on contentType
      text: string;
      author: { email: string };
    };
  }>;
}
```

**Business Rules**:
- Show pending items first
- Include content preview for admin to review
- Order by createdAt DESC

---

### PUT /api/admin/moderation/[id]

**Purpose**: Approve or reject flagged content

**Path Params**:
- `id` - ModerationQueue ID

**Request Body**:
```typescript
{
  status: "APPROVED" | "REJECTED";
  adminNotes?: string;
}
```

**Response**:
```typescript
{
  item: {
    id: string;
    status: string;
    reviewedAt: string;
  };
}
```

**Business Rules**:
- Update ModerationQueue status
- Set reviewedBy to current admin ID
- Set reviewedAt timestamp
- If REJECTED:
  - Delete the content (Review/Bio/etc)
  - Send notification to content author
- If APPROVED:
  - Keep content, clear flagged status
  - No notification needed

---

### GET /api/admin/stats

**Purpose**: Get basic platform statistics

**Response**:
```typescript
{
  stats: {
    totalUsers: number;
    totalClients: number;
    totalProfessionals: number;
    activeProfessionals: number; // isActive = true
    totalRequests: number;
    openRequests: number;
    totalOffers: number;
    totalJobs: number;
    completedJobs: number;
    totalReviews: number;
    averagePlatformRating: number;
    totalRevenueCents: number; // Sum of all CLICK_CHARGE transactions
    totalRevenueEuros: number;
  };
  recentActivity: {
    recentSignups: Array<{ email: string; role: string; createdAt: string }>;
    recentRequests: Array<{ title: string; createdAt: string }>;
    recentJobs: Array<{ status: string; createdAt: string }>;
  };
}
```

**Business Rules**:
- Calculate all stats from database
- recentActivity: last 10 items of each type
- totalRevenueCents: Sum of CLICK_CHARGE transactions

---

## Special Endpoints

### POST /api/webhooks/stripe

**Purpose**: Handle Stripe webhook events (payment confirmations)

**Headers Required**:
- `stripe-signature` - Stripe webhook signature for verification

**Handled Events**:
- `checkout.session.completed`: Wallet top-up successful

**Business Logic**:
1. Verify webhook signature using Stripe library
2. Extract sessionId and payment details
3. Find professional by stripeCustomerId
4. Add WalletTransaction (type: TOPUP, amountCents)
5. Update Wallet balance
6. Send email confirmation to professional

**Response**: `200 OK` (required for Stripe)

---

## Error Response Format

All endpoints return errors in this format:

```typescript
{
  error: {
    code: string; // e.g., "INSUFFICIENT_BALANCE"
    message: string; // User-friendly error message
    details?: any; // Optional additional info
  };
}
```

**Common HTTP Status Codes**:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (wrong role or not your resource)
- `404` - Not Found
- `402` - Payment Required (wallet insufficient)
- `500` - Internal Server Error

---

## Next: Business Logic

Proceed to `04-business-logic.md` for detailed algorithms and rules.