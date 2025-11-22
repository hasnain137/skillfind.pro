# Week-by-Week Implementation Guide

## Overview

This document breaks down the 7-week implementation into concrete, daily tasks.

**Work Schedule**: 8-12 hours/day, 7 days/week  
**Total Time**: ~350-500 hours  
**Approach**: Use Cursor AI to generate code based on these specifications

---

## Week 1: Foundation & Setup
**Dates**: Nov 25 - Dec 1  
**Goal**: Infrastructure ready, users can sign up and see role-based dashboards

### Day 1 (Monday): Project Setup

**Tasks**:
1. ✅ Create Next.js project (if not already done)
   ```bash
   npx create-next-app@latest skillfind-pro --typescript --tailwind --app
   cd skillfind-pro
   ```

2. ✅ Install dependencies
   ```bash
   npm install @clerk/nextjs
   npm install prisma @prisma/client
   npm install stripe
   npm install @supabase/supabase-js
   ```

3. ✅ Setup environment variables
   - Create `.env.local` file
   - Add Clerk keys (get from clerk.com dashboard)
   - Add Supabase URL and keys
   - Add Stripe test API key

4. ✅ Initialize Git repository
   ```bash
   git init
   git add .
   git commit -m "Initial project setup"
   ```

**Prompt for Cursor**:
```
Set up a Next.js 14 project with:
- TypeScript
- Tailwind CSS
- App Router structure
- Install @clerk/nextjs, prisma, stripe, @supabase/supabase-js
- Create .env.local with placeholder keys for Clerk, Supabase, Stripe
- Add .gitignore for node_modules, .env.local
```

---

### Day 2 (Tuesday): Database Schema

**Tasks**:
1. Create Supabase project (on supabase.com)
2. Get database connection string
3. Define Prisma schema (copy from `02-database-schema.md`)
4. Run first migration

**Prompt for Cursor**:
```
Using the Prisma schema from 02-database-schema.md:
1. Create prisma/schema.prisma file with the complete schema
2. Set up DATABASE_URL in .env.local
3. Run: npx prisma migrate dev --name init
4. Run: npx prisma generate
5. Create lib/prisma.ts for Prisma client singleton
```

**Files to Create**:
- `prisma/schema.prisma`
- `lib/prisma.ts`

**Test**: Run `npx prisma studio` and verify database structure

---

### Day 3 (Wednesday): Authentication Setup

**Tasks**:
1. Setup Clerk authentication
2. Create middleware for protected routes
3. Add sign-in/sign-up pages
4. Implement role selection on signup

**Prompt for Cursor**:
```
Implement Clerk authentication:
1. Follow Clerk Next.js quickstart
2. Create app/(auth)/sign-in/[[...sign-in]]/page.tsx
3. Create app/(auth)/sign-up/[[...sign-up]]/page.tsx
4. Create middleware.ts to protect /dashboard routes
5. After Clerk signup, show modal for role selection (CLIENT/PRO)
6. Create API route POST /api/auth/complete-signup to save role in database
7. Include 18+ age confirmation checkbox
```

**Files to Create**:
- `middleware.ts`
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `app/api/auth/complete-signup/route.ts`
- `components/RoleSelectionModal.tsx`

**Test**: Sign up, select role, verify user created in database

---

### Day 4 (Thursday): Seed Data & Basic API

**Tasks**:
1. Create seed script for categories
2. Create basic API routes structure
3. Test API authentication

**Prompt for Cursor**:
```
Create database seed script:
1. Create prisma/seed.ts
2. Add categories and subcategories from 02-database-schema.md
3. Add script to package.json: "prisma": {"seed": "ts-node prisma/seed.ts"}
4. Run: npx prisma db seed

Then create these API routes:
- GET /api/categories (public)
- GET /api/health (test route)

Use Clerk's auth() helper to verify authenticated requests.
```

**Files to Create**:
- `prisma/seed.ts`
- `app/api/categories/route.ts`
- `app/api/health/route.ts`

**Test**: 
- Run seed script
- Call GET /api/categories and verify data returned

---

### Day 5 (Friday): Dashboard Layouts

**Tasks**:
1. Create dashboard layout with navigation
2. Create skeleton pages for client/pro/admin dashboards
3. Add role-based routing

**Prompt for Cursor**:
```
Create dashboard structure:
1. app/dashboard/layout.tsx - Shared dashboard layout with nav
2. app/dashboard/client/page.tsx - Client dashboard
3. app/dashboard/pro/page.tsx - Pro dashboard  
4. app/dashboard/admin/page.tsx - Admin dashboard

Add middleware logic to redirect users to correct dashboard based on role.
Create reusable <DashboardNav> component with role-specific menu items.
```

