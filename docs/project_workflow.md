# SkillFind.pro - Project Workflow & Execution Plan

**Last Updated:** 2025-11-19  
**Estimated Timeline:** 3-4 weeks for MVP, 4-6 weeks for production-ready

---

## Executive Summary

### Quick Start Guide (TL;DR)

**How many "agents" do I need?**
- **Answer:** You don't create separate agents. You use ONE AI and give it different roles via prompts.
- **90% of the time:** Use 1 agent (one prompt at a time)
- **10% of the time:** Use 2 agents (two separate chats for independent tasks)
- **Never:** Use 3+ agents (too overwhelming)

**Daily workflow:**
1. Pick one task
2. Give AI a role via prompt: "You are the Backend Engineer..."
3. Complete task, test it
4. Move to next task

**That's it. Keep it simple.**

### Timeline Estimate

**With AI-assisted development in Cursor:**
- **Week 1-2:** Foundation (Database, Auth, Core Infrastructure)
- **Week 2-3:** Core Features (Client Flow, Professional Flow, Matching)
- **Week 3-4:** Integrations (Payments, Search, Moderation, i18n)
- **Week 4-5:** Admin Panel & Polish
- **Week 5-6:** Testing, Refinement, Production Prep

**Total: 4-6 weeks for production-ready MVP with all required features**

This assumes:
- Working full-time with AI assistance
- Sequential development (one task at a time)
- Clear architecture defined upfront
- Incremental feature delivery

---

## Project Phases Overview

### Phase 1: Foundation & Architecture (Days 1-5)
**Focus:** Database, Authentication, Core Infrastructure  
**Agents:** Lead Architect, Database Engineer, Backend Engineer

### Phase 2: Core User Flows (Days 6-12)
**Focus:** Client Request Flow, Professional Flow, Matching System  
**Agents:** Backend Engineer, Frontend Engineer, API Specialist

### Phase 3: Integrations & Advanced Features (Days 13-18)
**Focus:** Payments, Search, Moderation, i18n, Chat  
**Agents:** Integration Specialist, Backend Engineer, Frontend Engineer

### Phase 4: Admin Panel (Days 19-23)
**Focus:** All Admin Modules  
**Agents:** Full-Stack Engineer, Admin UI Specialist

### Phase 5: Polish & Production (Days 24-30)
**Focus:** Testing, Performance, Security, Deployment  
**Agents:** QA Engineer, DevOps Engineer, Security Specialist

---

## Cursor Multi-Agent Workflow Strategy

### ⚠️ IMPORTANT: How Many Agents to Use

**You DON'T need to create separate agents.** Cursor works with one AI that you give different roles via prompts.

**Practical Approach:**
- **90% of the time:** Work with **1 agent** at a time (sequential workflow)
- **10% of the time:** Work with **2 agents** in parallel (only when work is truly independent)
- **Never:** Run 3+ agents simultaneously (too overwhelming)

**When to use 2 agents in parallel:**
- Backend API + Frontend UI (if API is already defined/stable)
- Two completely independent integrations (e.g., Stripe + PayPal setup)
- Backend service + Database schema changes (if schema is well-defined)

**When to work sequentially (1 agent):**
- Most feature development (API → Service → Frontend)
- Most integrations (one at a time)
- Any work where one part depends on another

**Bottom Line:** Start with 1 agent. Only use 2 when you have clear, independent tasks.

### Core Principle
**One Prompt = One Role**  
Each prompt should give the AI a specific role/specialization to maintain consistency.

### Agent Roles & Responsibilities

#### 1. Lead System Architect
**Role:** Overall architecture, database design, API contracts, integration patterns  
**Tools:** Architecture docs, TypeScript types, Prisma schemas  
**Deliverables:**
- Complete architecture.md
- Database schema (Prisma)
- API contracts
- Integration specifications
- Type definitions

