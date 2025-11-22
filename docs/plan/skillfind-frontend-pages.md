# Frontend Pages & Components

## Overview

This document specifies all pages, routes, and key components for SkillFind.pro.

---

## Route Structure

```
app/
├── page.tsx                          // Landing page (public)
├── (auth)/
│   ├── sign-in/[[...sign-in]]/
│   │   └── page.tsx                  // Clerk sign-in
│   └── sign-up/[[...sign-up]]/
│       └── page.tsx                  // Clerk sign-up with role selection
├── professionals/
│   ├── page.tsx                      // Search professionals (public)
│   └── [id]/
│       └── page.tsx                  // Public pro profile
├── categories/
│   └── [slug]/
│       └── page.tsx                  // Category browse page
├── dashboard/
│   ├── client/
│   │   ├── page.tsx                  // Client dashboard
│   │   ├── requests/
│   │   │   ├── page.tsx              // List requests
│   │   │   ├── new/
│   │   │   │   └── page.tsx          // Create request
│   │   │   └── [id]/
│   │   │       └── page.tsx          // Request detail + offers
│   │   └── jobs/
│   │       └── [id]/
│   │           └── page.tsx          // Job detail + review form
│   ├── pro/
│   │   ├── page.tsx                  // Pro dashboard
│   │   ├── profile/
│   │   │   └── page.tsx              // Edit profile
│   │   ├── requests/
│   │   │   └── page.tsx              // Matching requests
│   │   ├── offers/
│   │   │   └── page.tsx              // My offers
│   │   └── wallet/
│   │       └── page.tsx              // Wallet + transactions
│   └── admin/
│       ├── page.tsx                  // Admin dashboard
│       ├── users/
│       │   └── page.tsx              // User management
│       ├── moderation/
│       │   └── page.tsx              // Moderation queue
│       └── stats/
│           └── page.tsx              // Platform stats
└── api/                              // API routes (see 03-api-endpoints.md)
```

---

## Public Pages

### Landing Page (`/`)

**Purpose**: Marketing page, explain platform, show categories

**Key Sections**:
1. Hero with search bar
2. How it works (3 steps for clients, 3 steps for pros)
3. Category grid (6 main categories)
4. CTA buttons (Sign up as Client / Sign up as Pro)

**Components Needed**:
- `<HeroSection>` - Search bar + headline
- `<CategoryGrid>` - 6 category cards with icons
- `<HowItWorks>` - Step-by-step explainer
- `<CTASection>` - Sign-up buttons

**API Calls**:
- `GET /api/categories` (to show category list)

**States**:
- Loading: Skeleton for category cards
- Empty: N/A (categories seeded)
- Error: Show generic categories if API fails

---

### Sign Up (`/sign-up`)

**Purpose**: User registration with role selection

**Flow**:
1. Clerk sign-up component (email + password)
2. After Clerk creates user, show role selection modal:
   ```
   ┌─────────────────────────────┐
   │ Complete Your Registration  │
   ├─────────────────────────────┤
   │ I am a:                     │
   │ ○ Client (looking for help) │
   │ ○ Professional (offering services) │
   │                             │
   │ [x] I confirm I am 18+      │
   │                             │
   │ [Continue]                  │
   └─────────────────────────────┘
   ```
3. Call `POST /api/auth/complete-signup` with role
4. Redirect based on role:
   - Client → `/dashboard/client`
   - Pro → `/dashboard/pro/profile` (complete profile)

**Validation**:
- Must check 18+ checkbox
- Must select a role

---

### Professional Search (`/professionals`)

**Purpose**: Browse and filter professionals

**Layout**:
```
┌────────────────────────────────────────────┐
│ [Search input]                             │
│ Filters: Category [▼] Location [▼] Remote │
└────────────────────────────────────────────┘
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Pro Card     │ │ Pro Card     │ │ Pro Card     │
│ ★★★★☆ 4.5   │ │ ★★★★★ 5.0   │ │ ★★★☆☆ 3.8   │
│ 23 reviews   │ │ 45 reviews   │ │ 12 reviews   │
│ €50/hour     │ │ €75/hour     │ │ €40/hour     │
│ Paris        │ │ Remote       │ │ Lyon         │
│ [View Profile]│ │ [View Profile]│ │ [View Profile]│
└──────────────┘ └──────────────┘ └──────────────┘
```

**Components**:
- `<SearchBar>` - Text input with search icon
- `<FilterBar>` - Category, location, remote checkboxes
- `<ProfessionalCard>` - Photo, name, rating, price, location, CTA
- `<Pagination>` - Page numbers

