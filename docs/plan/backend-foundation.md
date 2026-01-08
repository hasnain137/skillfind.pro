# Backend Delivery Plan (Core Marketplace Flows)

Status: planning doc after DB + adapter wiring. Goal: ship a working backend that satisfies core SkillFind marketplace requirements (requests, offers, billing, verification, admin) and supports the existing Next.js app.

## 0) Assumptions and Scope
- Prisma 7 is wired with the pg adapter; DB schema and seed are in place.
- Supabase Postgres is the primary DB; Prisma migrations are canonical.
- Next.js App Router will host API routes (or server actions where appropriate).
- Out of scope for this iteration: full search (Elasticsearch), production-grade chat, full analytics dashboards; we will scaffold stubs where needed.

## 1) Architecture Shape
- Request flow: Next.js API handlers -> domain services -> Prisma repositories -> Postgres.
- Auth: Clerk middleware for session + claims; enforce 18+ and verified email/phone gates in services.
- Billing: wallet + transactions in DB; click-fee debits via a service layer with concurrency safety (transaction + row-level lock).
- Moderation: Perspective API adapter (stub initially), flagged items queue for admin.
- Notifications: SendGrid adapter (stub initially) with enqueue + send pathways.
- Background work: lightweight job queue via Postgres table + cron (serverless-friendly) for retries and deferred tasks (emails, moderation).
- Config: feature flags and fee thresholds from platform settings table (already seeded).

## 2) Domains and Services (by requirement)
1) Identity and Verification
   - Enforce 18+, email verified, phone verified for both client/pro creation.
   - Pro activation requires iDenfy status = verified; add a verification status field and audit trail.
   - Profile completion service to compute % based on required steps (photo, bio, services, remote availability, wallet connected, terms accepted).
2) Categories and Matching
   - CRUD for categories/subcategories (admin only).
   - Matching service: find requests for pros by category, subcategory, city/region, remote toggle; exclude closed/expired; cap to first 10 offers per request.
3) Requests (Client)
   - Create request with validation (length, category, location, budget optional).
   - List own requests; view offers; close/cancel request.
4) Offers (Professional)
   - Create offer (message, price, time slots); enforce per-request limit of 10 offers total.
   - Withdraw offer; update offer status when client accepts.
5) Click Billing (PPC)
   - When client clicks an offer/profile view: record click event; deduct 0.10 EUR from pro wallet; enforce daily click limit and min wallet balance (200 cents); prevent double-charge per offer per client.
6) Wallet and Transactions
   - Transaction types: DEPOSIT, DEBIT, REFUND, ADMIN_ADJUSTMENT.
   - Balance computed from transactions; disallow negative balance; include optimistic locking in a transaction.
   - Deposit intent: stub Stripe/PayPal integration with placeholder API to create payment links.
7) Phone Reveal (When Chosen)
   - When client accepts an offer/job: mark job accepted; expose phone numbers to both parties; audit the reveal event.
8) Reviews
   - Only after job completion; one review per job; must be from the originating client; moderation status tracked; allow pro response.
9) Moderation
   - Perspective API adapter (stub) for bios, descriptions, reviews; store scores; queue flagged items for admin decision.
10) Admin Panel APIs
    - Manage users (suspend/reactivate), requests, offers, categories, flagged content, wallet adjustments, verification overrides.
    - Click and wallet logs with filters; export-ready endpoints (JSON now, CSV later).
11) Notifications
    - Email templates for welcome, verification reminders, review received, suspension, balance low, click charges summary.
    - Queue table + worker cron to send; simple retry/backoff.

## 3) Cross-Cutting Concerns
- Validation: Zod schemas per endpoint; reuse between client and server.
- Authorization: role-based guards (client/pro/admin); resource ownership checks on requests/offers/jobs.
- Idempotency: offer click billing (dedupe on offerId+clientId), deposits (payment provider id).
- Concurrency: transaction wrappers for wallet debits/credits; SELECT FOR UPDATE on wallet row; enforce offer count limit atomically.
- Observability: structured logs per endpoint; basic metrics counters (custom logging now, hook to provider later).
- Error model: typed errors (Unauthorized, Forbidden, ValidationError, InsufficientBalance, LimitExceeded, NotFound).
- Config: read fee amounts and limits from platform settings; allow overrides via env for non-prod.