**When to use:**
- At project start (architecture definition)
- Before major features (contracts/patterns)
- When adding new integrations
- For architectural decisions

**Cursor Commands:**
```
@docs/architecture.md @docs/skillfind.pro_requirements
You are the Lead System Architect. Design the [specific feature/module] architecture following the requirements. Produce only architecture, contracts, and types - no implementation code.
```

#### 2. Backend Engineer
**Role:** API routes, services, repositories, business logic  
**Tools:** Next.js API routes, Prisma, server utilities  
**Deliverables:**
- API route handlers
- Service layer logic
- Repository implementations
- Business rule enforcement

**When to use:**
- Building API endpoints
- Implementing business logic
- Database operations
- Validation & security

**Cursor Commands:**
```
@docs/architecture.md @src/server/services
You are the Backend Engineer. Implement the [feature] service following the architecture. Include validation, error handling, and business logic per requirements.
```

#### 3. Frontend Engineer
**Role:** React components, pages, UI, user interactions  
**Tools:** Next.js App Router, shadcn/ui, React hooks  
**Deliverables:**
- Page components
- Feature components
- UI components (when shadcn not available)
- Client-side state management

**When to use:**
- Building user-facing features
- Creating components
- Implementing forms
- Client-side interactions

**Cursor Commands:**
```
@docs/architecture.md @src/components @src/types
You are the Frontend Engineer. Build the [feature] UI following the architecture and design system. Use shadcn/ui components where possible. Ensure type safety.
```

#### 4. Integration Specialist
**Role:** External API integrations (Firebase, iDenfy, Stripe, PayPal, Elasticsearch, etc.)  
**Tools:** SDK documentation, API clients, webhook handlers  
**Deliverables:**
- Integration clients
- Webhook handlers
- Configuration setup
- Error handling for external APIs

**When to use:**
- Adding new integrations
- Troubleshooting integration issues
- Webhook implementations
- Third-party API connections

**Cursor Commands:**
```
@docs/architecture.md @docs/integrations
You are the Integration Specialist. Implement [Service Name] integration following the architecture. Handle errors, webhooks, and edge cases.
```

#### 5. Database Engineer
**Role:** Prisma schema, migrations, queries, indexes  
**Tools:** Prisma, database optimization  
**Deliverables:**
- Prisma schema updates
- Migration files
- Query optimizations
- Index strategies

**When to use:**
- Schema changes
- Performance issues
- Complex queries
- Data modeling decisions

**Cursor Commands:**
```
@docs/architecture.md @prisma/schema.prisma
You are the Database Engineer. Update the Prisma schema for [feature]. Add necessary indexes, relationships, and constraints per architecture.
```

#### 6. Full-Stack Engineer
**Role:** End-to-end features, connecting frontend/backend  
**Tools:** All layers  
**Deliverables:**
- Complete features (frontend + backend)
- Integration testing
- Feature completion

**When to use:**
- Completing end-to-end features
- Connecting components
- Integration testing
- Bug fixes across layers

**Cursor Commands:**
```
@docs/architecture.md @src
You are the Full-Stack Engineer. Implement the complete [feature] from frontend to backend following the architecture. Ensure all layers work together.
```

#### 7. Admin UI Specialist
**Role:** Admin panel components, data tables, analytics  
**Tools:** Admin UI patterns, data visualization  
**Deliverables:**
- Admin components
- Data tables with filters
- Analytics dashboards
- Export functionality

**When to use:**
- Building admin features
- Data visualization
- Complex tables/filters
- Admin workflows

**Cursor Commands:**
```
@docs/architecture.md @src/app/(admin)
You are the Admin UI Specialist. Build the admin [module] following the architecture. Include filters, actions, and data visualization.
```

#### 8. QA Engineer
**Role:** Testing, bug finding, edge cases  
**Tools:** Test frameworks, manual testing  
**Deliverables:**
- Test cases
- Bug reports
- Edge case documentation
- Test coverage