**API Calls**:
- `GET /api/professionals/search?category=&location=&page=`

**States**:
- Loading: Skeleton cards
- Empty: "No professionals found. Try adjusting filters."
- Error: Toast notification

---

### Public Professional Profile (`/professionals/[id]`)

**Purpose**: View professional's full profile (without payment)

**Layout**:
```
┌────────────────────────────────────────────┐
│ [Photo]  John Doe                   ✅ Verified
│          ★★★★☆ 4.5 (23 reviews)
│          📍 Paris, France
│          🌐 Available remotely
│
│ About Me:
│ [Bio text...]
│
│ Services Offered:
│ • Website development - €50/hour
│ • Bug fixing - €40/hour
│
│ Recent Reviews (5):
│ [Review cards...]
│
│ [Contact] button (only if logged in as client)
└────────────────────────────────────────────┘
```

**Components**:
- `<ProfileHeader>` - Photo, name, rating, badges
- `<ServicesList>` - Services with prices
- `<ReviewList>` - Recent reviews with ratings
- `<ContactButton>` - Only for logged-in clients

**API Calls**:
- `GET /api/professionals/[id]`

**States**:
- Loading: Skeleton layout
- Error 404: "Professional not found"
- Inactive: "This professional is currently unavailable"

---

## Client Dashboard Pages

### Client Dashboard (`/dashboard/client`)

**Purpose**: Overview of client's activity

**Layout**:
```
┌────────────────────────────────────────────┐
│ Welcome back, [Name]!                      │
├────────────────────────────────────────────┤
│ Your Requests:                             │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Need help with React bug              │  │
│ │ Status: Open • 3 offers received      │  │
│ │ [View Offers]                         │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │ Python tutoring needed                │  │
│ │ Status: Closed • Job in progress      │  │
│ │ [View Job]                            │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ [+ Create New Request]                     │
└────────────────────────────────────────────┘
```

**Components**:
- `<RequestCard>` - Title, status, offer count, CTA
- `<EmptyState>` - "No requests yet. Create your first request!"

**API Calls**:
- `GET /api/client/requests`

---

### Create Request (`/dashboard/client/requests/new`)

**Purpose**: Post a new service request

**Form Fields**:
1. Category (dropdown) - Required
2. Subcategory (dropdown, filtered by category) - Required
3. Title (text input, 10-100 chars) - Required
4. Description (textarea, min 20 chars) - Required
5. Budget (number input) - Optional
6. Location (text input or "Online") - Optional
7. Remote OK (checkbox) - Optional
8. Preferred days (text input) - Optional

**Layout**:
```
┌────────────────────────────────────────────┐
│ Create a Service Request                   │
├────────────────────────────────────────────┤
│ Category: [Dropdown ▼]                     │
│ Subcategory: [Dropdown ▼]                  │
│                                            │
│ Title: [____________________________]      │
│                                            │
│ Description:                               │
│ [________________________________]         │
│ [________________________________]         │
│ [________________________________]         │
│                                            │
│ Budget (optional): € [_____]               │
│ Location: [____________________________]   │
│ [x] I'm open to remote services            │
│                                            │
│ Preferred timing (optional):               │
│ [____________________________]             │
│                                            │
│ [Cancel] [Submit Request]                  │
└────────────────────────────────────────────┘
```

**Validation**:
- Client-side: Field lengths, required fields
- Server-side: API validates and returns errors

**API Calls**:
- `GET /api/categories` (for dropdowns)
- `POST /api/client/requests` (on submit)

**On Success**:
- Show success toast
- Redirect to `/dashboard/client/requests/[id]`

---

### Request Detail (`/dashboard/client/requests/[id]`)

**Purpose**: View request and received offers

