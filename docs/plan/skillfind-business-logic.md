# Critical Business Logic

## Overview

This document provides detailed algorithms for the most complex business rules in SkillFind.pro.

---

## 1. Profile Completion Calculation

### Purpose
Track professional profile completeness to determine if they can receive requests.

### Required Fields (8 total)

1. ✅ **Email Verified** - Always true (Clerk handles this)
2. ❌ **Phone Verified** - Skip (we're not verifying phone, costs money)
3. ✅ **ID Verified** - Manual toggle or iDenfy webhook
4. ✅ **Wallet Connected** - True if Wallet record exists for pro
5. ✅ **Terms Accepted** - Boolean flag on profile
6. ✅ **Bio Filled** - Must be at least 50 characters
7. ✅ **Profile Photo** - profilePhotoUrl is not null
8. ✅ **Services Added** - At least 1 ProfessionalService exists

### Algorithm (TypeScript)

```typescript
async function calculateProfileCompletion(proId: string): Promise<number> {
  // Fetch profile with relations
  const profile = await prisma.professionalProfile.findUnique({
    where: { id: proId },
    include: {
      services: true,
      wallet: true,
    },
  });

  if (!profile) return 0;

  // Count completed items
  const completedItems = [
    profile.emailVerified, // Should always be true
    // profile.phoneVerified, // SKIP THIS ONE (we don't verify phone)
    profile.idVerified,
    profile.wallet !== null, // Wallet connected
    profile.termsAccepted,
    profile.bio && profile.bio.length >= 50,
    profile.profilePhotoUrl !== null,
    profile.services.length > 0,
  ].filter(Boolean).length;

  // Total required (7 items, phone verification skipped)
  const totalRequired = 7;
  
  const percent = Math.round((completedItems / totalRequired) * 100);
  
  // Update profile
  await prisma.professionalProfile.update({
    where: { id: proId },
    data: {
      profileCompletionPercent: percent,
      isActive: percent === 100, // Only active if 100% complete
    },
  });

  return percent;
}
```

### When to Recalculate

Trigger this function after:
- Profile bio or photo updated
- Service added or removed
- Terms accepted
- Wallet created (first top-up)
- ID verification status changed (manual or iDenfy webhook)

### UI Display

Show progress bar on professional dashboard:
```
Profile Completion: 71% ━━━━━━━━━━━━━━━░░░░░░░░░
```

List incomplete items:
- ✅ Email verified
- ✅ Bio added
- ✅ Profile photo uploaded
- ❌ ID verification pending
- ❌ Wallet not connected
- ✅ 2 services added
- ✅ Terms accepted

---

## 2. Pay-Per-Click Logic

### Purpose
Charge professionals €0.10 when a client views their full profile from an offer.

### Prevent Double-Charging
Use database unique constraint: `ClickEvent(offerId, clientId)` ensures a client can only be charged once per offer.

### Algorithm (TypeScript)

```typescript
async function viewProfessionalProfile(
  offerId: string,
  clientId: string
): Promise<{ professional: any; charged: boolean; alreadyViewed: boolean }> {
  
  // 1. Get offer and professional
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { pro: { include: { wallet: true } } },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  const pro = offer.pro;
  const proId = pro.id;

  // 2. Check if already clicked
  const existingClick = await prisma.clickEvent.findUnique({
    where: {
      offerId_clientId: { offerId, clientId },
    },
  });

  if (existingClick) {
    // Already paid, just return profile
    return {
      professional: await getFullProfessionalProfile(proId),
      charged: false,
      alreadyViewed: true,
    };
  }

  // 3. Check wallet balance
  if (!pro.wallet || pro.wallet.balanceCents < 10) {
    throw new Error('Professional wallet balance insufficient');
  }

  // 4. Charge €0.10 (10 cents)
  await prisma.$transaction([
    // Deduct from wallet
    prisma.wallet.update({
      where: { id: pro.wallet.id },
      data: {
        balanceCents: { decrement: 10 },
      },
    }),

    // Record transaction
    prisma.walletTransaction.create({
      data: {
        walletId: pro.wallet.id,
        amountCents: -10, // Negative = charge
        type: 'CLICK_CHARGE',
        description: `Profile viewed from offer #${offerId}`,
      },
    }),

    // Record click event
    prisma.clickEvent.create({
      data: {
        offerId,
        clientId,
        proId,
        chargedCents: 10,
      },
    }),
  ]);

  return {
    professional: await getFullProfessionalProfile(proId),
    charged: true,
    alreadyViewed: false,
  };
}
```

### Error Handling

**If wallet balance < 10 cents:**
```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "This professional's wallet balance is too low. They need to top up before you can view their profile."
  }
}
```

Client should see a message: "This professional is currently unavailable. They'll appear in your search again once they top up their wallet."

### Edge Cases

1. **What if pro deletes offer?**
   - Cascade delete ClickEvents
   - Doesn't matter, money already charged

2. **What if client views same pro from multiple offers?**
   - Charged separately for each offer (different offerId)
   - This is intentional (pro gets multiple chances to be seen)

3. **What if transaction fails mid-way?**
   - Database transaction ensures all-or-nothing
   - If any query fails, entire transaction rolls back

---

## 3. Matching Logic

### Purpose
Show professionals only the service requests that match their skills and location.

### Matching Criteria

A request matches a professional if:
1. ✅ Request status is OPEN
2. ✅ Request subcategory matches one of pro's services
3. ✅ Location matches:
   - Request location = Pro location, OR
   - Request allows remote (remoteOk = true), OR
   - Pro is available remotely (remoteAvailable = true)
4. ✅ Request has fewer than 10 offers (requirements limit)
5. ❌ Pro hasn't already sent an offer to this request

### Algorithm (TypeScript)

```typescript
async function getMatchingRequests(
  proId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ requests: any[]; total: number }> {
  
  // 1. Get pro's services and location
  const pro = await prisma.professionalProfile.findUnique({
    where: { id: proId },
    include: { services: true },
  });

  if (!pro) {
    throw new Error('Professional not found');
  }

  const subcategoryIds = pro.services.map(s => s.subcategoryId);
  
  if (subcategoryIds.length === 0) {
    return { requests: [], total: 0 };
  }

  // 2. Query matching requests
  const where = {
    status: 'OPEN',
    subcategoryId: { in: subcategoryIds },
    OR: [
      { location: pro.location }, // Exact location match
      { remoteOk: true }, // Client accepts remote
      ...(pro.remoteAvailable ? [{}] : []), // Pro can work remotely (match all)
    ],
  };

  const total = await prisma.request.count({ where });

  const requests = await prisma.request.findMany({
    where,
    include: {
      subcategory: {
        include: { category: true },
      },
      offers: {
        where: { proId }, // Check if pro already offered
      },
      _count: {
        select: { offers: true }, // Count total offers
      },
    },
    orderBy: { createdAt: 'desc' }, // Newest first
    skip: (page - 1) * limit,
    take: limit,
  });

  // 3. Filter out requests with 10+ offers or already offered
  const filtered = requests.filter(req => {
    const offerCount = req._count.offers;
    const alreadyOffered = req.offers.length > 0;
    
    return offerCount < 10 && !alreadyOffered;
  });

  return {
    requests: filtered.map(req => ({
      id: req.id,
      title: req.title,
      description: req.description,
      budget: req.budget,
      location: req.location,
      remoteOk: req.remoteOk,
      preferredDays: req.preferredDays,
      subcategory: {
        name: req.subcategory.name,
        category: { name: req.subcategory.category.name },
      },
      offerCount: req._count.offers,
      createdAt: req.createdAt,
    })),
    total,
  };
}
```

### UI Display

**Matching requests dashboard:**
```
📋 Matching Requests (23)