**When to use:**
- After feature completion
- Before production
- Bug reproduction
- Edge case testing

**Cursor Commands:**
```
@src @docs/requirements_summary.md
You are the QA Engineer. Test the [feature] against requirements. Identify bugs, edge cases, and missing validations. Provide detailed bug reports.
```

---

## Detailed Workflow: Phase by Phase

### Phase 1: Foundation & Architecture (Days 1-5)

#### Day 1: Architecture & Planning
**Agent: Lead System Architect**

**Tasks:**
1. Create complete `docs/architecture.md` with:
   - Full folder structure
   - Database schema (Prisma)
   - API contracts (all endpoints)
   - Type definitions
   - Integration specifications

**Cursor Approach:**
```
@docs/skillfind.pro_requirements @docs/requirements_summary.md
You are the Lead System Architect. Create a complete architecture document covering all aspects of SkillFind.pro. Include database schema, API contracts, folder structure, and integration patterns. NO CODE - architecture only.
```

**Output:** Complete architecture.md ready for implementation

#### Day 2: Database Setup
**Agent: Database Engineer + Lead System Architect**

**Tasks:**
1. Initialize Prisma
2. Create schema.prisma with all models
3. Generate initial migration
4. Set up database connection

**Cursor Approach:**
```
@docs/architecture.md @prisma
You are the Database Engineer. Set up Prisma schema following the architecture. Create all models, relationships, indexes, and constraints as specified.
```

#### Day 3-4: Authentication Infrastructure
**Agent: Backend Engineer + Integration Specialist**

**Tasks:**
1. Firebase Auth setup (email + phone)
2. JWT token management
3. Auth middleware
4. User registration/login flows

**Parallel Streams:**
- **Stream A:** Backend Engineer → Auth API routes, JWT logic
- **Stream B:** Integration Specialist → Firebase setup, configuration

**Cursor Approach:**
```
Stream A:
@docs/architecture.md @src/server/api/auth
You are the Backend Engineer. Implement authentication API routes (register, login, verify) following the architecture. Use Firebase for verification.

Stream B:
@docs/architecture.md @src/lib/integrations/firebase
You are the Integration Specialist. Set up Firebase Auth integration for email and phone verification following the architecture.
```

#### Day 5: Core Types & Utilities
**Agent: Backend Engineer + Frontend Engineer**

**Tasks:**
1. Create all type definitions
2. API client utilities
3. Validation utilities
4. Error handling

**Cursor Approach:**
```
@docs/architecture.md @src/types @src/lib
You are the Backend Engineer. Create all TypeScript types and utility functions following the architecture. Ensure type safety across the application.
```

**Phase 1 Output:** Solid foundation ready for feature development

---

### Phase 2: Core User Flows (Days 6-12)

#### Day 6-7: Client Request Flow
**Agent: Full-Stack Engineer**

**Tasks:**
1. Service request creation (API + UI)
2. Request posting form
3. Request listing page
4. Request detail page

**Cursor Approach:**
```
@docs/architecture.md @src/app/(dashboard)/client/requests
You are the Full-Stack Engineer. Implement the complete client request posting flow: API endpoint, service logic, and UI components following the architecture.
```

#### Day 8-9: Professional Onboarding & Verification
**Agent: Full-Stack Engineer + Integration Specialist**

**Tasks:**
1. Professional registration flow
2. 8-step verification checklist
3. Profile completion tracking
4. iDenfy integration

**Parallel Streams:**
- **Stream A:** Full-Stack Engineer → Onboarding UI, profile completion logic
- **Stream B:** Integration Specialist → iDenfy integration, webhook handling

**Cursor Approach:**
```
Stream A:
@docs/architecture.md @src/app/(dashboard)/professional/onboarding
You are the Full-Stack Engineer. Build the professional onboarding flow with 8-step verification checklist and profile completion tracking.

Stream B:
@docs/architecture.md @src/lib/integrations/idenfy
You are the Integration Specialist. Implement iDenfy ID verification integration with webhook handling for verification status updates.
```