**Layout**:
```
┌────────────────────────────────────────────┐
│ Your Request: "Need help with React bug"   │
├────────────────────────────────────────────┤
│ Status: Open                               │
│ Posted: 2 hours ago                        │
│ Budget: €50                                │
│ Location: Paris or remote                  │
│                                            │
│ Description:                               │
│ [Full description text...]                 │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│ Offers Received (3):                       │
│                                            │
│ ┌────────────────────────────────────┐    │
│ │ Sarah M. • ★★★★★ 5.0 • Paris        │    │
│ │ Price: €45 • Available: Mon-Fri      │    │
│ │ "I can fix your React bug quickly..."│    │
│ │ [View Full Profile] €0.10           │    │
│ └────────────────────────────────────┘    │
│                                            │
│ ┌────────────────────────────────────┐    │
│ │ John D. • ★★★★☆ 4.2 • Remote        │    │
│ │ Price: €50 • Available: Weekends     │    │
│ │ "Expert in React debugging..."       │    │
│ │ [View Full Profile] €0.10           │    │
│ └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

**Components**:
- `<RequestInfo>` - Request details
- `<OfferCard>` - Pro preview, price, message, CTA
- `<ViewProfileModal>` - Full pro profile (opens on click, charges €0.10)

**API Calls**:
- `GET /api/client/requests/[id]`
- `POST /api/client/requests/[id]/offers/[offerId]/view-profile` (when clicking "View Full Profile")

**View Profile Flow**:
1. Client clicks "View Full Profile"
2. Call API (charges €0.10 to pro)
3. Show modal with full professional profile
4. "Accept Offer" button in modal
5. On accept: Call API, show phone numbers

---

### Job Detail (`/dashboard/client/jobs/[id]`)

**Purpose**: Track job progress and leave review

**Layout (Job in progress)**:
```
┌────────────────────────────────────────────┐
│ Job: "React bug fixing"                    │
├────────────────────────────────────────────┤
│ Status: Accepted                           │
│ Professional: Sarah M.                     │
│ Price: €45                                 │
│                                            │
│ Contact Details:                           │
│ Your phone: +33 6 12 34 56 78              │
│ Pro's phone: +33 6 98 76 54 32             │
│                                            │
│ Please contact the professional to         │
│ finalize the details.                      │
│                                            │
│ [Mark as Completed]                        │
└────────────────────────────────────────────┘
```

**Layout (After completion)**:
```
┌────────────────────────────────────────────┐
│ Job Completed! ✅                          │
├────────────────────────────────────────────┤
│ Leave a Review for Sarah M.                │
│                                            │
│ Rating: ★ ★ ★ ★ ★ (click to rate)          │
│                                            │
│ Title (optional):                          │
│ [____________________________]             │
│                                            │
│ Your review (min 30 chars):                │
│ [________________________________]         │
│ [________________________________]         │
│                                            │
│ Tags (optional):                           │
│ [x] On time  [x] Professional              │
│ [ ] Great communication  [ ] Affordable    │
│                                            │
│ [ ] I would recommend this professional    │
│                                            │
│ [Submit Review]                            │
└────────────────────────────────────────────┘
```

**API Calls**:
- `GET /api/client/jobs/[id]`
- `POST /api/client/jobs/[id]/complete`
- `POST /api/client/reviews`

---

## Professional Dashboard Pages

### Pro Dashboard (`/dashboard/pro`)

**Purpose**: Overview of professional activity

**Layout**:
```
┌────────────────────────────────────────────┐
│ Welcome back, [Name]!                      │
│                                            │
│ Profile Completion: 71% ━━━━━━━━━░░░░░    │
│ ⚠️ Complete your profile to start receiving requests
│                                            │
│ [Complete Profile]                         │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│ Wallet: €12.50                             │
│ [Top Up]                                   │
│                                            │
│ Quick Stats:                               │
│ • 5 offers sent (3 pending)                │
│ • 2 jobs completed                         │
│ • Rating: ★★★★☆ 4.5 (12 reviews)          │
│                                            │
│ Matching Requests: 8 new                   │
│ [View All]                                 │
└────────────────────────────────────────────┘
```

**Components**:
- `<ProfileCompletionBar>` - Progress bar + missing items
- `<WalletCard>` - Balance + top-up button
- `<QuickStats>` - Key metrics
- `<AlertBanner>` - Low wallet warning

**API Calls**:
- `GET /api/pro/profile`
- `GET /api/pro/wallet`
- `GET /api/pro/matching-requests?limit=1` (just for count)

**Alerts**:
- If `profileCompletionPercent < 100`: "Complete your profile to go live"
- If `wallet.balanceCents < 200`: "Your wallet is low. Top up to stay visible."

---

### Edit Profile (`/dashboard/pro/profile`)

**Purpose**: Complete and edit professional profile

**Layout**:
```
┌────────────────────────────────────────────┐
│ Your Professional Profile                  │
│ Completion: 71% ━━━━━━━━━░░░░░░           │
├────────────────────────────────────────────┤
│ Profile Photo:                             │
│ [Upload Photo] ✅ Completed                │
│                                            │
│ Bio (min 50 characters):                   │
│ [________________________________] ✅      │
│ [________________________________]         │
│                                            │
│ Location: [____________________________]   │
│ [x] I'm available for remote work          │
│                                            │
│ Services Offered:                          │
│ • Website development - €50/hr [Edit] [x]  │
│ • Bug fixing - €40/hr [Edit] [x]           │
│ [+ Add Service]                            │
│                                            │
│ Verification:                              │
│ ✅ Email verified                          │
│ ❌ ID verification: [Upload ID Document]   │
│ ✅ Terms accepted                          │
│                                            │
│ Wallet:                                    │
│ ❌ Not connected [Connect Wallet]          │
│                                            │
│ [Save Changes]                             │
└────────────────────────────────────────────┘
```

**Components**:
- `<ProfileCompletionChecklist>` - Checkboxes for each required item
- `<FileUpload>` - Drag-drop for photo and documents
- `<ServiceManager>` - Add/edit/delete services

**API Calls**:
- `GET /api/pro/profile`
- `PUT /api/pro/profile`
- `POST /api/pro/services`
- `DELETE /api/pro/services/[id]`
- `POST /api/pro/documents/upload`

**File Upload Flow**:
1. User selects file
2. Upload to Supabase Storage (client-side)
3. Get file URL
4. Call API with URL

---

### Matching Requests (`/dashboard/pro/requests`)

**Purpose**: Browse service requests matching pro's skills

**Layout**:
```
┌────────────────────────────────────────────┐
│ Matching Requests (23)                     │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ Need help with React bug                │ │
│ │ Software & Tech > Bug fixing            │ │
│ │ 📍 Paris or remote • 💰 €50 budget      │ │
│ │ Posted 2 hours ago • 3/10 offers        │ │
│ │                                         │ │
│ │ "My React app has a strange rendering  │ │
│ │  issue..."                              │ │
│ │                                         │ │
│ │ [Send Offer]                            │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Python automation script needed         │ │
│ │ Software & Tech > Automation            │ │
│ │ 🌐 Remote only • Budget not specified   │ │
│ │ Posted 5 hours ago • 1/10 offers        │ │
│ │                                         │ │
│ │ [Send Offer]                            │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**Components**:
- `<RequestCard>` - Request preview with CTA
- `<SendOfferModal>` - Form to send offer (opens on click)

