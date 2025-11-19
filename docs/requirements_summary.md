# SkillFind.pro - Requirements Summary

## Product Description

SkillFind.pro is a multilingual marketplace platform inspired by Profi.ru that connects clients with vetted professionals across multiple categories including coaching, tutoring, wellness, tech, creative, and home services. The platform operates on a service request model where clients post their service needs, verified professionals respond with offers, and clients can view professional profiles at a pay-per-click rate of €0.10 per view. The platform ensures quality through mandatory identity verification (iDenfy) for professionals, comprehensive content moderation, and a robust matching system that connects clients with the right professionals based on category, location, and service requirements.

The system is designed as a request-offer marketplace rather than a direct booking platform. Clients post service requests, the first 10 matching professionals can submit offers, and when a client clicks an offer to view the full profile, the professional is charged. If the client chooses a professional, both parties' phone numbers are revealed to facilitate offline service completion. Reviews can only be submitted after job completion by verified clients, ensuring authentic feedback. The platform features a complete admin panel for user management, content moderation, analytics, and advertising campaigns, along with multilingual support powered by AI translation and a support chatbot for user assistance.

## Major Features and Flows

### Client Features
- Registration with phone and email verification (Firebase), +18 only
- Service request posting (category, subcategory, description, budget, location/online, preferred time)
- Offer management (view offers from professionals, see price, rating preview, location preview)
- Pay-per-click profile viewing (€0.10 charged to professional when client clicks offer)
- Web chat system with professionals
- Phone number revelation when choosing a professional
- Job completion marking and review submission (1-5 stars, title, feedback min 30 chars, tags, "would recommend" toggle)

### Professional Features
- Registration with phone and email verification (Firebase), +18 only
- Mandatory verification steps (8 steps counting toward profile completion %):
  - Email verification (Firebase)
  - Phone verification (Firebase)
  - Wallet connection (Stripe or PayPal, minimum €2 balance)
  - ID verification (iDenfy, mandatory for activation)
  - Profile photo
  - Bio filled
  - Services selected (minimum 1)
  - Remote availability setting (yes/no/only remote)
  - Terms of use accepted
- Optional uploads (diplomas, certificates, project photos)
- Professional profile (personal data, services, completed projects, reviews, wallet & billing history)
- Matching request reception (based on category, subcategory, location/remote availability)
- Offer submission (price, time slots, custom message) - limited to first 10 professionals per request
- Pay-per-click billing system (€0.10 per profile view, daily budget limits)
- Wallet management and transaction history
- Public reply to reviews

### Admin Panel Features
- User management (professionals: filter by verified/unverified, category, location, profile completion; actions: view/edit/delete, suspend, reverify, adjust balance) (clients: filter by city/active; actions: view requests, suspend/reactivate)
- Content moderation (reviews flagged via Perspective API, bios & descriptions auto-flagged queue, ID verification logs with admin override)
- Click & wallet tracking (pro wallet logs, filters, click history, exportable CSV/PDF)
- Request & offer management (list all requests, list all offers, remove spam, flag suspicious activity)
- Services & category manager (add/edit/delete categories + subcategories, tag groups, display order, icons, suggested services)
- Advertising management (create campaigns with target location, category, duration, budget, stats dashboard, Stripe payment links)
- Platform communications (mass emails via SendGrid, triggered emails: welcome, suspension, verification failed, review received)
- Analytics & reports (daily signups, daily requests, booking trends, most active categories, export CSV/PDF, optional Google Analytics)
- Global settings (per-click fee default: €0.10, minimum wallet threshold: €2, moderation thresholds, chatbot fallback settings)

### Platform Features
- Home page (search bar, popular categories, "how it works" section, language selector)
- Category pages (categories, subcategories, filters: price, rating, location, featured professionals)
- Professional profile pages (name, photo, location, services, pricing hourly/flat, bio/experience, reviews & ratings, contact/request service button)
- Matching logic (category, subcategory, city/region, remote toggle, verified tags, service metadata)
- Search system (Elasticsearch: task, service title, keywords, category, location, remote availability; typo tolerance, partial match, future semantic search)
- Content moderation (Google Perspective API: reviews, bios, descriptions, optional chat messages; filters: hate speech, toxicity, threats, profanity; threshold logic: block highly toxic, flag medium-risk for admin)
- Multilingual support (default English, auto-detect user location via IP, auto-translate using AI ChatGPT 4o, manual language switcher, i18n translation key system, all text content stored as keys)
- Support chatbot (Chatbase: guides users, helps with registration/hiring/payment, auto-adjusts language by IP/browser, escalates to human support)
- Reviews system (trigger: only after "Job completed" clicked, client verified, job originated on SkillFind; anti-spam: one review per job, no anonymous reviews, admin moderation for flagged content)

### Business Logic Flows
1. Client Flow: Register → Verify (email + phone) → Post Service Request → Receive Offers → Click Offer (€0.10 charged to pro) → Chat with Pro → Choose Pro (phone numbers revealed) → Complete Job Offline → Mark Job Completed → Submit Review
2. Professional Flow: Register → Verify (email + phone) → Complete 8 Verification Steps → Receive Matching Requests → Send Offer (if in first 10) → Pay-Per-Click Billing → Chat with Client → If Chosen (phone revealed) → Complete Job
3. Review Flow: Client marks job completed → Client verified check → Job origin check → Review form submission → Content moderation → Admin review if flagged → Review published (pro can reply)

## External Integrations

- **Firebase** - Email and phone number verification for both clients and professionals
- **iDenfy** - Mandatory identity verification for professional account activation, provides verified badge ("Verified Professional"), full verification logs accessible to admin
- **Stripe** - Payment processing for professional wallet system, balance top-ups, per-click fee processing, advertising campaign payments
- **PayPal** - Alternative payment processing for professional wallet system, balance top-ups
- **Elasticsearch** - Search engine for service discovery (search by task, service title, keywords, category, location, remote availability) with typo tolerance and partial match support
- **Google Perspective API** - Content moderation service for reviews, bios, descriptions, and optionally chat messages; filters hate speech, toxicity, threats, profanity with configurable threshold logic
- **SendGrid** - Email notification service for welcome emails, verification alerts, review confirmations, mass announcements, automated system messages, and admin-triggered communications
- **Chatbase** - Support chatbot integration for user guidance, registration/hiring/payment assistance, multilingual support with auto-language detection, escalation to human support
- **ChatGPT 4o (OpenAI)** - AI-powered translation service for multilingual content, auto-translates platform content based on user location and language preferences
- **Google Analytics** (Optional) - Analytics tracking for platform usage metrics and reporting