#### Day 10-11: Matching System & Offer Flow
**Agent: Backend Engineer + Frontend Engineer**

**Tasks:**
1. Matching algorithm (category, location, remote)
2. Professional dashboard (matching requests)
3. Offer submission (API + UI)
4. First 10 professionals limit

**Parallel Streams:**
- **Stream A:** Backend Engineer → Matching service, offer API
- **Stream B:** Frontend Engineer → Professional dashboard, offer form

**Cursor Approach:**
```
Stream A:
@docs/architecture.md @src/server/services/matching.service.ts
You are the Backend Engineer. Implement the matching system that matches requests to professionals based on category, subcategory, location, and remote availability. Include first-10-offers logic.

Stream B:
@docs/architecture.md @src/app/(dashboard)/professional/requests
You are the Frontend Engineer. Build the professional dashboard showing matching requests with ability to submit offers. Follow the architecture.
```

#### Day 12: Client Offer Viewing & Click Flow
**Agent: Full-Stack Engineer**

**Tasks:**
1. Client offer listing page
2. Offer preview component
3. Click offer → profile view (triggers billing)
4. Pay-per-click billing logic

**Cursor Approach:**
```
@docs/architecture.md @src/app/(dashboard)/client/offers
You are the Full-Stack Engineer. Implement the client offer viewing flow with click-to-view triggering €0.10 pay-per-click billing. Follow the architecture.
```

**Phase 2 Output:** Core marketplace flows operational

---

### Phase 3: Integrations & Advanced Features (Days 13-18)

#### Day 13-14: Wallet & Payment System
**Agent: Integration Specialist + Backend Engineer**

**Tasks:**
1. Stripe integration
2. PayPal integration
3. Wallet service
4. Transaction logging
5. Daily budget limits

**Parallel Streams:**
- **Stream A:** Integration Specialist → Stripe/PayPal setup, payment processing
- **Stream B:** Backend Engineer → Wallet service, transaction logic

**Cursor Approach:**
```
Stream A:
@docs/architecture.md @src/lib/integrations/stripe @src/lib/integrations/paypal
You are the Integration Specialist. Set up Stripe and PayPal integrations for wallet top-ups and payment processing following the architecture.

Stream B:
@docs/architecture.md @src/server/services/wallet.service.ts
You are the Backend Engineer. Implement wallet service with transaction logging, daily limits, and pay-per-click billing logic (€0.10 per click).
```

#### Day 15: Search System (Elasticsearch)
**Agent: Integration Specialist + Backend Engineer**

**Tasks:**
1. Elasticsearch setup
2. Index creation (professionals, services)
3. Search API
4. Typo tolerance configuration

**Cursor Approach:**
```
@docs/architecture.md @src/lib/integrations/elasticsearch
You are the Integration Specialist. Set up Elasticsearch integration for search functionality. Configure indexes for professionals and services with typo tolerance and partial matching.
```

#### Day 16: Content Moderation (Perspective API)
**Agent: Integration Specialist + Backend Engineer**

**Tasks:**
1. Google Perspective API integration
2. Moderation service (reviews, bios, descriptions)
3. Threshold logic (block/flag)
4. Admin moderation queue

**Cursor Approach:**
```
@docs/architecture.md @src/lib/integrations/perspective
You are the Integration Specialist. Implement Google Perspective API integration for content moderation. Set up threshold logic: block highly toxic, flag medium-risk for admin review.
```

#### Day 17: Chat System
**Agent: Full-Stack Engineer**

**Tasks:**
1. Chat API (message threads, messages)
2. Chat UI components
3. Real-time updates (if using WebSockets)
4. Message persistence

