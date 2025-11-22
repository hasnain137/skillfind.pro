# SkillFind.pro - Complete Implementation Plan

## Project Overview

**Project**: SkillFind.pro - Two-sided marketplace connecting clients with verified professionals  
**Deadline**: Mid-January 2025 (7 weeks)  
**Developer**: Solo, beginner backend, intermediate frontend  
**Client**: French university client  
**Tech Stack**: Next.js, TypeScript, Tailwind, Supabase, Prisma, Stripe, Clerk

---

## 📁 Documentation Structure

This implementation plan is split into multiple files for better organization:

1. **00-main-plan.md** (this file) - Overview and timeline
2. **01-tech-stack.md** - All technology decisions and justifications
3. **02-database-schema.md** - Complete Prisma schema with relationships
4. **03-api-endpoints.md** - All API endpoints by role with specs
5. **04-business-logic.md** - Critical business rules and algorithms
6. **05-frontend-pages.md** - All pages and components specification
7. **06-implementation-steps.md** - Week-by-week implementation guide

---

## 🎯 Critical Project Constraints

### Must-Haves (Non-Negotiable)
- All features from `/docs/skillfind.pro_requirement` must be implemented
- Pay-per-click system (€0.10 per profile view from offer)
- Wallet system with Stripe integration (test mode OK)
- Profile completion tracking for professionals
- Request → Offer → Job → Review flow
- Basic admin panel for moderation
- Email verification (no phone verification due to cost)
- 18+ age gate on signup

### Can Be Simplified
- ID verification: Mock UI first, real iDenfy integration optional
- Search: PostgreSQL full-text search (no Elasticsearch)
- Translation: Hardcoded English + French (no AI auto-translate)
- Analytics: Basic SQL queries (no separate analytics service)
- Chatbot: Skip entirely
- Real-time features: Not needed (clients/pros exchange numbers after job accepted)

### Budget Constraints
- Use free tiers wherever possible
- Can pay for services if they save significant development time
- Stripe test mode (no real money processing required for demo)
- Skip phone SMS verification (costs money)

---

## 📅 7-Week Implementation Timeline

### Week 1 (Nov 25 - Dec 1): Foundation & Setup
**Goal**: Project infrastructure ready, users can sign up

**Tasks**:
- [ ] Supabase project setup (database + storage)
- [ ] Clerk authentication integration
- [ ] Prisma schema definition and first migration
- [ ] Basic Next.js API route structure
- [ ] User roles (CLIENT/PRO/ADMIN) implementation
- [ ] Seed script for categories/subcategories

**Deliverable**: Users can sign up, log in, and see their role-based dashboard skeleton

---

### Week 2 (Dec 2 - Dec 8): Client Flow
**Goal**: Clients can post and manage requests

**Tasks**:
- [ ] Client dashboard with request list
- [ ] Create request form (category, description, budget, location, remote option)
- [ ] Request detail page
- [ ] Request status tracking (OPEN/CLOSED)
- [ ] Form validation (client + server side)

**Deliverable**: Clients can create and view their service requests

---

### Week 3 (Dec 9 - Dec 15): Professional Profile & Verification
**Goal**: Pros can create complete profiles

**Tasks**:
- [ ] Pro profile creation/editing page
- [ ] Service selection (link to subcategories)
- [ ] File upload for verification docs (Supabase Storage)
- [ ] Profile completion % calculation
- [ ] Mock verification badges (can toggle in dev mode)
- [ ] Bio, pricing, location fields

**Deliverable**: Pros can create profiles and see completion percentage

---

### Week 4 (Dec 16 - Dec 22): Matching & Offers
**Goal**: Complete request → offer flow (without payment)

**Tasks**:
- [ ] Matching logic (pros see relevant requests based on services + location)
- [ ] Pro can send offers (max 10 per request limit)
- [ ] Offer form (price, message, availability)
- [ ] Client sees offers on request detail page
- [ ] Client can view pro profile from offer preview
- [ ] Offer status tracking

**Deliverable**: Full marketplace flow works (request → offer → view profile)

---