**Files to Create**:
- `app/dashboard/layout.tsx`
- `app/dashboard/client/page.tsx`
- `app/dashboard/pro/page.tsx`
- `app/dashboard/admin/page.tsx`
- `components/DashboardNav.tsx`

**Test**: Sign in as different roles, verify correct dashboard shown

---

### Day 6-7 (Weekend): Landing Page

**Tasks**:
1. Build landing page with hero, categories, how-it-works
2. Style with Tailwind
3. Make responsive

**Prompt for Cursor**:
```
Build landing page (app/page.tsx):
1. Hero section with headline and search bar
2. Category grid (fetch from GET /api/categories)
3. How It Works section (3 steps for clients, 3 for pros)
4. CTA buttons linking to /sign-up
5. Make fully responsive (mobile, tablet, desktop)

Use modern Tailwind styling, reference existing design from screenshot.
```

**Files to Create**:
- `app/page.tsx`
- `components/HeroSection.tsx`
- `components/CategoryGrid.tsx`
- `components/HowItWorks.tsx`

**Week 1 Deliverable**: ✅ Users can sign up, log in, see role-based dashboard skeletons

---

## Week 2: Client Flow
**Dates**: Dec 2 - Dec 8  
**Goal**: Clients can create and view service requests

### Day 8 (Monday): Request Creation Form

**Tasks**:
1. Create request form page
2. Implement form validation
3. Connect to API

**Prompt for Cursor**:
```
Create client request form:
1. app/dashboard/client/requests/new/page.tsx
2. Form fields from 05-frontend-pages.md (category, subcategory, title, description, budget, location, remote, preferred days)
3. Client-side validation with react-hook-form or native HTML5
4. Submit to POST /api/client/requests
5. Show loading state while submitting
6. Redirect to request detail on success

Also create the API route POST /api/client/requests that:
- Validates input
- Creates request in database
- Returns created request
```

**Files to Create**:
- `app/dashboard/client/requests/new/page.tsx`
- `app/api/client/requests/route.ts` (POST method)

---

### Day 9 (Tuesday): Request List

**Tasks**:
1. Create request list page
2. Fetch and display client's requests
3. Add status filtering

**Prompt for Cursor**:
```
Create client request list:
1. app/dashboard/client/requests/page.tsx
2. Fetch from GET /api/client/requests
3. Display as cards with title, status, offer count, created date
4. Add filter dropdown for status (OPEN/CLOSED/CANCELLED)
5. Link each card to /dashboard/client/requests/[id]
6. Show empty state if no requests

Create API route GET /api/client/requests that:
- Gets requests belonging to current client
- Includes offer count
- Supports ?status= query parameter
```

**Files to Create**:
- `app/dashboard/client/requests/page.tsx`
- `app/api/client/requests/route.ts` (GET method)
- `components/RequestCard.tsx`

---

### Day 10 (Wednesday): Request Detail Page

**Tasks**:
1. Create request detail page
2. Show request information
3. Setup for offers (empty state for now)

**Prompt for Cursor**:
```
Create request detail page:
1. app/dashboard/client/requests/[id]/page.tsx
2. Fetch from GET /api/client/requests/[id]
3. Display full request details
4. Section for offers (show "No offers yet" for now)
5. Handle loading and error states

Create API route GET /api/client/requests/[id] that:
- Verifies request belongs to current client
- Returns request with full details
- Returns empty offers array (we'll add offers next week)
```

**Files to Create**:
- `app/dashboard/client/requests/[id]/page.tsx`
- `app/api/client/requests/[id]/route.ts`

---

### Day 11 (Thursday): Client Dashboard Overview

**Tasks**:
1. Build client dashboard with request overview
2. Show recent requests
3. Add quick stats

**Prompt for Cursor**:
```
Update client dashboard (app/dashboard/client/page.tsx):
1. Fetch recent requests from GET /api/client/requests?limit=5
2. Display as list with "View" buttons
3. Show stats: Total requests, Open requests, Jobs in progress
4. Add big "Create New Request" CTA button
5. Handle empty state for new users
```

---

### Day 12-14 (Fri-Sun): Polish & Testing

**Tasks**:
1. Add loading skeletons
2. Improve form validation feedback
3. Add success/error toasts
4. Test all client flows end-to-end
5. Fix bugs

**Prompt for Cursor**:
```
Add polish to client pages:
1. Create skeleton loaders for request cards
2. Add toast notifications using react-hot-toast or similar
3. Improve error messages (user-friendly)
4. Make forms more responsive
5. Add icons using lucide-react
```

**Week 2 Deliverable**: ✅ Clients can create and view their service requests

---

## Week 3: Professional Profile & Verification
**Dates**: Dec 9 - Dec 15  
**Goal**: Pros can create complete profiles

### Day 15 (Monday): Professional Profile Model