**Cursor Approach:**
```
@docs/architecture.md @src/app/(dashboard)/messages
You are the Full-Stack Engineer. Implement the chat system between clients and professionals: API endpoints, service logic, and UI components following the architecture.
```

#### Day 18: Multilingual System (i18n + AI Translation)
**Agent: Integration Specialist + Frontend Engineer**

**Tasks:**
1. i18n setup (translation keys)
2. Language detection (IP-based)
3. ChatGPT 4o integration for translation
4. Language switcher UI
5. Content translation service

**Parallel Streams:**
- **Stream A:** Integration Specialist → ChatGPT 4o integration, translation service
- **Stream B:** Frontend Engineer → i18n setup, language switcher

**Cursor Approach:**
```
Stream A:
@docs/architecture.md @src/lib/integrations/openai
You are the Integration Specialist. Set up ChatGPT 4o integration for AI-powered content translation. Create translation service that translates user-generated content on the fly.

Stream B:
@docs/architecture.md @src/lib/i18n
You are the Frontend Engineer. Set up i18n system with translation keys. Implement language detection (IP-based) and manual language switcher UI.
```

**Phase 3 Output:** All integrations and advanced features complete

---

### Phase 4: Admin Panel (Days 19-23)

#### Day 19: Admin Infrastructure
**Agent: Backend Engineer + Admin UI Specialist**

**Tasks:**
1. Admin authentication/authorization
2. Admin layout/navigation
3. Admin API middleware
4. Admin dashboard structure

**Cursor Approach:**
```
@docs/architecture.md @src/app/(admin)
You are the Admin UI Specialist. Set up admin panel infrastructure: layout, navigation, routes, and authentication following the architecture.
```

#### Day 20: User Management Module
**Agent: Admin UI Specialist**

**Tasks:**
1. Professional management (filters, actions)
2. Client management (filters, actions)
3. User detail views
4. Suspend/reactivate/delete actions

**Cursor Approach:**
```
@docs/architecture.md @src/app/(admin)/users
You are the Admin UI Specialist. Build the user management module: professional and client management with filtering, viewing, editing, suspending, and deleting capabilities.
```

#### Day 21: Content Moderation & Verification Module
**Agent: Admin UI Specialist**

**Tasks:**
1. Flagged content queue (reviews, bios, descriptions)
2. ID verification logs (iDenfy)
3. Approve/reject/edit actions
4. Admin override for verification

**Cursor Approach:**
```
@docs/architecture.md @src/app/(admin)/moderation
You are the Admin UI Specialist. Build the content moderation module: flagged content queue, ID verification logs, and moderation actions following the architecture.
```

#### Day 22: Analytics, Requests & Offers, Categories
**Agent: Admin UI Specialist**

**Tasks:**
1. Analytics & Reports (daily signups, requests, trends, exports)
2. Request & Offer Management (listing, spam removal, flagging)
3. Services & Category Manager (CRUD, display order, icons)

**Parallel Streams:**
- **Stream A:** Analytics dashboard
- **Stream B:** Request/Offer management
- **Stream C:** Category manager

**Cursor Approach:**
```
@docs/architecture.md @src/app/(admin)/analytics
You are the Admin UI Specialist. Build the analytics and reports module with daily metrics, trends, and CSV/PDF export functionality.

@docs/architecture.md @src/app/(admin)/requests-offers
You are the Admin UI Specialist. Build the request and offer management module with listing, spam removal, and flagging capabilities.

@docs/architecture.md @src/app/(admin)/categories
You are the Admin UI Specialist. Build the services and category manager with CRUD operations, display order, icons, and suggested services.
```

#### Day 23: Advertising & Communications
**Agent: Admin UI Specialist + Integration Specialist**

**Tasks:**
1. Advertising Management (campaigns, Stripe payment links, stats)
2. Platform Communications (mass emails via SendGrid, triggered emails)
3. Global Settings (click fee, wallet threshold, moderation thresholds)