**Send Offer Modal**:
```
┌────────────────────────────────────┐
│ Send Offer                         │
├────────────────────────────────────┤
│ Price: € [_____]                   │
│                                    │
│ Your message (min 20 chars):       │
│ [__________________________]       │
│ [__________________________]       │
│                                    │
│ Available times (optional):        │
│ [__________________________]       │
│                                    │
│ [Cancel] [Send Offer]              │
└────────────────────────────────────┘
```

**API Calls**:
- `GET /api/pro/matching-requests`
- `POST /api/pro/offers` (when sending offer)

**States**:
- Loading: Skeleton cards
- Empty: "No matching requests right now. Add more services to your profile to see more."
- "Already Offered": Button disabled, show "Offer sent"
- "Full (10/10)": Button disabled, show "Full"

---

### My Offers (`/dashboard/pro/offers`)

**Purpose**: Track sent offers and their status

**Layout**:
```
┌────────────────────────────────────────────┐
│ My Offers (12)                             │
│ Filter: [All ▼] [Pending ▼] [Accepted ▼]  │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ ⏳ PENDING                              │ │
│ │ React bug fixing                        │ │
│ │ Offered: €45 • 2 hours ago              │ │
│ │ Client viewed your profile: Yes (€0.10) │ │
│ │ [View Request]                          │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ ✅ ACCEPTED                             │ │
│ │ Python tutoring                         │ │
│ │ Offered: €50 • 1 day ago                │ │
│ │ Contact: +33 6 12 34 56 78              │ │
│ │ [Mark Job Complete]                     │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**API Calls**:
- `GET /api/pro/offers?status=`

**Offer Statuses**:
- **PENDING**: Waiting for client decision (default)
- **ACCEPTED**: Client accepted, job in progress
- **REJECTED**: Client chose another pro

---

### Wallet (`/dashboard/pro/wallet`)

**Purpose**: Manage wallet balance and view transactions

**Layout**:
```
┌────────────────────────────────────────────┐
│ Your Wallet                                │
├────────────────────────────────────────────┤
│ Current Balance: €12.50                    │
│                                            │
│ ⚠️ Minimum balance: €2.00                  │
│ Your profile is visible in search.         │
│                                            │
│ [Top Up Wallet]                            │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│ Transaction History:                       │
│                                            │
│ 2024-11-20  Top-up         +€20.00        │
│ 2024-11-20  Profile click  -€0.10         │
│ 2024-11-19  Profile click  -€0.10         │
│ 2024-11-19  Profile click  -€0.10         │
│ 2024-11-18  Top-up         +€5.00         │
│                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│ Click History (Last 10):                   │
│                                            │
│ 2024-11-20  "React bug" request  €0.10    │
│ 2024-11-19  "Python tutoring"    €0.10    │
│                                            │
│ Total spent on clicks: €2.30               │
└────────────────────────────────────────────┘
```

**Top-Up Flow**:
1. Click "Top Up Wallet"
2. Modal: "Enter amount (min €2, max €500)"
3. Call `POST /api/pro/wallet/topup`
4. Redirect to Stripe Checkout
5. After payment: Stripe webhook updates balance
6. Redirect back to wallet page with success message

**API Calls**:
- `GET /api/pro/wallet`
- `POST /api/pro/wallet/topup`
- `GET /api/pro/clicks`

---

## Admin Dashboard Pages

### Admin Dashboard (`/dashboard/admin`)

**Purpose**: Platform overview for administrators

**Layout**:
```
┌────────────────────────────────────────────┐
│ Admin Dashboard                            │
├────────────────────────────────────────────┤
│ Platform Stats:                            │
│ • Total users: 1,234                       │
│ • Active professionals: 456                │
│ • Open requests: 89                        │
│ • Total revenue: €234.50                   │
│                                            │
│ Pending Actions:                           │
│ • 5 flagged reviews awaiting moderation    │
│ • 12 ID verifications pending              │
│                                            │
│ Recent Activity:                           │
│ • John D. signed up (Professional)         │
│ • New request: "Need Python tutor"         │
│ • Sarah M. completed job                   │
└────────────────────────────────────────────┘
```

**API Calls**:
- `GET /api/admin/stats`

---

### User Management (`/dashboard/admin/users`)

**Purpose**: View and manage all users

**Layout**:
```
┌────────────────────────────────────────────┐
│ Users (1,234)                              │
│ Search: [___________] Role: [All ▼]        │
├────────────────────────────────────────────┤
│ Email               Role   Status  Actions │
│ john@example.com    PRO    Active  [View]  │
│ sarah@example.com   CLIENT Active  [View]  │
│ spam@example.com    PRO    Banned  [View]  │
└────────────────────────────────────────────┘
```

**User Detail Modal**:
```
┌────────────────────────────────────┐
│ User: john@example.com             │
├────────────────────────────────────┤
│ Role: Professional                 │
│ Joined: 2024-11-15                 │
│ Status: Active                     │
│                                    │
│ Profile Completion: 85%            │
│ Wallet Balance: €5.20              │
│                                    │
│ [Verify ID] [Suspend Account]      │
└────────────────────────────────────┘
```

**API Calls**:
- `GET /api/admin/users?role=&search=`
- `PUT /api/admin/users/[id]/verify`
- `PUT /api/admin/users/[id]/suspend`

---

### Moderation Queue (`/dashboard/admin/moderation`)

**Purpose**: Review flagged content

**Layout**:
```
┌────────────────────────────────────────────┐
│ Moderation Queue (5 pending)               │
│ Type: [All ▼] Status: [Pending ▼]         │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ REVIEW - Toxicity: 0.85                 │ │
│ │ By: john@example.com                    │ │
│ │ "This person is terrible and..."        │ │
│ │                                         │ │
│ │ [Approve] [Reject & Delete]             │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**API Calls**:
- `GET /api/admin/moderation?status=&contentType=`
- `PUT /api/admin/moderation/[id]`