**Tasks**:
1. Create profile edit page
2. Build form for bio, location, services
3. Calculate completion percentage

**Prompt for Cursor**:
```
Create professional profile page:
1. app/dashboard/pro/profile/page.tsx
2. Fetch from GET /api/pro/profile
3. Editable fields: bio (textarea), location (input), remoteAvailable (checkbox)
4. Show profile completion percentage at top
5. Submit to PUT /api/pro/profile

Create API routes:
- GET /api/pro/profile - Returns pro's profile with completion %
- PUT /api/pro/profile - Updates profile fields
Use algorithm from 04-business-logic.md to calculate profileCompletionPercent
```

**Files to Create**:
- `app/dashboard/pro/profile/page.tsx`
- `app/api/pro/profile/route.ts`
- `lib/calculate-profile-completion.ts`

---

### Day 16 (Tuesday): Service Management

**Tasks**:
1. Add service selection UI
2. Create add/remove service functionality
3. Show service list on profile

**Prompt for Cursor**:
```
Add service management to profile page:
1. Section showing current services with price
2. "Add Service" button opens modal
3. Modal has: subcategory dropdown, price input (hourly or flat), description
4. Each service has [Edit] and [Delete] buttons

Create API routes:
- POST /api/pro/services - Add service
- PUT /api/pro/services/[id] - Edit service
- DELETE /api/pro/services/[id] - Remove service

After any service change, recalculate profileCompletionPercent
```

**Files to Create**:
- `components/ServiceManager.tsx`
- `components/AddServiceModal.tsx`
- `app/api/pro/services/route.ts`
- `app/api/pro/services/[id]/route.ts`

---

### Day 17 (Wednesday): File Uploads

**Tasks**:
1. Setup Supabase Storage
2. Create file upload component
3. Implement profile photo upload
4. Implement document uploads

**Prompt for Cursor**:
```
Implement file uploads:
1. Create Supabase Storage bucket "verification-documents" and "profile-photos"
2. Create upload component using Supabase client-side upload
3. On profile page, add photo upload dropzone
4. Add document upload section (ID, diploma, certificates)
5. Store file URLs in database

Create API route POST /api/pro/documents/upload:
- Receives file URL after client uploads to Supabase
- Creates VerificationDocument record with status PENDING
- Recalculates profileCompletionPercent
```

**Files to Create**:
- `components/FileUpload.tsx`
- `app/api/pro/documents/upload/route.ts`
- `lib/supabase-client.ts`

---

### Day 18 (Thursday): Verification Badges

**Tasks**:
1. Add verification checklist to profile
2. Create mock verification toggle (dev mode)
3. Display badges on profile

**Prompt for Cursor**:
```
Add verification system:
1. On profile page, show checklist:
   - Email verified (auto from Clerk)
   - ID verified (manual toggle for now)
   - Wallet connected
   - Terms accepted
2. Create admin-only toggle to mark ID as verified (for testing)
3. Display verification badges on profile preview
4. Only set isActive=true when 100% complete
```

**Files to Create**:
- `components/VerificationChecklist.tsx`
- `components/VerificationBadge.tsx`

---

### Day 19 (Friday): Pro Dashboard

**Tasks**:
1. Build professional dashboard overview
2. Show profile completion progress
3. Add wallet preview
4. Show quick stats

**Prompt for Cursor**:
```
Build pro dashboard (app/dashboard/pro/page.tsx):
1. Profile completion bar at top with missing items
2. Wallet card showing balance (fetch from GET /api/pro/wallet)
3. Quick stats: Offers sent, Jobs completed, Rating
4. Warning if wallet < €2 or profile incomplete
5. Link to "Matching Requests" (we'll build next week)
```

---

### Day 20-21 (Weekend): Testing & Polish

**Tasks**:
1. Test complete profile flow
2. Verify profile completion calculation works
3. Test file uploads
4. Fix bugs

**Week 3 Deliverable**: ✅ Pros can create profiles and see completion percentage

---

## Week 4: Matching & Offers
**Dates**: Dec 16 - Dec 22  
**Goal**: Complete request → offer → view profile flow (without payment)

### Day 22 (Monday): Matching Logic

**Tasks**:
1. Implement matching algorithm
2. Create matching requests API
3. Build matching requests page

**Prompt for Cursor**:
```
Implement matching logic:
1. Create GET /api/pro/matching-requests
2. Use algorithm from 04-business-logic.md
3. Match based on: subcategory, location, remote availability
4. Exclude requests with 10+ offers
5. Exclude requests pro already offered to
6. Return paginated results

Create app/dashboard/pro/requests/page.tsx:
- Display matching requests as cards
- Show: title, category, location, budget, offer count
- "Send Offer" button on each card
```

