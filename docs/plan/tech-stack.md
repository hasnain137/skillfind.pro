# Technology Stack Decisions

## Overview

This document explains every technology choice for SkillFind.pro and why it was selected over alternatives.

---

## Core Stack

### Frontend: Next.js 14+ (App Router)

**Chosen**: Next.js with App Router + React + TypeScript + Tailwind CSS

**Why**:
- Already deployed on Vercel
- App Router provides modern patterns (Server Components, Server Actions)
- TypeScript catches errors during development
- Tailwind speeds up styling
- Good for solo developer with AI assistants

**Trade-offs**:
- App Router has learning curve, but AI assistants handle this well
- Server Components add complexity but improve performance

**Alternatives considered**:
- ❌ Separate React SPA: More complex deployment, need separate backend
- ❌ Pages Router: Older pattern, less performant

---

### Backend: Next.js API Routes

**Chosen**: Next.js API Routes (`app/api/*`)

**Why**:
- No separate backend deployment needed
- Same codebase as frontend
- Easy to share TypeScript types
- Vercel handles deployment automatically
- Perfect for solo developer timeline

**Trade-offs**:
- Harder to scale to microservices later (not needed for this project)
- All backend code lives in same repo (actually a benefit for small team)

**Alternatives considered**:
- ❌ Separate Node.js/Express: Adds deployment complexity, overkill for 7 weeks
- ❌ NestJS: Too much boilerplate for solo dev

---

### Database: Supabase (PostgreSQL)

**Chosen**: Supabase managed PostgreSQL

**Why**:
- PostgreSQL is robust and free tier is generous
- Supabase provides database + storage + auth in one platform
- Built-in file storage for documents/photos
- Direct SQL access when needed
- Good admin UI for debugging

**Trade-offs**:
- Vendor lock-in (minimal concern for university project)
- Need separate ORM (Prisma) for type safety

**Alternatives considered**:
- ❌ Vercel Postgres: Less feature-rich than Supabase
- ❌ PlanetScale: No support for foreign keys (deal-breaker)
- ❌ MongoDB: Relational data model fits SQL better

---

### ORM: Prisma

**Chosen**: Prisma ORM

**Why**:
- Best TypeScript support (auto-generated types)
- Easy migrations with `prisma migrate`
- Great with PostgreSQL
- AI assistants understand Prisma syntax well
- Schema-first approach matches planning process

**Trade-offs**:
- Adds slight query overhead (negligible for low traffic)
- Generated client can be large (not a problem with Vercel)

**Alternatives considered**:
- ❌ Raw SQL: No type safety, error-prone for beginner
- ❌ Drizzle: Less mature, fewer AI training examples

---

## Authentication

### Auth: Clerk

**Chosen**: Clerk

**Why**:
- Easiest auth setup (literally 3 lines of code)
- Built-in UI components for login/signup
- Email verification included free
- User management UI out of the box
- Excellent Next.js integration
- Free tier: 10,000 monthly active users