[Card]
🔹 Need help with React website bug
   Software & Tech > Bug fixing & troubleshooting
   📍 Paris • 💰 €50 budget
   ⏱️ Posted 2 hours ago • 3/10 offers received
   [Send Offer] button

[Card]
🔹 Python automation script needed
   Software & Tech > Automation & scripts
   📍 Remote
   ⏱️ Posted 5 hours ago • 1/10 offers received
   [Send Offer] button
```

### Edge Cases

1. **Pro has no services yet**
   - Return empty array
   - Show message: "Add services to your profile to see matching requests"

2. **Pro location is null**
   - Only show requests with remoteOk = true
   - Encourage pro to add location

3. **All requests have 10 offers**
   - Show empty state: "No matching requests right now. Check back later!"

---

## 4. Review Eligibility & Submission

### Purpose
Ensure clients can only review professionals after job completion, one review per job.

### Eligibility Rules

A client can submit a review if:
1. ✅ Job status is COMPLETED
2. ✅ Job belongs to this client
3. ❌ No review already exists for this job
4. ✅ Review content passes moderation

### Algorithm (TypeScript)

```typescript
async function submitReview(
  clientId: string,
  data: {
    jobId: string;
    rating: number;
    title?: string;
    content: string;
    tags?: string[];
    wouldRecommend: boolean;
  }
): Promise<{ review: any }> {
  
  // 1. Validate job
  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
    include: {
      review: true,
      offer: { include: { pro: true } },
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.clientId !== clientId) {
    throw new Error('Not your job');
  }

  if (job.status !== 'COMPLETED') {
    throw new Error('Job must be completed before reviewing');
  }

  if (job.review) {
    throw new Error('You have already reviewed this job');
  }

  // 2. Validate review content
  if (data.content.length < 30) {
    throw new Error('Review content must be at least 30 characters');
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // 3. Content moderation (Google Perspective API)
  const toxicityScore = await checkContentToxicity(data.content);
  const isFlagged = toxicityScore > 0.8;

  // 4. Create review
  const review = await prisma.review.create({
    data: {
      jobId: data.jobId,
      clientId,
      proId: job.proId,
      rating: data.rating,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      wouldRecommend: data.wouldRecommend,
      isFlagged,
      flaggedReason: isFlagged ? `High toxicity score: ${toxicityScore}` : null,
    },
  });

  // 5. If flagged, add to moderation queue
  if (isFlagged) {
    await prisma.moderationQueue.create({
      data: {
        contentType: 'REVIEW',
        contentId: review.id,
        flaggedReason: `High toxicity score: ${toxicityScore}`,
        toxicityScore,
      },
    });
  }

  // 6. Update professional's average rating
  await updateProfessionalRating(job.proId);

  return { review };
}

async function updateProfessionalRating(proId: string): Promise<void> {
  // Calculate average rating from all reviews
  const result = await prisma.review.aggregate({
    where: { proId, isFlagged: false }, // Exclude flagged reviews
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.professionalProfile.update({
    where: { id: proId },
    data: {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.id,
    },
  });
}
```

### Content Moderation (Google Perspective API)

```typescript
async function checkContentToxicity(text: string): Promise<number> {
  const API_KEY = process.env.GOOGLE_PERSPECTIVE_API_KEY;
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      comment: { text },
      requestedAttributes: { TOXICITY: {} },
      languages: ['en', 'fr'],
    }),
  });

  const data = await response.json();
  const score = data.attributeScores.TOXICITY.summaryScore.value;
  
  return score; // 0.0 to 1.0 (higher = more toxic)
}
```

### Moderation Thresholds

- **< 0.5**: Auto-approve (no flag)
- **0.5 - 0.8**: Auto-approve but log for monitoring
- **> 0.8**: Flag for admin review, still visible but marked

### UI Flow

```
[Job Completed] → [Leave Review button]
  ↓
