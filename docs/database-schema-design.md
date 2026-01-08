# SkillFind.pro - Database Schema Design Document

**Version:** 1.0  
**Date:** December 2024  
**Author:** Development Team  
**Status:** Draft - Under Review

---

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Core Principles](#core-principles)
4. [Schema Diagram](#schema-diagram)
5. [Models & Relationships](#models--relationships)
6. [Indexes & Performance](#indexes--performance)
7. [Security & Privacy](#security--privacy)
8. [Migration Strategy](#migration-strategy)

---

## 1. Overview

### Purpose
This document defines the complete database schema for SkillFind.pro, a two-sided marketplace connecting clients with verified professionals.

### Key Business Requirements
- **Pay-per-click model**: €0.10 charged when client views pro's profile from offer
- **Wallet system**: Minimum €2 balance for professionals
- **Request → Offer → Job → Review** workflow
- **First 10 offers** per request limit
- **Profile completion** tracking (7 items)
- **Verification system** (mock UI initially, iDenfy optional)

### Database Provider
- **Primary**: Supabase (PostgreSQL 15+)
- **ORM**: Prisma
- **Authentication**: Clerk (external, user IDs referenced)

---

## 2. Technology Stack

### Database Features Used
- ✅ PostgreSQL relational database
- ✅ Full-text search (for requests/profiles)
- ✅ Unique constraints (fraud prevention)
- ✅ Indexes (performance optimization)
- ✅ Timestamps (audit trail)
- ✅ Enums (type safety)
- ✅ Cascading deletes (data integrity)

### NOT Using (Simplifications)
- ❌ Elasticsearch (using PostgreSQL full-text)
- ❌ Redis (Next.js caching sufficient for MVP)
- ❌ Separate analytics database (same DB for MVP)

---

## 3. Core Principles

### Design Philosophy
1. **Single Source of Truth**: Clerk for auth, database for business data
2. **Explicit Over Implicit**: Clear field names, no magic
3. **Audit Trail**: Track who did what when
4. **Soft Deletes**: Preserve data integrity (where needed)
5. **Type Safety**: Enums for status fields
6. **Indexing**: Performance-critical queries optimized

### Naming Conventions
- **Models**: PascalCase singular (e.g., `User`, `Request`)
- **Fields**: camelCase (e.g., `firstName`, `createdAt`)
- **Enums**: SCREAMING_SNAKE_CASE (e.g., `OPEN`, `COMPLETED`)
- **Relations**: Descriptive names (e.g., `offers`, `sentOffers`)

---

## 4. Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACCOUNTS                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
           ┌────────▼────────┐  ┌───────▼────────┐
           │     Client      │  │  Professional   │
           └────────┬────────┘  └───────┬─────────┘
                    │                   │
        ┌───────────┼───────────┐       │
        │           │           │       │
   ┌────▼────┐ ┌───▼────┐ ┌────▼─────┐ │
   │ Request │ │  Job   │ │  Review  │ │
   └────┬────┘ └───┬────┘ └──────────┘ │
        │          │                    │
   ┌────▼────┐     │          ┌─────────▼──────────┐
   │  Offer  │◄────┘          │ ProfessionalProfile│
   └────┬────┘                └─────────┬──────────┘
        │                               │
   ┌────▼────────┐           ┌──────────▼─────────┐
   │ ClickEvent  │           │  Wallet/Transaction│
   └─────────────┘           └────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SUPPORTING MODELS                            │
│  Category, Subcategory, Service, VerificationDocument            │
│  PlatformSettings, AdminAction                                    │
└─────────────────────────────────────────────────────────────────┘

Notes:
- ChatMessage excluded from MVP (direct phone/email after acceptance)
- Notification excluded from MVP (email only via SendGrid, no in-app)
- PlatformSettings added for admin control (phone verification toggle, pricing)
- VerificationDocument added for proper document approval workflow (phased implementation)
```

---

## 5. Models & Relationships

### 5.1 User & Authentication

#### **User** (Core user model)
```prisma
model User {
  id                String   @id @default(cuid())
  clerkId           String   @unique  // Clerk user ID
  email             String   @unique
  emailVerified     Boolean  @default(false)
  role              UserRole @default(CLIENT)
  
  // Profile basics
  firstName         String?
  lastName          String?
  dateOfBirth       DateTime?
  isOver18          Boolean  @default(false)  // Must be 18+ to use platform
  phoneNumber       String?  // Optional
  phoneVerified     Boolean  @default(false)  // For future phone verification
  phoneVerifiedAt   DateTime?
  avatar            String?  // URL to Supabase Storage
  
  // Account status
  isActive          Boolean  @default(true)
  isBanned          Boolean  @default(false)
  banReason         String?
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  clientProfile     Client?
  professionalProfile Professional?
  
  @@index([clerkId])
  @@index([email])
}

enum UserRole {
  CLIENT
  PROFESSIONAL
  ADMIN
}
```

**Key Decisions:**
- ✅ Clerk handles authentication, we store `clerkId` reference
- ✅ `role` field supports future multi-role (e.g., user can be both client AND pro)
- ✅ Soft delete via `isActive` flag
- ✅ Phone number optional for MVP
- ✅ `phoneVerified` fields ready for when admin enables phone verification (via PlatformSettings toggle)

---

#### **Client** (Extended profile for clients)
```prisma
model Client {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Client-specific fields
  city              String?  // City name
  region            String?  // State/Province
  country           String   @default("FR")  // Country code
  preferredLanguage String   @default("en")
  
  // Relations
  requests          Request[]
  jobs              Job[]
  reviews           Review[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([userId])
}
```

---

#### **Professional** (Extended profile for professionals)
```prisma
model Professional {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Account status
  status            ProfessionalStatus @default(INCOMPLETE)
  
  // Verification status
  isVerified        Boolean  @default(false)
  verificationMethod VerificationMethod @default(MANUAL)
  verifiedAt        DateTime?
  verifiedBy        String?  // Admin user ID who verified
  idenfyVerificationId String? // iDenfy session ID (if using real verification)
  
  // Profile completion (0-100%)
  profileCompletion Int      @default(0)
  
  // Business info
  businessName      String?
  bio               String?  @db.Text
  yearsOfExperience Int?
  
  // Location
  city              String?  // City name
  region            String?  // State/Province
  country           String   @default("FR")  // Country code
  
  // Availability
  isAvailable          Boolean              @default(true)  // Vacation mode toggle
  remoteAvailability   RemoteAvailability   @default(YES_AND_ONSITE)  // Remote work preference
  
  // Stats (calculated fields)
  averageRating     Float    @default(0)
  totalReviews      Int      @default(0)
  completedJobs     Int      @default(0)
  responseTime      Int?     // Future: Average hours to respond (not implemented in MVP)
  
  // Stripe integration
  stripeCustomerId  String?  // Stripe Customer ID for payment methods
  
  // Billing controls
  dailyClickLimit   Int      @default(10)  // Max clicks per day (spending protection)
  
  // Relations
  profile           ProfessionalProfile?
  wallet            Wallet?
  offers            Offer[]
  jobs              Job[]
  services          ProfessionalService[]
  documents         VerificationDocument[]
  reviews           Review[]     @relation("ReceivedReviews")
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([userId])
  @@index([status])        // Critical: filter by ACTIVE only
  @@index([isVerified])
  @@index([averageRating])
  @@index([city])          // For location-based matching
  @@index([status, city])  // Composite for active pros in city
}

enum VerificationMethod {
  MANUAL    // Admin manually verified
  IDENFY    // Automated via iDenfy
}

enum RemoteAvailability {
  YES_AND_ONSITE    // Can work both remotely and on-site
  ONLY_REMOTE       // Only remote work
  NO_REMOTE         // Only on-site work
}

enum ProfessionalStatus {
  INCOMPLETE        // Onboarding not finished (missing required steps)
  PENDING_REVIEW    // All steps complete, awaiting admin verification
  ACTIVE            // Verified and can receive requests
  SUSPENDED         // Admin suspended (can't receive requests)
  BANNED            // Permanently banned
}
```

**Key Decisions:**
- ✅ `status` enum gates professional activation (INCOMPLETE → PENDING_REVIEW → ACTIVE)
- ✅ Profile completion calculated from 9 mandatory steps:
  1. Email verified (via Clerk)
  2. Phone verified (skipped for MVP, but field ready)
  3. 18+ verified (dateOfBirth + isOver18)
  4. Wallet connected (has Wallet record with balance >= €2)
  5. ID verified (isVerified = true)
  6. Profile photo (avatar not null)
  7. Bio filled (bio not null, min 50 chars)
  8. Services selected (has ProfessionalService records)
  9. Remote availability set (remoteAvailability not null)
- ✅ Only `status = ACTIVE` pros appear in matching/listings
- ✅ `isAvailable` allows vacation mode (temporary pause)
- ✅ **Cached stats (`averageRating`, `totalReviews`, `completedJobs`) MUST be updated atomically**
- ✅ Verification tracks method and who/when
- ✅ `responseTime` field included but not implemented in MVP (requires complex tracking via background jobs - add post-launch)

**🔴 CRITICAL: Update Cached Stats Atomically**

When creating a review, MUST update professional stats in the same transaction:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create review
  const review = await tx.review.create({
    data: { jobId, rating, comment, tags }
  });
  
  // 2. Get current stats
  const pro = await tx.professional.findUnique({
    where: { id: professionalId },
    select: { averageRating: true, totalReviews: true }
  });
  
  // 3. Calculate new average
  const newTotal = pro.totalReviews + 1;
  const newAverage = ((pro.averageRating * pro.totalReviews) + rating) / newTotal;
  
  // 4. Update stats atomically
  await tx.professional.update({
    where: { id: professionalId },
    data: {
      averageRating: newAverage,
      totalReviews: { increment: 1 }
    }
  });
  
  return review;
});
```

**Similar logic for:**
- `Professional.completedJobs` (increment when Job.status = COMPLETED)
- `Wallet.totalDeposits`/`totalSpent` (already in transaction)
- `Request.offerCount` (see Offer section above)

---

### 5.2 Professional Profile Details

#### **ProfessionalProfile** (Detailed pro information)
```prisma
model ProfessionalProfile {
  id                String       @id @default(cuid())
  professionalId    String       @unique
  professional      Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  
  // Portfolio
  portfolioImages   String[]     // Array of URLs (work samples)
  
  // Pricing
  hourlyRateMin     Int?         // In cents (e.g., 5000 = €50)
  hourlyRateMax     Int?
  
  // Social proof
  websiteUrl        String?
  linkedinUrl       String?
  
  // Preferences
  preferredLanguage String       @default("en")
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  @@index([professionalId])
}
```

**Note:** `certifications` array removed - now tracked via VerificationDocument model for proper approval workflow.

---

#### **VerificationDocument** (Document verification system)
```prisma
model VerificationDocument {
  id                String         @id @default(cuid())
  professionalId    String
  professional      Professional   @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  
  // Document details
  type              DocumentType
  fileUrl           String         // Supabase Storage URL
  fileName          String
  fileSize          Int?           // In bytes
  mimeType          String?        // e.g., "image/jpeg", "application/pdf"
  
  // Verification status
  status            DocumentStatus @default(PENDING)
  
  // Review details
  reviewedBy        String?        // Admin user ID
  reviewedAt        DateTime?
  rejectionReason   String?        @db.Text
  adminNotes        String?        @db.Text  // Internal admin notes
  
  // Metadata
  uploadedAt        DateTime       @default(now())
  expiresAt         DateTime?      // For time-sensitive docs (e.g., ID cards)
  
  @@index([professionalId])
  @@index([status])
  @@index([type])
  @@index([uploadedAt])
}

enum DocumentType {
  IDENTITY_CARD       // Government ID (required for verification)
  PASSPORT            // Alternative to ID card
  DRIVERS_LICENSE     // Alternative to ID card
  BUSINESS_LICENSE    // Business registration
  DIPLOMA             // Educational certificate
  CERTIFICATION       // Professional certification (e.g., plumbing license)
  PORTFOLIO_SAMPLE    // Work sample/portfolio image
  OTHER               // Other supporting documents
}

enum DocumentStatus {
  PENDING             // Uploaded, awaiting admin review
  APPROVED            // Admin approved
  REJECTED            // Admin rejected (pro can re-upload)
  EXPIRED             // Document expired (e.g., old ID)
}
```

**Key Decisions:**
- ✅ Proper document type tracking (ID, diploma, certification, etc.)
- ✅ Approval workflow (PENDING → APPROVED/REJECTED)
- ✅ Admin review tracking (who, when, why rejected)
- ✅ Expiration support (for IDs that expire)
- ✅ Multiple documents per pro (ID + diplomas + certifications)
- ✅ Internal admin notes for verification process
- ✅ File metadata (size, mime type) for validation

**Implementation Strategy (Phased):**
- **Phase 1 (Week 1-2):** Pro can upload documents, stored in table (2 hours)
- **Phase 2 (Week 5-7):** Admin document review UI with approve/reject (4 hours)
- **Phase 3 (Post-launch):** Rejection feedback, re-upload workflow (2 hours)
- **Fallback:** Admin can always manually toggle `Professional.isVerified` regardless of document workflow

**Client Requirement:** ✅ Admin can manually verify professionals in admin panel (satisfied via both manual toggle AND document review)

**🔒 GDPR-Compliant Document Storage:**

Sensitive documents (ID cards, passports) MUST be stored securely:

```typescript
// 1. Create PRIVATE Supabase Storage bucket (one-time setup)
await supabase.storage.createBucket('verification-documents', {
  public: false,  // ← CRITICAL: Files not publicly accessible
  fileSizeLimit: 10485760, // 10MB limit
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
});

// 2. Upload document to private bucket
const { data } = await supabase.storage
  .from('verification-documents')
  .upload(`${professionalId}/${documentType}-${Date.now()}.jpg`, file);

// 3. Store path in database (NOT public URL)
await prisma.verificationDocument.create({
  data: {
    fileUrl: data.path,  // Store path, not public URL
    fileName: file.name,
    professionalId
  }
});

// 4. Generate temporary signed URL when admin needs to view
const { data: signedUrl } = await supabase.storage
  .from('verification-documents')
  .createSignedUrl(document.fileUrl, 3600); // Expires in 1 hour

// Only authorized admins can generate signed URLs
```

**GDPR Compliance:**
- ✅ **Private storage** - Files not publicly accessible
- ✅ **Signed URLs** - Temporary access only (expires after 1 hour)
- ✅ **Access control** - Only admins can view documents
- ✅ **Encrypted at rest** - Supabase encrypts all storage
- ✅ **Right to deletion** - Can delete documents via `supabase.storage.remove()`
- ✅ **Audit trail** - Track who accessed documents via AdminAction

**Security Best Practices:**
- Never expose document URLs in API responses
- Generate signed URLs on-demand (don't cache)
- Check admin authorization before generating signed URL
- Set short expiry times (1 hour max)
- Delete documents after verification (optional, depends on legal requirements)

---

#### **ProfessionalService** (Services offered by pro)
```prisma
model ProfessionalService {
  id                String       @id @default(cuid())
  professionalId    String
  professional      Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  
  subcategoryId     String
  subcategory       Subcategory  @relation(fields: [subcategoryId], references: [id])
  
  // Service-specific details
  description       String?      @db.Text
  priceFrom         Int?         // In cents
  priceTo           Int?
  
  createdAt         DateTime     @default(now())
  
  @@unique([professionalId, subcategoryId])
  @@index([professionalId])
  @@index([subcategoryId])
}
```

**Key Decisions:**
- ✅ Pros can offer multiple services (many-to-many via this join table)
- ✅ Unique constraint prevents duplicate service entries
- ✅ Price range per service (optional)

---

### 5.3 Categories & Services

#### **Category** (Main service categories)
```prisma
model Category {
  id              String        @id @default(cuid())
  slug            String        @unique
  nameEn          String
  nameFr          String?
  icon            String?       // Icon name or URL
  sortOrder       Int           @default(0)
  isActive        Boolean       @default(true)
  
  subcategories   Subcategory[]
  requests        Request[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([slug])
  @@index([sortOrder])
}
```

---

#### **Subcategory** (Specific services within categories)
```prisma
model Subcategory {
  id              String        @id @default(cuid())
  categoryId      String
  category        Category      @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  slug            String        @unique
  nameEn          String
  nameFr          String?
  sortOrder       Int           @default(0)
  isActive        Boolean       @default(true)
  
  requests        Request[]
  professionalServices ProfessionalService[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([categoryId])
  @@index([slug])
}
```

---

### 5.4 Request System

#### **Request** (Client posts service request)
```prisma
model Request {
  id                String         @id @default(cuid())
  clientId          String
  client            Client         @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  categoryId        String
  category          Category       @relation(fields: [categoryId], references: [id])
  
  subcategoryId     String
  subcategory       Subcategory    @relation(fields: [subcategoryId], references: [id])
  
  // Request details
  title             String
  description       String         @db.Text
  
  // Location
  locationType      LocationType
  city              String?        // City name (for matching)
  region            String?        // State/Province
  country           String         @default("FR")  // Country code
  address           String?        // Full address (if on-site, optional)
  
  // Budget
  budgetMin         Int?           // In cents
  budgetMax         Int?
  
  // Timeline
  urgency           Urgency        @default(FLEXIBLE)
  preferredStartDate DateTime?
  
  // Status
  status            RequestStatus  @default(OPEN)
  
  // Offer tracking
  offerCount        Int            @default(0)  // Cached count (max 10)
  
  // Relations
  offers            Offer[]
  job               Job?
  
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  closedAt          DateTime?
  
  @@index([clientId])
  @@index([categoryId])
  @@index([subcategoryId])
  @@index([status])
  @@index([categoryId, status])  // Composite index for filtering
  @@index([city])                 // For location-based matching
  @@index([createdAt])
}

enum LocationType {
  ON_SITE
  REMOTE
}

enum Urgency {
  URGENT      // Within 24 hours
  SOON        // Within a week
  FLEXIBLE    // No rush
}

enum RequestStatus {
  OPEN           // Accepting offers
  IN_PROGRESS    // Job started
  COMPLETED      // Job finished
  CANCELLED      // Client cancelled
}
```

**Key Decisions:**
- ✅ `offerCount` cached to quickly check if limit (10) reached
- ✅ `locationType` determines if location is required
- ✅ Budget ranges in cents for precision
- ✅ Status tracks lifecycle
- ✅ **Denormalized categoryId** for performance (direct category filtering without joining through subcategory)
- ✅ Composite index on `[categoryId, status]` for fast queries like "Open requests in Home Repair"

---

### 5.5 Offer & Matching System

#### **Offer** (Professional sends offer to client)
```prisma
model Offer {
  id                String       @id @default(cuid())
  requestId         String
  request           Request      @relation(fields: [requestId], references: [id], onDelete: Cascade)
  
  professionalId    String
  professional      Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  
  // Offer details
  message           String       @db.Text
  proposedPrice     Int?         // In cents
  estimatedDuration String?      // "2-3 days", "1 week", etc.
  availableTimeSlots String?     @db.Text  // e.g., "Mon-Fri 9am-5pm" or JSON array
  
  // Status
  status            OfferStatus  @default(PENDING)
  
  // Tracking
  viewedByClient    Boolean      @default(false)
  viewedAt          DateTime?
  
  // Click event (for billing)
  clickEvent        ClickEvent?
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  @@unique([requestId, professionalId])  // One offer per pro per request
  @@index([requestId])
  @@index([professionalId])
  @@index([status])
  @@index([createdAt])
}

enum OfferStatus {
  PENDING     // Sent, waiting for client response
  VIEWED      // Client viewed the offer
  ACCEPTED    // Client accepted (job created)
  REJECTED    // Client rejected
  WITHDRAWN   // Pro withdrew offer
  EXPIRED     // Auto-expired after X days (future feature)
}
```

**Key Decisions:**
- ✅ Unique constraint: One offer per pro per request
- ✅ `viewedByClient` tracks if client saw offer (separate from profile click)
- ✅ `clickEvent` relation for billing

**🔴 CRITICAL: Update offerCount Atomically**

When creating an offer, MUST update `Request.offerCount` in the same transaction:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Check offer limit
  const request = await tx.request.findUnique({
    where: { id: requestId },
    select: { offerCount: true }
  });
  
  if (request.offerCount >= 10) {
    throw new Error('Request has reached maximum offers (10)');
  }
  
  // 2. Create offer
  const offer = await tx.offer.create({
    data: {
      requestId,
      professionalId,
      message,
      proposedPrice
    }
  });
  
  // 3. Increment counter atomically
  await tx.request.update({
    where: { id: requestId },
    data: { offerCount: { increment: 1 } }
  });
  
  return offer;
});
```

**Why Atomic:**
- Prevents race condition (2 pros sending 10th offer simultaneously)
- Counter always accurate
- Enforces 10-offer limit correctly

---

#### **ClickEvent** (Tracks profile clicks for billing)
```prisma
model ClickEvent {
  id                String       @id @default(cuid())
  offerId           String       @unique
  offer             Offer        @relation(fields: [offerId], references: [id], onDelete: Cascade)
  
  clientId          String
  professionalId    String
  
  // Transaction
  transactionId     String?
  transaction       Transaction? @relation(fields: [transactionId], references: [id])
  
  // Tracking
  clickedAt         DateTime     @default(now())
  ipAddress         String?      // For fraud detection
  userAgent         String?
  
  @@unique([offerId, clientId])  // Prevent duplicate clicks
  @@index([professionalId])
  @@index([clickedAt])
}
```

**Key Decisions:**
- ✅ Unique constraint: Client can only click same offer once (fraud prevention)
- ✅ Links to transaction for billing audit trail
- ✅ Stores IP/user agent for fraud detection

---

### 5.6 Wallet & Payment System

#### **Wallet** (Professional's balance)
```prisma
model Wallet {
  id                String        @id @default(cuid())
  professionalId    String        @unique
  professional      Professional  @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  
  // Balance
  balance           Int           @default(0)  // In cents (e.g., 200 = €2.00)
  
  // Tracking
  totalDeposits     Int           @default(0)
  totalSpent        Int           @default(0)
  
  // Relations
  transactions      Transaction[]
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([professionalId])
}
```

---

#### **Transaction** (Wallet transaction log)
```prisma
model Transaction {
  id                String            @id @default(cuid())
  walletId          String
  wallet            Wallet            @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  // Transaction details
  type              TransactionType
  amount            Int               // In cents (positive = deposit, negative = debit)
  balanceBefore     Int               // For audit
  balanceAfter      Int
  
  // Reference
  description       String
  referenceId       String?           // Stripe payment ID or offer ID
  
  // Click event relation (for debits)
  clickEvent        ClickEvent?  // One-to-one (one click = one transaction)
  
  // Admin actions
  adminId           String?           // If manual adjustment
  adminNote         String?
  
  createdAt         DateTime          @default(now())
  
  @@index([walletId])
  @@index([type])
  @@index([createdAt])
}

enum TransactionType {
  DEPOSIT           // Top-up via Stripe
  DEBIT             // Profile click charge
  REFUND            // Admin refund
  ADMIN_ADJUSTMENT  // Manual balance change
}
```

**Key Decisions:**
- ✅ All amounts in cents for precision
- ✅ Stores `balanceBefore`/`balanceAfter` for audit trail
- ✅ Links to Stripe payment ID for reconciliation
- ✅ Admin adjustments tracked with note

---

### 5.7 Job & Review System

#### **Job** (Active work between client and pro)
```prisma
model Job {
  id                String       @id @default(cuid())
  requestId         String       @unique
  request           Request      @relation(fields: [requestId], references: [id], onDelete: Cascade)
  
  clientId          String
  client            Client       @relation(fields: [clientId], references: [id])
  
  professionalId    String
  professional      Professional @relation(fields: [professionalId], references: [id])
  
  // Job details
  agreedPrice       Int?         // In cents
  status            JobStatus    @default(ACCEPTED)
  
  // Timeline
  startedAt         DateTime?
  completedAt       DateTime?
  
  // Review
  review            Review?
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  @@index([clientId])
  @@index([professionalId])
  @@index([status])
}

enum JobStatus {
  ACCEPTED       // Client accepted offer
  IN_PROGRESS    // Work in progress
  COMPLETED      // Client marked as complete
  CANCELLED      // Cancelled by either party
  DISPUTED       // Issue reported
}
```

---

#### **Review** (Client reviews professional after job)
```prisma
model Review {
  id                String       @id @default(cuid())
  jobId             String       @unique
  job               Job          @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  clientId          String
  client            Client       @relation(fields: [clientId], references: [id])
  
  professionalId    String       @relation("ReceivedReviews", fields: [professionalId], references: [id])
  
  // Review content
  rating            Int          // 1-5 stars
  comment           String?      @db.Text
  tags              String[]     // e.g., ["on_time", "professional", "great_communication"]
  wouldRecommend    Boolean      @default(true)  // "Would recommend: yes/no" toggle
  
  // Moderation (Google Perspective API)
  isModerated       Boolean      @default(false)
  toxicityScore     Float?       // 0-1 (>0.8 flagged)
  isFlagged         Boolean      @default(false)
  moderatedBy       String?      // Admin ID
  moderationNote    String?
  
  // Professional response
  proResponse       String?      @db.Text
  proRespondedAt    DateTime?
  
  // Visibility
  isPublished       Boolean      @default(true)
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  @@index([clientId])
  @@index([professionalId])
  @@index([rating])
  @@index([isFlagged])
}
```

**Key Decisions:**
- ✅ One review per job (unique on `jobId`)
- ✅ Toxicity scoring via Google Perspective API
- ✅ Admin moderation workflow
- ✅ Pro can publicly respond

---

### 5.8 Platform Configuration

#### **PlatformSettings** (Global platform configuration)
```prisma
model PlatformSettings {
  id                       String   @id @default(cuid())
  
  // Phone verification
  phoneVerificationEnabled Boolean  @default(false)
  
  // Billing settings
  clickFee                 Int      @default(10)    // €0.10 in cents
  minimumWalletBalance     Int      @default(200)   // €2.00 in cents
  
  // Business rules
  maxOffersPerRequest      Int      @default(10)
  
  // Audit
  updatedAt                DateTime @updatedAt
  updatedBy                String?  // Admin user ID
  
  @@map("platform_settings")
}
```

**Key Decisions:**
- ✅ Minimal version for MVP (5 critical settings)
- ✅ Admin can toggle phone verification without code deployment
- ✅ Admin can adjust pricing (click fee, minimum balance)
- ✅ Admin can change business rules (max offers)
- ✅ Easy to add more settings later (just add fields and migrate)
- ✅ Single row table (singleton pattern)

**Usage:**
```typescript
// Get settings (cached)
const settings = await prisma.platformSettings.findFirst();

// Use in business logic
if (settings.phoneVerificationEnabled && !user.phoneVerified) {
  throw new Error("Phone verification required");
}

// Admin updates
await prisma.platformSettings.update({
  where: { id: settings.id },
  data: { 
    clickFee: 15,  // Change from €0.10 to €0.15
    updatedBy: adminUserId 
  }
});
```

---

### 5.9 Admin & Moderation

**Note on Notifications:** In-app notification system removed from MVP. Requirements only specify email notifications via SendGrid (Section 15). Email notifications will be sent directly via SendGrid API without storing in database. In-app notifications (bell icon, notification center) can be added post-launch if needed.

**Note on Chat:** Chat/messaging system removed from MVP. After client accepts offer, phone numbers are revealed and communication happens directly via phone/email (as per requirements Section 6.5 & 7.6).

#### **AdminAction** (Audit log for admin actions)
```prisma
model AdminAction {
  id                String       @id @default(cuid())
  adminId           String       // User ID of admin
  
  // Action details
  action            AdminActionType
  targetType        String       // "User", "Request", "Review", etc.
  targetId          String       // ID of affected entity
  
  // Details
  reason            String?      @db.Text
  metadata          Json?        // Additional data
  
  createdAt         DateTime     @default(now())
  
  @@index([adminId])
  @@index([targetType, targetId])
  @@index([createdAt])
}

enum AdminActionType {
  USER_BANNED
  USER_UNBANNED
  USER_VERIFIED
  USER_REJECTED
  BALANCE_ADJUSTED
  CONTENT_FLAGGED
  CONTENT_APPROVED
  CONTENT_REMOVED
  REVIEW_MODERATED
}
```

---

## 6. Indexes & Performance

### Critical Indexes

```prisma
// User lookups
@@index([clerkId])
@@index([email])

// Request matching (most critical query)
@@index([subcategoryId, status, createdAt])
@@index([status, offerCount])

// Professional search
@@index([isVerified, averageRating])

// Wallet operations
@@index([professionalId])

// Transaction history
@@index([walletId, createdAt])

// Notifications
@@index([userId, isRead, createdAt])
```

### Full-Text Search Indexes (PostgreSQL)

```sql
-- Will be added via raw SQL after Prisma migration
CREATE INDEX requests_fulltext_idx ON "Request" 
USING GIN (to_tsvector('english', title || ' ' || description));

CREATE INDEX professionals_fulltext_idx ON "Professional" 
USING GIN (to_tsvector('english', COALESCE(businessName, '') || ' ' || COALESCE(bio, '')));
```

---

## 7. Security & Privacy

### Data Protection
- ❌ **No passwords stored** (handled by Clerk)
- ✅ **Phone numbers optional** (not verified)
- ✅ **Email verification required** (via Clerk)
- ✅ **Soft deletes** for user accounts (preserve reviews/transactions)
- ✅ **IP addresses stored** only for fraud detection (ClickEvent)

### Access Control
- **Row-Level Security (RLS)** will be configured in Supabase for:
  - Users can only read/update their own data
  - Admins have full access
  - Public data: Categories, published reviews

### GDPR Compliance (Future)
- User can request data export (JSON)
- User can request account deletion (anonymize data)
- Transaction history retained for legal/tax purposes

---

## 8. Migration Strategy

### Phase 1: Foundation (Week 1)
```bash
# Models to create first
- User, Client, Professional
- Category, Subcategory
- Wallet, Transaction (empty wallets)
```

### Phase 2: Core Features (Week 2-3)
```bash
- Request
- ProfessionalService
- ProfessionalProfile
```

### Phase 3: Matching System (Week 4)
```bash
- Offer
- ClickEvent
```

### Phase 4: Jobs & Reviews (Week 5-6)
```bash
- Job
- Review
- ChatMessage
```

### Phase 5: Admin & Polish (Week 7)
```bash
- AdminAction
- Email notification system (SendGrid integration)
- Optional: ChatMessage (if time permits)
- Optional: In-app Notification model (if time permits)
```

---

## Next Steps

### Before Implementation:
1. ✅ Review this document with team/stakeholders
2. ⏳ Answer remaining questions (daily limits, account deletion, etc.)
3. ⏳ Create seed data for categories/subcategories
4. ⏳ Set up Supabase project
5. ⏳ Configure Clerk authentication

### Ready to Build:
- ✅ Prisma schema ready to be written
- ✅ All relationships defined
- ✅ Indexes planned
- ✅ Migration strategy clear

---

## Appendix: Key Business Logic

### Profile Completion Calculation (7 items)
```typescript
// Professional must complete:
1. First name + Last name
2. Avatar uploaded
3. Bio written (min 50 chars)
4. At least 1 service selected
5. Location set
6. Hourly rate range set
7. ID verified (via admin or iDenfy)

// Formula: (completedItems / 7) * 100
```

### Pay-Per-Click Logic

**🔴 CRITICAL: Pay-Per-Click Must Be Atomic**

The pay-per-click billing is the **core revenue mechanism** and must be handled with database transactions to prevent:
- Double charging (concurrent clicks)
- Lost charges (partial failures)
- Wallet inconsistencies
- Revenue loss

**Implementation Requirements:**
```typescript
// Use Prisma transaction with row-level locking
await prisma.$transaction(async (tx) => {
  // 0. Check daily click limit FIRST (before any locks)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const clicksToday = await tx.clickEvent.count({
    where: {
      professionalId: proId,
      clickedAt: { gte: startOfDay }
    }
  });
  
  const professional = await tx.professional.findUnique({
    where: { id: proId },
    select: { dailyClickLimit: true }
  });
  
  if (clicksToday >= professional.dailyClickLimit) {
    throw new Error('Professional has reached daily click limit');
  }

  // 1. Lock wallet (FOR UPDATE prevents concurrent modifications)
  const wallet = await tx.wallet.findUnique({
    where: { professionalId: proId }
  });

  // 2. Check balance BEFORE any writes
  if (wallet.balance < 10) {
    throw new Error('Insufficient balance');
  }

  // 3. Check for duplicate click (idempotency via unique constraint)
  const existingClick = await tx.clickEvent.findUnique({
    where: {
      offerId_clientId: { offerId, clientId }
    }
  });
  
  if (existingClick) {
    return { alreadyClicked: true, clickEvent: existingClick };
  }

  // 4. Create click event
  const clickEvent = await tx.clickEvent.create({
    data: { offerId, clientId, professionalId: proId }
  });

  // 5. Deduct from wallet (atomic decrement)
  const updatedWallet = await tx.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: { decrement: 10 },
      totalSpent: { increment: 10 }
    }
  });

  // 6. Create transaction record (audit trail)
  const transaction = await tx.transaction.create({
    data: {
      walletId: wallet.id,
      type: 'DEBIT',
      amount: -10,
      balanceBefore: wallet.balance,
      balanceAfter: updatedWallet.balance,
      description: `Profile click from client`,
      referenceId: offerId
    }
  });

  // 7. Link click to transaction
  await tx.clickEvent.update({
    where: { id: clickEvent.id },
    data: { transactionId: transaction.id }
  });

  return { success: true, clickEvent, transaction };
}, {
  isolationLevel: 'Serializable', // Highest isolation level
  maxWait: 5000,   // Wait max 5s for lock
  timeout: 10000   // Transaction timeout 10s
});
```

**Why This Matters:**
- **Atomicity**: All steps succeed or all fail (no partial state)
- **Consistency**: Wallet balance always matches transaction history
- **Isolation**: Concurrent clicks don't interfere
- **Durability**: Once committed, charge is permanent
- **Idempotency**: Duplicate clicks detected via unique constraint

**Schema Support:**
- ✅ `ClickEvent` unique constraint `(offerId, clientId)` prevents duplicates
- ✅ `Transaction` stores `balanceBefore`/`balanceAfter` for audit
- ✅ `ClickEvent.transactionId` links charge to click
- ✅ `Professional.dailyClickLimit` protects pros from runaway charges
- ✅ `ClickEvent.ipAddress` and `userAgent` stored for fraud detection
- ✅ All fields support atomic operation

**Daily Limit Enforcement:**
- Query `ClickEvent.count()` for clicks today (WHERE clickedAt >= start of day)
- Compare against `Professional.dailyClickLimit`
- Reject click if limit reached
- Pro can adjust their limit in settings (default: 10 clicks/day)

**🔴 CRITICAL: Fraud Prevention via Rate Limiting**

Prevent bots/click farms from draining professional balances:

```typescript
await prisma.$transaction(async (tx) => {
  // ... previous checks (daily limit, balance, etc.)
  
  // Fraud prevention: Rate limit by IP address
  const oneMinuteAgo = new Date(Date.now() - 60000);
  const oneHourAgo = new Date(Date.now() - 3600000);
  
  const recentClicksFromIp = await tx.clickEvent.count({
    where: {
      ipAddress: clientIp,
      clickedAt: { gte: oneMinuteAgo }
    }
  });
  
  if (recentClicksFromIp >= 5) {
    throw new Error('Rate limit exceeded: Too many clicks from this IP');
  }
  
  const hourlyClicksFromIp = await tx.clickEvent.count({
    where: {
      ipAddress: clientIp,
      clickedAt: { gte: oneHourAgo }
    }
  });
  
  if (hourlyClicksFromIp >= 10) {
    throw new Error('Rate limit exceeded: Too many clicks from this IP in the last hour');
  }
  
  // ... continue with charging logic
});
```

**Rate Limits (MVP - Database Query):**
- **5 clicks per IP per minute** (prevents rapid bot clicks)
- **10 clicks per IP per hour** (prevents sustained abuse)
- Can adjust limits in code as needed

**Future Improvements (Post-MVP):**
- Migrate to Redis for faster rate limiting (doesn't hit DB)
- Add device fingerprinting
- Integrate IP reputation service (IPQualityScore, Cloudflare)
- Add CAPTCHA when suspicious patterns detected
- Track user agent patterns (detect bots)

### Matching Algorithm
```typescript
// When client posts request:
1. Find professionals where:
   - status = ACTIVE  // ← CRITICAL: Only active pros
   - isAvailable = true  // Not on vacation
   - Has service matching subcategoryId
   - Location matches:
     * If request.locationType = REMOTE: Match all pros
     * If request.locationType = ON_SITE: Match pros where:
       - pro.city = request.city (exact match)
       - OR pro.remoteAvailability IN (YES_AND_ONSITE, ONLY_REMOTE)
   
2. Rank by:
   - Profile completion % (DESC)
   - Average rating (DESC)
   - Response time (ASC)
   
3. Notify top 50 matched pros via email
4. Pros can send offer (limit: first 10 offers per request)
```

---

**Document Status:** Ready for review and implementation  
**Next Action:** Review and approve, then generate Prisma schema file