**Files to Create**:
- `app/api/pro/matching-requests/route.ts`
- `app/dashboard/pro/requests/page.tsx`
- `components/MatchingRequestCard.tsx`

---

### Day 23 (Tuesday): Send Offer

**Tasks**:
1. Create offer form modal
2. Implement offer submission
3. Enforce 10-offer limit

**Prompt for Cursor**:
```
Implement send offer:
1. Create modal component with form: price, message, available slots
2. Submit to POST /api/pro/offers
3. Validate: price > 0, message min 20 chars

Create POST /api/pro/offers:
- Verify request exists and is OPEN
- Check offer count < 10 (return error if full)
- Check pro hasn't offered already
- Create Offer with status PENDING
- Send email notification to client (use SendGrid or placeholder)
```

**Files to Create**:
- `components/SendOfferModal.tsx`
- `app/api/pro/offers/route.ts`

---

### Day 24 (Wednesday): View Offers (Client Side)

**Tasks**:
1. Update request detail to show offers
2. Display offer cards
3. Add "View Profile" button (no payment yet)

**Prompt for Cursor**:
```
Update request detail page:
1. Modify GET /api/client/requests/[id] to include offers
2. Display offers as cards showing:
   - Pro preview (photo, rating, location)
   - Offer price and message
   - "View Full Profile" button
3. For now, clicking "View Profile" just shows the profile (no charge)

Update app/dashboard/client/requests/[id]/page.tsx to display offers
```

**Files to Create**:
- `components/OfferCard.tsx`
- `components/ViewProfileModal.tsx`

---

### Day 25 (Thursday): Public Pro Profile

**Tasks**:
1. Create public professional profile page
2. Show services, reviews (empty for now), bio
3. Make accessible from offer cards

**Prompt for Cursor**:
```
Create public pro profile:
1. app/professionals/[id]/page.tsx
2. Fetch from GET /api/professionals/[id]
3. Display: photo, bio, location, services, rating, badges
4. Section for reviews (show "No reviews yet")
5. "Contact" button (for now just a placeholder)

Create API route GET /api/professionals/[id]:
- Returns public profile data
- Only if isActive = true
- Include services and empty reviews array
```

**Files to Create**:
- `app/professionals/[id]/page.tsx`
- `app/api/professionals/[id]/route.ts`

---

### Day 26 (Friday): Pro Offers Page

**Tasks**:
1. Create "My Offers" page for pros
2. Show sent offers with status
3. Add filtering

**Prompt for Cursor**:
```
Create pro offers page:
1. app/dashboard/pro/offers/page.tsx
2. Fetch from GET /api/pro/offers
3. Display as list grouped by status: Pending, Accepted, Rejected
4. Show request title, price, status, sent date
5. Filter dropdown for status

Create GET /api/pro/offers:
- Returns offers belonging to current pro
- Supports ?status= filter
- Includes request details
```

**Files to Create**:
- `app/dashboard/pro/offers/page.tsx`
- `app/api/pro/offers/route.ts` (GET method)

---

### Day 27-28 (Weekend): Testing

**Tasks**:
1. Test full flow: request → matching → offer → view profile
2. Verify offer limit works (max 10)
3. Verify matching logic works correctly
4. Fix bugs

**Week 4 Deliverable**: ✅ Full marketplace flow works (request → offer → view profile)

---

## Week 5: Payment System
**Dates**: Dec 23 - Dec 29  
**Goal**: Pay-per-click system fully functional

### Day 29 (Monday): Wallet Model

**Tasks**:
1. Create wallet when pro completes profile
2. Build wallet page UI
3. Show balance and transactions

**Prompt for Cursor**:
```
Implement wallet:
1. When pro first completes profile, create Wallet record with balance 0
2. Create app/dashboard/pro/wallet/page.tsx
3. Fetch from GET /api/pro/wallet
4. Display: current balance (in euros), transaction history
5. Show warning if balance < €2

Create GET /api/pro/wallet:
- Returns wallet with balanceCents converted to euros
- Returns transactions ordered by date DESC
```

**Files to Create**:
- `app/dashboard/pro/wallet/page.tsx`
- `app/api/pro/wallet/route.ts`

---

### Day 30 (Tuesday): Stripe Integration

**Tasks**:
1. Setup Stripe Checkout for wallet top-up
2. Create checkout session API
3. Handle success/cancel redirects

**Prompt for Cursor**:
```
Implement Stripe top-up:
1. Create POST /api/pro/wallet/topup
   - Receives: { amountEuros: number }
   - Validates: min €2, max €500
   - Creates Stripe Checkout Session
   - Returns: { checkoutUrl: string }
2. On wallet page, "Top Up" button opens modal for amount input
3. After submit, redirect to Stripe checkout URL
4. Success URL: /dashboard/pro/wallet?success=true
5. Cancel URL: /dashboard/pro/wallet?cancelled=true

Use Stripe test mode API key
```