**Parallel Streams:**
- **Stream A:** Advertising management
- **Stream B:** Communications (SendGrid integration)

**Cursor Approach:**
```
Stream A:
@docs/architecture.md @src/app/(admin)/advertising
You are the Admin UI Specialist. Build the advertising management module: create campaigns, generate Stripe payment links, view statistics.

Stream B:
@docs/architecture.md @src/lib/integrations/sendgrid
You are the Integration Specialist. Set up SendGrid integration for mass emails and triggered emails (welcome, suspension, verification failed, review received).
```

**Phase 4 Output:** Complete admin panel operational

---

### Phase 5: Review System & Phone Reveal (Days 24-25)

#### Day 24: Review System
**Agent: Full-Stack Engineer**

**Tasks:**
1. Review submission (after job completion)
2. Review validation (verified client, SkillFind job only)
3. Review form (stars, title, feedback, tags, recommend)
4. Review display on profiles

**Cursor Approach:**
```
@docs/architecture.md @src/app/(dashboard)/client/reviews
You are the Full-Stack Engineer. Implement the review system: submission after job completion, validation rules, review form, and display on professional profiles.
```

#### Day 25: Phone Reveal & Job Completion
**Agent: Backend Engineer + Frontend Engineer**

**Tasks:**
1. Choose professional → phone reveal (both parties)
2. Job completion marking
3. Job completion validation for reviews

**Cursor Approach:**
```
@docs/architecture.md @src/server/services/professional.service.ts
You are the Backend Engineer. Implement phone number reveal logic when client chooses a professional, and job completion tracking.

@docs/architecture.md @src/app/(dashboard)/client/professionals
You are the Frontend Engineer. Build the UI for choosing a professional (triggers phone reveal) and marking job completion.
```

---

### Phase 6: Polish & Production (Days 26-30)

#### Day 26-27: Testing & Bug Fixes
**Agent: QA Engineer + Full-Stack Engineer**

**Tasks:**
1. End-to-end testing of all flows
2. Edge case identification
3. Bug fixes
4. Validation improvements

**Cursor Approach:**
```
@docs/skillfind.pro_requirements @src
You are the QA Engineer. Test all features against requirements. Create comprehensive bug reports with steps to reproduce, expected vs actual behavior.

@src [specific bug file]
You are the Full-Stack Engineer. Fix the bugs identified in the QA report. Ensure all edge cases are handled.
```

#### Day 28: Performance & Optimization
**Agent: Database Engineer + Backend Engineer**

**Tasks:**
1. Database query optimization
2. Index optimization
3. API response time optimization
4. Caching strategy

**Cursor Approach:**
```
@prisma/schema.prisma @src/server
You are the Database Engineer. Review and optimize database queries, indexes, and schema for performance.

@src/server
You are the Backend Engineer. Optimize API endpoints for performance: add caching where appropriate, optimize queries, reduce response times.
```

#### Day 29: Security Audit
**Agent: Backend Engineer (Security Focus)**

**Tasks:**
1. Authentication/authorization review
2. Input validation review
3. SQL injection prevention (Prisma handles this)
4. XSS prevention
5. Rate limiting

**Cursor Approach:**
```
@docs/architecture.md @src/server
You are the Backend Engineer with security focus. Audit all API endpoints for security vulnerabilities: authentication, authorization, input validation, rate limiting.
```

#### Day 30: Deployment Prep & Documentation
**Agent: DevOps Engineer + Lead System Architect**

**Tasks:**
1. Environment variable documentation
2. Deployment configuration
3. Production setup guide
4. API documentation
5. User guides

**Cursor Approach:**
```
@docs @.env.example
You are the DevOps Engineer. Create deployment documentation, environment variable guide, and production setup instructions.

@docs/architecture.md
You are the Lead System Architect. Create API documentation and user guides based on the architecture and requirements.
```

**Phase 6 Output:** Production-ready application

---

## Cursor Best Practices for Multi-Agent Workflow