---

## Shared Components

### Navigation Bar

**For Public (Not logged in)**:
```
[Logo] SkillFind    Categories   How it works    [Sign In] [Sign Up]
```

**For Client**:
```
[Logo] SkillFind    Find Pros    [Dashboard ▼]    [Avatar ▼]
```

**For Professional**:
```
[Logo] SkillFind    Find Requests    [Dashboard ▼]    [Avatar ▼]
```

**For Admin**:
```
[Logo] SkillFind    [Admin Panel ▼]    [Avatar ▼]
```

---

### Empty States

Use consistent empty state pattern:
```
┌────────────────────────────────┐
│          [Icon]                │
│                                │
│  No [items] yet                │
│  [Helpful message]             │
│                                │
│  [Primary CTA Button]          │
└────────────────────────────────┘
```

Examples:
- No requests: "You haven't posted any requests yet. Create one to find professionals!"
- No offers: "No offers yet. Make sure your profile is complete and visible."

---

### Loading States

Use skeleton loaders matching the content:
- Card lists: Skeleton cards
- Forms: Skeleton inputs
- Text: Skeleton lines

---

### Error States

Toast notifications for errors:
```
🔴 Something went wrong
[Error message here]
[Dismiss]
```

---

## Next: Implementation Steps

Proceed to `06-implementation-steps.md` for week-by-week implementation guide.