**Files to Create**:
- `app/api/pro/wallet/topup/route.ts`
- `components/TopUpModal.tsx`

---

### Day 31 (Wednesday): Stripe Webhook

**Tasks**:
1. Create webhook endpoint
2. Handle successful payment
3. Update wallet balance

**Prompt for Cursor**:
```
Create Stripe webhook:
1. app/api/webhooks/stripe/route.ts
2. Verify webhook signature
3. Handle event: checkout.session.completed
4. Extract payment details (amount, customer ID)
5. Find pro by Stripe customer ID
6. Add WalletTransaction (type: TOPUP, amountCents)
7. Update Wallet balance (increment by amountCents)
8. Send email confirmation

Configure webhook endpoint in Stripe dashboard to this URL
```

**Files to Create**:
- `app/api/webhooks/stripe/route.ts`

**Setup**:
- Use Stripe CLI to forward webhooks locally during development
- Get webhook signing secret from Stripe

---

### Day 32 (Thursday): Pay-Per-Click Logic

**Tasks**:
1. Implement click tracking
2. Add €0.10 charge on profile view
3. Prevent double-charging

**Prompt for Cursor**:
```
Implement pay-per-click:
1. Update "View Full Profile" button in OfferCard
2. On click, call POST /api/client/requests/[requestId]/offers/[offerId]/view-profile
3. Use algorithm from 04-business-logic.md:
   - Check for existing ClickEvent
   - Verify wallet balance >= 10 cents
   - Start transaction: deduct balance, create transaction, create click event
   - Return profile data
4. Show "Already viewed" if ClickEvent exists (no charge)
5. Show error modal if wallet insufficient

Create the API route with full transaction logic
```

**Files to Create**:
- `app/api/client/requests/[requestId]/offers/[offerId]/view-profile/route.ts`
- `lib/charge-profile-view.ts`

---

### Day 33 (Friday): Click History

**Tasks**:
1. Create click history view for pros
2. Show which requests generated clicks
3. Add to wallet page

**Prompt for Cursor**:
```
Add click history:
1. Create GET /api/pro/clicks
2. Returns all ClickEvents for current pro
3. Include: date, request title, amount charged
4. Calculate total spent

Update wallet page to show:
- Section: "Click History"
- List last 10 clicks
- Total amount spent on clicks
```

**Files to Create**:
- `app/api/pro/clicks/route.ts`

---

### Day 34-35 (Weekend): Testing & Edge Cases

**Tasks**:
1. Test Stripe checkout end-to-end
2. Test webhook locally with Stripe CLI
3. Test pay-per-click with low wallet balance
4. Verify double-click prevention works
5. Test wallet minimum balance enforcement

**Week 5 Deliverable**: ✅ Payment system fully functional

---

## Week 6: Jobs & Reviews
**Dates**: Dec 30 - Jan 5  
**Goal**: Complete marketplace cycle with reviews

### Day 36 (Monday): Accept Offer Flow

**Tasks**:
1. Implement offer acceptance
2. Create Job record
3. Reveal phone numbers

**Prompt for Cursor**:
```
Implement accept offer:
1. Add "Accept Offer" button in ViewProfileModal
2. Call POST /api/client/requests/[requestId]/accept-offer with { offerId }
3. Use algorithm from 04-business-logic.md:
   - Create Job record
   - Update Offer status to ACCEPTED
   - Close Request
   - Reject other pending offers
4. Response includes both phone numbers
5. Show success modal with contact details

Create the API route with full transaction logic
```

**Files to Create**:
- `app/api/client/requests/[requestId]/accept-offer/route.ts`
- `components/OfferAcceptedModal.tsx`

---

### Day 37 (Tuesday): Job Pages

**Tasks**:
1. Create job detail page for clients
2. Add "Mark as Completed" button
3. Show job status

**Prompt for Cursor**:
```
Create job page:
1. app/dashboard/client/jobs/[id]/page.tsx
2. Fetch from GET /api/client/jobs/[id]
3. Show: request title, pro name, price, status, phone numbers
4. If status = ACCEPTED: show "Mark as Completed" button
5. If status = COMPLETED: show review form (next)

Create GET /api/client/jobs/[id] and POST /api/client/jobs/[id]/complete
```

**Files to Create**:
- `app/dashboard/client/jobs/[id]/page.tsx`
- `app/api/client/jobs/[id]/route.ts`

---

### Day 38 (Wednesday): Review Submission

**Tasks**:
1. Create review form
2. Implement review submission
3. Update pro rating