[Review Form]
  - Star rating (1-5) *required
  - Title (optional)
  - Review text (min 30 chars) *required
  - Tags: [on time] [professional] [great communication]
  - "Would recommend?" checkbox
  ↓
[Submit] → Moderation check
  ↓
✅ Auto-approved → Shows on pro profile immediately
❌ Flagged → Shows with "Under review" badge
```

---

## 5. Offer Limit Enforcement

### Purpose
Limit each request to maximum 10 offers (requirements specification).

### Algorithm (TypeScript)

```typescript
async function sendOffer(
  proId: string,
  data: {
    requestId: string;
    price: number;
    message: string;
    availableSlots?: string;
  }
): Promise<{ offer: any }> {
  
  // 1. Validate request
  const request = await prisma.request.findUnique({
    where: { id: data.requestId },
    include: {
      _count: { select: { offers: true } },
    },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'OPEN') {
    throw new Error('Request is no longer open');
  }

  // 2. Check offer limit
  if (request._count.offers >= 10) {
    throw new Error('This request has reached the maximum of 10 offers');
  }

  // 3. Check if pro already offered
  const existingOffer = await prisma.offer.findUnique({
    where: {
      requestId_proId: {
        requestId: data.requestId,
        proId,
      },
    },
  });

  if (existingOffer) {
    throw new Error('You have already sent an offer for this request');
  }

  // 4. Validate offer data
  if (data.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  if (data.message.length < 20) {
    throw new Error('Message must be at least 20 characters');
  }

  // 5. Create offer
  const offer = await prisma.offer.create({
    data: {
      requestId: data.requestId,
      proId,
      price: data.price,
      message: data.message,
      availableSlots: data.availableSlots,
      status: 'PENDING',
    },
  });

  // 6. Send email notification to client
  await sendEmailNotification(
    request.clientId,
    'new-offer',
    { requestTitle: request.title, proId }
  );

  return { offer };
}
```

### UI Handling

**When request has 10 offers:**
```
❌ This request has received the maximum number of offers (10/10)
```

Show this in:
- Matching requests list (disable "Send Offer" button)
- Offer submission form (prevent submission)

---

## 6. Wallet Minimum Balance Enforcement

### Purpose
Professionals need minimum €2 in wallet to stay active and receive clicks.

### When to Check

Check wallet balance:
1. Before showing pro in search results
2. Before charging for profile view click
3. When displaying pro in matching requests (for clients)

### Algorithm (TypeScript)

```typescript
const MINIMUM_BALANCE_CENTS = 200; // €2.00

async function isWalletSufficient(proId: string): Promise<boolean> {
  const wallet = await prisma.wallet.findUnique({
    where: { proId },
  });

  return wallet && wallet.balanceCents >= MINIMUM_BALANCE_CENTS;
}

// Filter professionals in search
async function searchProfessionals(filters: any) {
  const professionals = await prisma.professionalProfile.findMany({
    where: {
      isActive: true,
      // ... other filters
    },
    include: { wallet: true },
  });

  // Filter by wallet balance
  return professionals.filter(pro => 
    pro.wallet && pro.wallet.balanceCents >= MINIMUM_BALANCE_CENTS
  );
}
```

### UI Warnings

**For professionals:**
```
⚠️ Your wallet balance is low (€1.50 remaining)
You need at least €2.00 to receive profile views.
[Top Up Wallet] button
```

**When balance reaches €0:**
```
❌ Your wallet balance is €0.00
Your profile is hidden from search until you top up.
[Top Up Now] button
```

---

## 7. Job Acceptance Flow

### Purpose
When client accepts an offer, create a job and reveal phone numbers.

### Algorithm (TypeScript)

```typescript
async function acceptOffer(
  clientId: string,
  requestId: string,
  offerId: string
): Promise<{
  job: any;
  clientPhone: string;
  proPhone: string;
}> {
  
  // 1. Validate offer
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      request: true,
      pro: { include: { user: true } },
    },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  if (offer.request.clientId !== clientId) {
    throw new Error('Not your request');
  }

  if (offer.status !== 'PENDING') {
    throw new Error('Offer already accepted or rejected');
  }

  // 2. Get client phone
  const clientUser = await prisma.user.findFirst({
    where: {
      clientProfile: { id: clientId },
    },
  });

  // 3. Create job and update statuses
  const job = await prisma.$transaction([
    // Create job
    prisma.job.create({
      data: {
        requestId,
        offerId,
        clientId,
        proId: offer.proId,
        status: 'ACCEPTED',
      },
    }),

    // Update offer status
    prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    }),

    // Close request
    prisma.request.update({
      where: { id: requestId },
      data: { status: 'CLOSED' },
    }),

    // Reject all other pending offers for this request
    prisma.offer.updateMany({
      where: {
        requestId,
        status: 'PENDING',
        id: { not: offerId },
      },
      data: { status: 'REJECTED' },
    }),
  ]);

  // 4. Send notifications
  await sendEmailNotification(offer.proId, 'offer-accepted', {
    requestTitle: offer.request.title,
    clientPhone: clientUser.phone,
  });

  // 5. Return phone numbers
  return {
    job: job[0],
    clientPhone: clientUser.phone,
    proPhone: offer.pro.user.phone,
  };
}
```

### UI Flow

```
[Client views offers] → [View Profile] → €0.10 charged
  ↓
[Profile modal opens]
  ↓
[Accept Offer] button
  ↓
Job created → Phone numbers revealed

╔══════════════════════════════════╗
║ ✅ Offer Accepted!               ║
║                                  ║
║ Contact details:                 ║
║ Your number: +33 6 12 34 56 78  ║
║ Pro's number: +33 6 98 76 54 32  ║
║                                  ║
║ Please contact each other to     ║
║ finalize the details.            ║
╚══════════════════════════════════╝
```

---

## Next: Frontend Pages

Proceed to `05-frontend-pages.md` to see all pages and components specifications.