## 4) API Surface (initial endpoints)
- Auth/session handled by Clerk middleware.
- Client
  - POST /api/requests
  - GET /api/requests (own)
  - POST /api/requests/{id}/close
  - GET /api/requests/{id}/offers (own)
- Professional
  - GET /api/requests/matching
  - POST /api/offers
  - POST /api/offers/{id}/withdraw
  - POST /api/offers/{id}/click (charge PPC)
  - POST /api/offers/{id}/accept -> creates/updates job, reveals phones
- Reviews
  - POST /api/jobs/{id}/review
  - POST /api/reviews/{id}/respond
- Wallet
  - GET /api/wallet (own)
  - POST /api/wallet/deposit-intent (stub payment link)
  - GET /api/wallet/transactions
- Admin
  - CRUD categories/subcategories
  - GET /api/admin/users (filters: role, verified, city, profile completion)
  - POST /api/admin/users/{id}/suspend|reactivate
  - POST /api/admin/wallet/{id}/adjust
  - GET /api/admin/requests, /offers, /clicks, /transactions
  - POST /api/admin/verification/{proId}/override
  - POST /api/admin/moderation/{itemId}/{approve|reject}

## 5) Data and Business Logic Notes
- Enforce 10-offer cap per request using a transaction and COUNT with lock.
- PPC: charge only once per offer per client; respect daily click limit; reject if balance < minimumWalletBalance.
- Profile completion: compute on read; optionally store cached value to reduce computation.
- Location: store city/region/country; remoteAvailability gates matching.
- Terms acceptance: track timestamp; block offers/requests if not accepted.
- Seed data: ensure platform settings exist; categories/subcategories seeded already.

## 6) Infrastructure and Config
- Environment: DATABASE_URL, DIRECT_URL, CLERK keys, SENDGRID_API_KEY, PERSPECTIVE_API_KEY (optional), STRIPE/PAYPAL stubs, APP_URL, PLATFORM_DEFAULTS (fee, min balance).
- Migration discipline: `prisma migrate dev` locally; `prisma migrate deploy` in deployed envs; regenerate client after schema changes.
- Background jobs: Next.js route handler as cron target (e.g., /api/cron/queue) to process email/moderation queues.

## 7) Testing Strategy
- Unit: service-level tests for wallet debits/credits, offer click idempotency, matching filters, profile completion calculator.
- Integration (DB): exercise API handlers against a test DB (or shadow DB) with Prisma.
- Contract: Zod schema validation; supertest against route handlers.
- Seeded fixtures: reuse prisma/seed.ts or a trimmed test seed for deterministic tests.

## 8) Delivery Plan (sequenced)
1) Scaffolding
   - Add Zod schemas for all request/response shapes.
   - Add shared error helpers and auth guard utilities.
2) Core flows
   - Requests CRUD (client) and matching (pro).
   - Offers create/withdraw/list; enforce 10-offer cap.
   - Click billing endpoint with wallet debit + limit checks.
3) Wallet
   - Wallet read endpoints and transaction history.
   - Deposit intent stub endpoint.
4) Acceptance and phone reveal
   - Accept offer -> create/update job -> reveal phones.
5) Reviews
   - Post-review + pro response; gate on job completion.
6) Moderation and notifications (stubs)
   - Perspective adapter stub; flagging pipeline; SendGrid adapter stub; queue processor.
7) Admin APIs
   - User suspend/reactivate, wallet adjustments, category CRUD, verification override, moderation decisions, logs.
8) Hardening
   - Concurrency tests for wallet/offer caps; rate limits on sensitive endpoints; audit logging.

## 9) Success Criteria
- All listed endpoints implemented with validation, auth, and business rules (offer cap, PPC charge, min balance, daily click limit).
- Wallet debits are atomic and idempotent per click.
- Requests and offers reflect matching rules (category, subcategory, location/remote).
- Reviews restricted to completed jobs; moderation flags stored.
- Admin endpoints can suspend users, adjust wallets, manage categories, and approve/deny moderation.
- Basic notification and moderation stubs exist with room to swap real providers.