**Prompt for Cursor**:
```
Implement reviews:
1. After job completed, show review form on job page
2. Form fields: rating (1-5 stars), title, content (min 30 chars), tags, wouldRecommend checkbox
3. Submit to POST /api/client/reviews with { jobId, rating, content, ... }
4. Use algorithm from 04-business-logic.md:
   - Validate job is completed
   - Check no existing review
   - Run content moderation (Google Perspective API)
   - Create review
   - Update pro's averageRating and totalReviews
5. Show success message after submission

Create POST /api/client/reviews with full validation and moderation
```

**Files to Create**:
- `components/ReviewForm.tsx`
- `app/api/client/reviews/route.ts`
- `lib/moderate-content.ts`

---

### Day 39 (Thursday): Google Perspective API

**Tasks**:
1. Setup Google Perspective API
2. Implement content moderation
3. Create moderation queue

**Prompt for Cursor**:
```
Implement content moderation:
1. Get Google Perspective API key
2. Create function to check toxicity score
3. If score > 0.8: create ModerationQueue entry, flag review
4. Flagged reviews still display but marked "Under review"
5. Admin can approve/reject from moderation queue (next week)

Add moderation to:
- Review content
- Professional bios
```

**Files to Create**:
- `lib/perspective-api.ts`

---

### Day 40 (Friday): Display Reviews

**Tasks**:
1. Update pro profile to show reviews
2. Add reviews section
3. Show average rating

**Prompt for Cursor**:
```
Display reviews on pro profile:
1. Update GET /api/professionals/[id] to include reviews
2. On public pro profile page, add reviews section
3. Show: star rating, content, tags, date, "would recommend" badge
4. Show last 5 reviews by default
5. Display average rating at top of profile

Update pro's profile completion to include rating display
```

---

### Day 41-42 (Weekend): Testing

**Tasks**:
1. Test complete cycle: request → offer → accept → complete → review
2. Verify rating calculation works
3. Test moderation flags toxic content
4. Fix bugs

**Week 6 Deliverable**: ✅ Complete marketplace cycle works (request → offer → job → review)

---

## Week 7: Admin Panel & Polish
**Dates**: Jan 6 - Jan 12  
**Goal**: Admin features + final testing

### Day 43 (Monday): Admin User Management

**Tasks**:
1. Create admin dashboard
2. Build user list page
3. Add suspend/verify actions

**Prompt for Cursor**:
```
Create admin panel:
1. app/dashboard/admin/page.tsx - Overview with stats
2. app/dashboard/admin/users/page.tsx - User list
3. Fetch from GET /api/admin/users with filters
4. Display table: email, role, status, actions
5. Actions: View details, Verify ID, Suspend account

Create admin API routes:
- GET /api/admin/users?role=&search=
- PUT /api/admin/users/[id]/verify
- PUT /api/admin/users/[id]/suspend
```

**Files to Create**:
- `app/dashboard/admin/page.tsx`
- `app/dashboard/admin/users/page.tsx`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/verify/route.ts`
- `app/api/admin/users/[id]/suspend/route.ts`

---

### Day 44 (Tuesday): Moderation Queue

**Tasks**:
1. Create moderation queue page
2. Show flagged content
3. Implement approve/reject actions

**Prompt for Cursor**:
```
Create moderation queue:
1. app/dashboard/admin/moderation/page.tsx
2. Fetch from GET /api/admin/moderation
3. Display flagged content with toxicity scores
4. Actions: Approve, Reject & Delete
5. Show content preview and author

Create API routes:
- GET /api/admin/moderation?status=&type=
- PUT /api/admin/moderation/[id] - Approve or reject
```

**Files to Create**:
- `app/dashboard/admin/moderation/page.tsx`
- `app/api/admin/moderation/route.ts`
- `app/api/admin/moderation/[id]/route.ts`

---

### Day 45 (Wednesday): Admin Stats

**Tasks**:
1. Create stats page
2. Calculate platform metrics
3. Show recent activity

**Prompt for Cursor**:
```
Create admin stats page:
1. app/dashboard/admin/stats/page.tsx
2. Fetch from GET /api/admin/stats
3. Display:
   - Total users (clients, pros, active pros)
   - Total requests, offers, jobs
   - Total revenue from clicks
   - Average platform rating
4. Show charts if time allows (or just numbers)
5. Recent activity feed

Create GET /api/admin/stats with all calculations
```

**Files to Create**:
- `app/dashboard/admin/stats/page.tsx`
- `app/api/admin/stats/route.ts`

---

### Day 46 (Thursday): Professional Search

**Tasks**:
1. Create professional search page
2. Implement filters
3. Add pagination

**Prompt for Cursor**:
```
Create professional search (public page):
1. app/professionals/page.tsx
2. Search bar and filters: category, location, remote, min rating
3. Fetch from GET /api/professionals/search with query params
4. Display as grid of professional cards
5. Add pagination
6. Link cards to /professionals/[id]