### 1. Context Management

**Always include:**
- `@docs/architecture.md` - For architectural consistency
- `@docs/skillfind.pro_requirements` - For requirement validation
- Relevant source files - For context understanding

**Example:**
```
@docs/architecture.md @docs/skillfind.pro_requirements @src/server/api/professionals
You are the Backend Engineer. Implement the professional profile API endpoint following the architecture and requirements.
```

### 2. Agent Role Assignment

**Clear role definition in every prompt:**
```
You are the [Role Name]. [Specific task] following the architecture. [Constraints/guidelines].
```

**Bad:**
```
Add authentication
```

**Good:**
```
@docs/architecture.md
You are the Backend Engineer. Implement JWT-based authentication API endpoints following the architecture. Include email and phone verification using Firebase. Ensure proper error handling and type safety.
```

### 3. Incremental Development

**Work in small, testable increments:**
1. Define the feature in architecture (if needed)
2. Implement backend (API + service)
3. Implement frontend (UI + integration)
4. Test end-to-end
5. Move to next feature

### 4. Parallel Development

**When features are independent, work in parallel:**

**Example - Day 13-14:**
- Agent A: Stripe integration (wallet top-ups)
- Agent B: PayPal integration (wallet top-ups)
- Agent C: Wallet service (transaction logic)

**After both done, Agent D integrates them together**

### 5. Type Safety First

**Always reference types:**
```
@docs/architecture.md @src/types
You are the Backend Engineer. Create the service request API endpoint. Use types from @src/types for request/response validation.
```

### 6. Error Handling

**Always specify error handling requirements:**
```
You are the Backend Engineer. Implement [feature] with comprehensive error handling: validation errors (400), authentication errors (401), not found (404), server errors (500). Return structured error responses per architecture.
```

### 7. Testing Strategy

**Test as you build:**
- After each major feature, run QA agent
- Fix bugs immediately before moving forward
- Keep test cases in sync with requirements

### 8. Code Review Pattern

**Before marking feature complete:**
```
@src [feature files] @docs/skillfind.pro_requirements
You are the QA Engineer. Review the [feature] implementation against requirements. Check for: missing validations, edge cases, error handling, type safety, architecture compliance.
```

---

## Daily Workflow Template (Simple, Non-Overwhelming)

### Simplified Approach: One Task at a Time

**Your Daily Pattern:**
1. **Pick ONE task** from the phase you're in
2. **Use ONE agent** (via prompt) to complete it
3. **Test it** before moving on
4. **Repeat** with next task

### Example Day (Sequential - 1 Agent)

**Morning:**
```
Task: Build authentication API endpoint
Prompt: 
@docs/architecture.md @src/server/api/auth
You are the Backend Engineer. Implement the authentication API endpoint following the architecture. Include email and phone verification.

[Wait for completion, test it, then move to next task]
```

**Afternoon:**
```
Task: Build login UI form
Prompt:
@docs/architecture.md @src/app/(auth)/login
You are the Frontend Engineer. Build the login UI form that calls the authentication API. Use shadcn/ui components.

[Wait for completion, test it, done for day]
```

### Example Day (Parallel - 2 Agents) - Only When Independent

**When to use:** Two completely independent tasks (e.g., setting up two different integrations)

**Morning:**
```
Task 1 (New Cursor Chat): Stripe setup
Prompt:
@docs/architecture.md @src/lib/integrations/stripe
You are the Integration Specialist. Set up Stripe integration for wallet payments following the architecture.

Task 2 (Another Cursor Chat): PayPal setup  
Prompt:
@docs/architecture.md @src/lib/integrations/paypal
You are the Integration Specialist. Set up PayPal integration for wallet payments following the architecture.

[Work on both, but keep it simple - if it gets confusing, stop parallel work]
```

**⚠️ Stop parallel work if:**
- You feel overwhelmed
- Tasks start interfering with each other
- You're not making progress