### Week 5 (Dec 23 - Dec 29): Wallet & Payment System
**Goal**: Pay-per-click system fully functional

**Tasks**:
- [ ] Stripe integration (test mode)
- [ ] Wallet table and UI
- [ ] Wallet top-up flow (Stripe Checkout)
- [ ] Click tracking when client views pro profile from offer
- [ ] €0.10 charge deduction on profile view
- [ ] Minimum €2 balance enforcement
- [ ] Transaction history display

**Deliverable**: Payment system works end-to-end (top-up → click → charge)

---

### Week 6 (Dec 30 - Jan 5): Jobs & Reviews
**Goal**: Complete marketplace cycle with reviews

**Tasks**:
- [ ] Client accepts offer → creates Job
- [ ] Job status tracking (ACCEPTED/COMPLETED)
- [ ] Mark job as completed flow
- [ ] Review form (only after job completed)
- [ ] Review display on pro profiles
- [ ] Average rating calculation
- [ ] Google Perspective API for review moderation
- [ ] Review tags and "would recommend" toggle

**Deliverable**: Full cycle works (request → offer → job → review)

---

### Week 7 (Jan 6 - Jan 12): Admin Panel & Polish
**Goal**: Admin features + final testing

**Tasks**:
- [ ] Admin signup flow (special route or manual DB insert)
- [ ] Admin user management (list, filter, suspend)
- [ ] Moderation queue for flagged content
- [ ] Basic stats dashboard (signups, requests, revenue)
- [ ] Professional search functionality (category, location filters)
- [ ] Error handling improvements across all flows
- [ ] Edge case testing
- [ ] French translations (hardcoded JSON)
- [ ] Final deployment and smoke testing

**Deliverable**: Fully working demo ready for handover

---

### Buffer (Jan 13-15): Final Testing & Demo Prep
- Create 2-3 test accounts (client, pro, admin)
- Test complete user journeys
- Fix critical bugs
- Prepare demo walkthrough notes

---

## 🚀 Getting Started

1. Read all documentation files in order (01-06)
2. Start with Week 1 tasks from `06-implementation-steps.md`
3. Use provided specifications to prompt your AI coding assistant
4. Test each feature as you complete it
5. Commit frequently to git

---

## 📝 Development Approach

### Using AI Coding Assistants
- Copy relevant specifications from these docs
- Provide them to Cursor/Claude Code with context
- Review generated code for correctness
- Test manually before moving to next feature

### When You Get Stuck
- Re-read the specific section in these docs
- Check the requirements file for business rules
- Ask AI to explain the feature in simpler terms
- Break down the task into smaller steps

### Code Quality Standards
- TypeScript strict mode enabled
- Basic error handling (try/catch with error messages)
- Input validation on all forms
- Loading states on async operations
- Empty states when no data exists

---

## 📊 Success Criteria

By January 15th, the platform must:
- ✅ Allow clients to post requests
- ✅ Allow pros to create profiles and send offers
- ✅ Charge €0.10 when client views pro profile from offer
- ✅ Support wallet top-ups via Stripe
- ✅ Allow job completion and reviews
- ✅ Have basic admin moderation panel
- ✅ Be deployed and accessible via URL
- ✅ Handle basic error cases gracefully

---

## 🆘 Emergency Contacts & Resources

**If falling behind schedule**:
- Prioritize payment system (Week 5) - this is the core business model
- Admin panel can be minimal (just user list + basic moderation)
- Search can be simple dropdown filters
- Skip translations if needed

**Key Resources**:
- Supabase docs: https://supabase.com/docs
- Clerk docs: https://clerk.com/docs
- Stripe test mode: https://stripe.com/docs/testing
- Prisma docs: https://www.prisma.io/docs

---

## Next Steps

1. ✅ Read `01-tech-stack.md` to understand all technology choices
2. ⬜ Review `02-database-schema.md` to understand data model
3. ⬜ Scan `03-api-endpoints.md` to see what you'll build
4. ⬜ Begin Week 1 tasks from `06-implementation-steps.md`

**Let's build SkillFind.pro! 🚀**