**Trade-offs**:
- Phone verification costs extra (we're skipping this)
- Slightly less control than building custom auth

**Why not Supabase Auth**:
- Supabase Auth requires more manual setup
- Clerk is faster for solo dev with tight deadline
- Clerk UI is more polished out of the box

**Alternatives considered**:
- ❌ NextAuth.js: More setup, have to build UI yourself
- ❌ Supabase Auth: More complex integration
- ❌ Custom auth: Too risky for beginner, takes too long

---

## External Services

### Payments: Stripe

**Chosen**: Stripe (test mode)

**Why**:
- Industry standard for payments
- Excellent documentation and TypeScript support
- Test mode perfect for university demo
- Checkout Sessions make wallet top-up simple
- Can track transactions easily

**Implementation**:
- Use Stripe Checkout for wallet top-ups (hosted payment page)
- Store Stripe Customer ID in User table
- Use Stripe webhooks to confirm payments

**Trade-offs**:
- Slightly complex webhook setup (but well-documented)

**Alternatives considered**:
- ❌ PayPal: Worse developer experience
- ❌ Mock payment: Client might want to see real flow

---

### Email: SendGrid

**Chosen**: SendGrid free tier

**Why**:
- 100 emails/day free forever
- Simple API for transactional emails
- Good deliverability
- Easy template system

**Use cases**:
- Email verification (handled by Clerk)
- Welcome emails
- Offer received notifications
- Job accepted notifications
- Review reminders

**Alternatives considered**:
- ❌ Resend: Good but SendGrid has more features on free tier
- ❌ AWS SES: Requires AWS account, more complex setup

---

### File Storage: Supabase Storage

**Chosen**: Supabase Storage

**Why**:
- Integrated with Supabase database
- Simple upload API
- 1GB free storage
- Direct file URLs with access control

**Use cases**:
- Professional verification documents (ID, diplomas)
- Professional profile photos
- Project portfolio images

**Alternatives considered**:
- ❌ Vercel Blob: Costs money after small free tier
- ❌ Cloudinary: Overkill for document storage
- ❌ AWS S3: Too complex for solo dev

---

### ID Verification: iDenfy (Mock First)

**Chosen**: iDenfy with mock implementation first

**Implementation approach**:
1. **Phase 1 (Week 3)**: Create mock verification UI
   - Admin can toggle "verified" status manually
   - Display verification badge on profiles
2. **Phase 2 (Optional)**: Real iDenfy integration
   - Only if client specifically requests it
   - Costs ~€1-2 per verification

**Why mock first**:
- iDenfy costs money per verification
- University demo might not need real KYC
- Can show the UI/UX without spending money
- Real integration can be added in 1-2 days if needed

---

### Content Moderation: Google Perspective API

**Chosen**: Google Perspective API (free tier)

**Why**:
- Free for low volume (<1 QPS)
- Detects toxicity, profanity, hate speech
- Simple REST API
- No account setup needed

**Use cases**:
- Review content moderation
- Professional bio moderation
- Flag content for admin review if toxicity > 0.8

**Alternatives considered**:
- ❌ Manual moderation only: Doesn't show technical sophistication
- ❌ OpenAI Moderation API: Costs money, overkill

---

### Search: PostgreSQL Full-Text Search

**Chosen**: PostgreSQL built-in full-text search

**Why**:
- No additional service needed
- Good enough for <1000 professionals
- Prisma supports full-text search queries
- Can index on: service name, bio, location

**Implementation**:
```sql
-- Example search query structure
WHERE 
  (name ILIKE '%query%' OR bio ILIKE '%query%')
  AND category_id = ?
  AND location = ?
```

**When to upgrade**:
- If platform grows to 10,000+ professionals
- If need semantic search or typo tolerance
- Then consider: Meilisearch (easy to self-host) or Algolia

**Alternatives considered**:
- ❌ Elasticsearch: Too complex to set up and maintain
- ❌ Algolia: Costs money, overkill for MVP
- ❌ Meilisearch: Extra deployment, not needed yet

---

## Deployment & Infrastructure

### Hosting: Vercel

**Chosen**: Vercel for Next.js frontend + API

**Why**:
- Zero-config Next.js deployment
- Free tier for hobby projects
- Automatic HTTPS
- Preview deployments for testing
- Already using it

**Trade-offs**:
- API routes have 10-second timeout (fine for this project)
- No long-running background jobs (not needed)

---

### Database Hosting: Supabase Cloud

**Chosen**: Supabase cloud (free tier)

**Why**:
- 500MB database free
- Automatic backups
- No server management

**Free tier limits**:
- 500MB storage (plenty for demo)
- 2GB bandwidth (fine for low traffic)
- Paused after 1 week inactivity (just wake it up)

---

## Development Tools

### AI Coding Assistant

**Recommendation**: Start with **Cursor** for this project

**Why Cursor over Claude Code**:
- Better for iterative development (you'll refine features a lot)
- Can work on specific files/functions
- Composer mode for multi-file changes
- Better for learning (you see the code as it's written)
- Better for debugging (inline errors)

**When to use Claude Code instead**:
- If you get really stuck on a complex feature
- If you need to scaffold a bunch of boilerplate quickly
- For terminal operations (git, migrations, etc.)

**Cursor tips for this project**:
1. Keep context focused (don't select entire codebase)
2. Use Composer for features that span multiple files
3. Commit after each working feature
4. Use chat for quick questions, Composer for implementation

---

### Version Control: Git + GitHub

**Chosen**: Git with GitHub

**Why**:
- Standard for code management
- Free private repos
- Easy to show client your progress
- Vercel auto-deploys from GitHub

**Workflow**:
```bash
git commit -m "feat: add client request creation"
git push origin main  # Auto-deploys to Vercel
```

---

## Not Using (And Why)

### ❌ GraphQL
- REST is simpler for solo dev
- Less setup overhead
- AI assistants handle REST better

### ❌ Redis
- No need for caching with low traffic
- Can add later if needed

### ❌ Message Queue (RabbitMQ, etc.)
- No background jobs needed
- Everything can be synchronous

### ❌ Docker
- Vercel handles deployment
- Local dev works without containers

### ❌ Microservices
- Monolith is perfect for 7-week project
- Can refactor later if client scales

---

## Summary: Tech Stack at a Glance

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | Next.js 14 + React + TypeScript | Free |
| Styling | Tailwind CSS | Free |
| Backend | Next.js API Routes | Free |
| Database | Supabase (PostgreSQL) | Free tier |
| ORM | Prisma | Free |
| Auth | Clerk | Free (10K MAU) |
| Payments | Stripe (test mode) | Free |
| Storage | Supabase Storage | Free (1GB) |
| Email | SendGrid | Free (100/day) |
| Moderation | Google Perspective API | Free |
| Hosting | Vercel | Free (hobby) |
| **Total Monthly Cost** | | **€0** |

---

## Next: Database Schema

Now that you understand the tech choices, proceed to `02-database-schema.md` to see the complete data model.