**Better approach:** Do Stripe first, test it, then do PayPal. Sequential is usually faster overall.

### Recommended Daily Pattern

**Most days (use this):**
- **Session 1 (2-3 hours):** Complete one feature end-to-end
  - Backend API → Test
  - Frontend UI → Test  
  - Integration → Test
- **Session 2 (2-3 hours):** Complete another feature
- **End of day:** Quick review, commit code

**Key:** Finish one thing completely before starting the next. Avoid multitasking.

---

## Agent Switching Protocol

### When to Switch Agents

1. **Different layer needed:**
   - Backend → Frontend (API ready, need UI)
   - Frontend → Backend (UI mocked, need API)

2. **Different expertise needed:**
   - General → Integration Specialist (adding external API)
   - General → Database Engineer (complex queries/schema)

3. **Different scope:**
   - Feature-specific → Full-Stack Engineer (end-to-end feature)
   - Feature-specific → QA Engineer (testing phase)

### Switching Checklist

Before switching agents:
- [ ] Current work is complete/tested
- [ ] Code is committed (if using version control)
- [ ] Context is clear for next agent
- [ ] Dependencies are documented

**Example handoff:**
```
@src/server/api/professionals/route.ts (Backend API complete)
@docs/architecture.md

Previous Agent: Backend Engineer completed professional API endpoints.
Next Agent: Frontend Engineer - Build the professional profile UI that consumes these endpoints.
```

---

## Success Metrics

### Phase Completion Criteria

**Phase 1 (Foundation):**
- [ ] Database schema complete and migrated
- [ ] Authentication working (email + phone)
- [ ] All types defined
- [ ] Core utilities in place

**Phase 2 (Core Flows):**
- [ ] Clients can post requests
- [ ] Professionals can view matching requests
- [ ] Professionals can submit offers (first 10 limit enforced)
- [ ] Clients can view offers and click to view profiles
- [ ] Pay-per-click billing triggers correctly

**Phase 3 (Integrations):**
- [ ] Wallet system operational (Stripe + PayPal)
- [ ] Search working (Elasticsearch)
- [ ] Content moderation active (Perspective API)
- [ ] Chat functional
- [ ] i18n + AI translation working

**Phase 4 (Admin):**
- [ ] All admin modules functional
- [ ] User management complete
- [ ] Content moderation queue working
- [ ] Analytics dashboard operational
- [ ] Advertising system ready

**Phase 5 (Polish):**
- [ ] All requirements met
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Documentation complete

---

## Risk Mitigation

### Common Issues & Solutions

**Issue:** Agent creates code that doesn't follow architecture  
**Solution:** Always include `@docs/architecture.md` in prompts, review before proceeding

**Issue:** Integration fails silently  
**Solution:** Integration Specialist creates comprehensive error handling and logging

**Issue:** Feature scope creep  
**Solution:** Strictly reference requirements, QA validates against requirements

**Issue:** Performance issues late in development  
**Solution:** Database Engineer reviews queries regularly, optimize as you go

**Issue:** Missing validations/edge cases  
**Solution:** QA Engineer tests each feature, document edge cases upfront

---

## Final Notes

### Key Principles
1. **Architecture is law** - Deviations only with approval
2. **Requirements are truth** - All features must match requirements
3. **Type safety always** - No `any` types without justification
4. **Test incrementally** - Don't wait until end
5. **Document decisions** - Future you will thank you

### Efficiency Tips
- Use parallel agents when features are independent
- Test as you build (don't accumulate bugs)
- Keep architecture doc updated
- Use clear, specific agent prompts
- Reference existing code for consistency

### Timeline Flexibility
- If behind: Focus on core features first, polish later
- If ahead: Add more testing, optimize performance
- MVP can be delivered earlier if non-critical features deferred

---

**Ready to begin Phase 1. Start with the Lead System Architect to create the complete architecture document.**