Create GET /api/professionals/search with all filter logic from spec
```

**Files to Create**:
- `app/professionals/page.tsx`
- `app/api/professionals/search/route.ts`

---

### Day 47 (Friday): Internationalization

**Tasks**:
1. Setup i18n structure
2. Create translation files for English and French
3. Implement language switcher

**Prompt for Cursor**:
```
Add basic i18n support:
1. Install next-intl or similar i18n library
2. Create translation files:
   - locales/en.json (English)
   - locales/fr.json (French)
3. Translate key UI strings (nav, buttons, form labels)
4. Add language switcher in navbar
5. Store language preference in cookie

Focus on most visible text first (navigation, CTAs, form labels)
Don't translate database content (categories, reviews, etc.)
```

**Files to Create**:
- `locales/en.json`
- `locales/fr.json`
- `components/LanguageSwitcher.tsx`
- `lib/i18n.ts`

---

### Day 48-49 (Weekend): Final Polish

**Tasks**:
1. Add missing loading states
2. Improve error messages
3. Add success toasts
4. Fix responsive design issues
5. Test on mobile

**Prompt for Cursor**:
```
Final polish checklist:
1. Add loading skeletons to all data-fetching pages
2. Add error boundaries for crash protection
3. Ensure all forms have validation feedback
4. Add toast notifications for all actions (success/error)
5. Test responsive design on mobile/tablet
6. Fix any layout issues
7. Add favicons and meta tags
8. Optimize images
```

**Week 7 Deliverable**: ✅ Fully working demo ready for handover

---

## Buffer Days (Jan 13-15): Final Testing & Demo Prep

### Day 50 (Monday): End-to-End Testing

**Testing Checklist**:

**Client Flow**:
- [ ] Sign up as client
- [ ] Create a service request
- [ ] View request detail
- [ ] Receive offers (need test pro account)
- [ ] Click "View Profile" (charges pro €0.10)
- [ ] Accept an offer
- [ ] See phone numbers revealed
- [ ] Mark job as completed
- [ ] Leave a review

**Professional Flow**:
- [ ] Sign up as professional
- [ ] Complete profile (upload photo, add bio, add services)
- [ ] Profile reaches 100% completion
- [ ] Top up wallet (Stripe test card: 4242 4242 4242 4242)
- [ ] See matching requests
- [ ] Send an offer
- [ ] Get offer accepted
- [ ] See phone number revealed
- [ ] View wallet deductions (click charges)

**Admin Flow**:
- [ ] Log in as admin
- [ ] View user list
- [ ] Verify a professional's ID
- [ ] Review moderation queue
- [ ] Approve/reject flagged content
- [ ] View platform stats

**Edge Cases**:
- [ ] Pro with low wallet (<€2) hidden from search
- [ ] Request with 10 offers can't receive more
- [ ] Can't review a job twice
- [ ] Can't view same offer profile twice without charge

---

### Day 51 (Tuesday): Bug Fixes

**Common Issues to Check**:
1. Wallet balance not updating after Stripe payment
   - Test webhook locally with Stripe CLI
2. Profile completion not recalculating
   - Add debug logs to calculation function
3. Matching logic not working correctly
   - Test with various location/remote combinations
4. Reviews not showing on profile
   - Check database queries include reviews
5. Phone numbers not revealed after accepting offer
   - Verify transaction creates Job correctly

---

### Day 52 (Wednesday): Demo Data & Deployment

**Tasks**:
1. Create 2-3 test accounts of each role
2. Create sample requests and offers
3. Deploy to production

**Create Test Accounts**:

```bash
# Client Account
Email: client-demo@skillfind.pro
Password: Demo2024!
Phone: +33 6 12 34 56 78

# Professional Account
Email: pro-demo@skillfind.pro
Password: Demo2024!
Phone: +33 6 98 76 54 32
Bio: "Experienced React developer..."
Services: Website development, Bug fixing

# Admin Account
Email: admin@skillfind.pro
Password: Admin2024!
```

**Deployment Steps**:
```bash
# 1. Push to GitHub
git add .
git commit -m "Final implementation"
git push origin main

# 2. Deploy to Vercel (auto-deploys from GitHub)
# 3. Add environment variables in Vercel dashboard:
#    - DATABASE_URL
#    - CLERK_SECRET_KEY
#    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#    - STRIPE_SECRET_KEY
#    - STRIPE_WEBHOOK_SECRET
#    - SUPABASE_URL
#    - SUPABASE_ANON_KEY
#    - GOOGLE_PERSPECTIVE_API_KEY

# 4. Configure Stripe webhook in production
#    - Add webhook endpoint: https://skillfind.pro/api/webhooks/stripe
#    - Get production webhook secret
#    - Update in Vercel env vars

# 5. Run database migrations on production
npx prisma migrate deploy

# 6. Seed production database
npx prisma db seed
```

---

## Handover Package (By Jan 15)

### Documentation to Provide

1. **README.md**
   - Project overview
   - Tech stack
   - How to run locally
   - Environment variables needed

2. **DEPLOYMENT.md**
   - Deployment instructions
   - How to update
   - How to add admin users

3. **FEATURES.md**
   - List of implemented features
   - Known limitations
   - Future enhancement ideas

4. **API_DOCS.md**
   - Copy from `03-api-endpoints.md`
   - Add any changes made during implementation

### Demo Walkthrough Script

**5-Minute Demo Flow**:

1. **Landing Page** (30 sec)
   - Show hero and category list
   - Click "Sign Up"

2. **Client Journey** (1 min 30 sec)
   - Create account as client
   - Post a service request
   - View matching professionals
   - View an offer (show €0.10 charge)
   - Accept offer (show phone reveal)

3. **Professional Journey** (1 min 30 sec)
   - Switch to pro account
   - Show profile completion
   - See matching requests
   - Send an offer
   - Show wallet with transactions

4. **Review System** (1 min)
   - Mark job as completed
   - Leave a review
   - Show review on pro profile
   - Show rating calculation

5. **Admin Panel** (30 sec)
   - Show user management
   - Show moderation queue
   - Show platform stats

---

## Tips for Success

### Working with Cursor

**Best Practices**:
1. **One feature at a time**: Don't try to build multiple features in one prompt
2. **Reference docs**: Always mention which doc file contains the specs
3. **Provide context**: Show Cursor the related files before asking for changes
4. **Test immediately**: After each feature, test it manually before moving on
5. **Commit often**: Git commit after each working feature

**Example Good Prompt**:
```
I need to implement the "Send Offer" feature for professionals.

Context:
- The API spec is in 03-api-endpoints.md (POST /api/pro/offers)
- The business logic is in 04-business-logic.md (Offer Limit Enforcement section)
- The UI design is in 05-frontend-pages.md (Send Offer Modal)

Please:
1. Create the API route at app/api/pro/offers/route.ts
2. Implement the POST method with validation and offer limit check
3. Create the SendOfferModal component
4. Wire up the modal to the "Send Offer" button on matching requests page

Use the database schema from 02-database-schema.md for Prisma queries.
```

### When You Get Stuck

1. **Read the relevant doc section again** - The answer is usually there
2. **Simplify**: Break the feature into smaller pieces
3. **Test parts independently**: Test API route with Postman before building UI
4. **Check console/logs**: Add console.log everywhere to debug
5. **Ask for help**: Paste error messages into Cursor chat

### Time Management

**If You're Behind Schedule**:
- **Week 3**: Simplify verification - just use checkboxes, skip file uploads
- **Week 5**: Use Stripe test mode, skip webhook (manual balance updates)
- **Week 6**: Reviews can be simpler - skip moderation, just save to DB
- **Week 7**: Admin panel can be very basic - just tables, no fancy UI

**Priority Order** (if you must cut features):
1. **Must Have**: Request → Offer → Accept → Pay-per-click
2. **Should Have**: Reviews, Wallet top-up, Profile completion
3. **Nice to Have**: Admin panel, Search, i18n, Moderation

### Daily Routine

**Suggested Schedule** (for 8-10 hour days):
- **09:00-10:00**: Review day's tasks, read relevant docs
- **10:00-13:00**: Implementation sprint 1
- **13:00-14:00**: Lunch + test what you built
- **14:00-17:00**: Implementation sprint 2
- **17:00-18:00**: Testing, bug fixes, git commit
- **18:00-19:00**: (Optional) Polish or get ahead

**Every 2-3 Days**:
- Do a full end-to-end test of everything built so far
- Don't let bugs accumulate - fix them immediately

---

## Emergency Contacts

**If Something Breaks**:
- Supabase issues: Check dashboard for connection limits, migrations
- Clerk issues: Check dashboard for API key validity
- Stripe issues: Use test card 4242 4242 4242 4242, check webhook logs
- Prisma issues: Try `npx prisma generate` and restart dev server

**Useful Commands**:
```bash
# Reset database (careful!)
npx prisma migrate reset

# View database
npx prisma studio

# Check build errors
npm run build

# Test API routes
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Stripe webhook testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Success Metrics

By January 15, you should have:
- ✅ Deployed working app at skillfind.pro (or similar)
- ✅ All core features functional
- ✅ 2-3 test accounts for demo
- ✅ No critical bugs
- ✅ Documentation for client

**You've Got This! 🚀**

The plan is detailed, the docs are comprehensive, and you have 7 full weeks. Take it one week at a time, one feature at a time. The AI will help you write the code - you just need to follow the plan and test everything thoroughly.

Good luck!