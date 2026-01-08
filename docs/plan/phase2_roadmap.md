# Phase 2: Comprehensive Implementation Roadmap

**Objective**: Complete the SkillFind.pro platform by implementing all remaining requirements (Integrations, Communication, Advanced Features) to reach "Feature Complete" status.

**Target Audience**: AI Agents & Developers.

---

## 1. External Integrations (Priority: High)

### 1.1 Stripe Integration (Payments)
**Context**: Currently, the wallet system is internal-only. Users need to deposit real money to pay for clicks.
**Requirements**: Section 12 (Billing System).
**Implementation Guide**:
1.  **Setup**: Install `stripe` package. Configure API keys in `.env`.
2.  **Data Model**: Update `Wallet` to track `stripeCustomerId`. Add `PaymentIntent` model if needed (or just log in `Transaction`).
3.  **Checkout Flow**:
    -   Create `/app/api/stripe/create-payment-intent` endpoint.
    -   Frontend: Create "Top Up Wallet" modal using Stripe Elements.
    -   Webhook: Create `/app/api/webhooks/stripe` to listen for `payment_intent.succeeded`.
    -   **Critical**: Only credit the internal wallet balance inside the webhook handler (secure).
**Testing Method (Agent)**:
-   **Automated**: Use `stripe-mock` or Stripe Test Mode keys.
-   **Script**: Create `scripts/test-stripe-flow.ts` that simulates a webhook call with a valid signature and verifies the `Wallet` balance increases.

### 1.2 SendGrid Integration (Email Notifications)
**Context**: Users currently receive no notifications. Critical for engagement (e.g., "You have a new offer").
**Requirements**: Section 15 (Email Notifications).
**Implementation Guide**:
1.  **Setup**: Install `@sendgrid/mail`. Configure API key.
2.  **Utility**: Create `src/lib/email.ts` with helper functions (`sendWelcomeEmail`, `sendNewOfferEmail`, `sendVerificationEmail`).
3.  **Triggers**:
    -   `auth/complete-signup` -> Send Welcome Email.
    -   `api/offers/route.ts` -> Send "New Offer" email to Client.
    -   `api/requests/route.ts` -> Send "Matching Request" email to Pros.
**Testing Method (Agent)**:
-   **Automated**: Mock the `sendgrid` library in tests. Verify `send` was called with correct arguments.
-   **Manual**: Trigger an action and check the SendGrid dashboard (or use a temporary email service like Mailinator).

### 1.3 iDenfy Integration (Identity Verification)
**Context**: Verification is currently manual. We need automated ID checks.
**Requirements**: Section 11 (Identity Verification).
**Implementation Guide**:
1.  **Setup**: Register with iDenfy. Get API keys.
2.  **Flow**:
    -   Create "Start Verification" button in Pro Dashboard.
    -   API: Generate verification session token.
    -   Frontend: Redirect user to iDenfy verification URL.
    -   Webhook: Listen for `verification.status_changed`. Update `Professional.isVerified` and `Professional.verificationMethod = 'IDENFY'`.
**Testing Method (Agent)**:
-   **Automated**: Simulate the webhook payload from iDenfy to verify the database update logic.

### 1.4 Google Perspective API (Content Moderation)
**Context**: Reviews and bios need automated toxicity checks.
**Requirements**: Section 14 (Content Moderation).
**Implementation Guide**:
1.  **Setup**: Enable Perspective API in Google Cloud Console.
2.  **Utility**: Create `src/lib/moderation.ts`. Function `analyzeText(text)` returns toxicity score.
3.  **Integration**:
    -   Before saving a `Review` or `Professional` bio, call `analyzeText`.
    -   If score > threshold (e.g., 0.8), reject immediately or flag for admin (`moderationStatus = 'PENDING'`).
**Testing Method (Agent)**:
-   **Automated**: Unit test `analyzeText` with known toxic strings ("I hate you") and benign strings.

---

## 2. Communication & Localization (Priority: Medium)

### 2.1 Real-Time Chat System
**Context**: Clients and Pros need to chat before finalizing (currently just swapping phones).
**Requirements**: Section 6.4 & 7.5.
**Implementation Guide**:
1.  **Tech Stack**: Use **Supabase Realtime** or **Firebase Realtime Database** (easier than setting up a custom WebSocket server with Next.js serverless).
2.  **Data Model**: `Conversation` (between Client/Pro, linked to Request), `Message` (content, timestamp, sender).
3.  **UI**: Chat interface in Dashboard.
4.  **Access Control**: Only allow chat if an Offer exists.
**Testing Method (Agent)**:
-   **Manual**: Open two browser windows (Client and Pro) and verify messages appear instantly.

### 2.2 Multilingual Support (i18n)
**Context**: Platform must support English and French (and others).
**Requirements**: Section 3.
**Implementation Guide**:
1.  **Library**: Use `next-intl` or `react-i18next`.
2.  **Structure**: Store translations in `messages/en.json`, `messages/fr.json`.
3.  **Routing**: Update middleware to handle locale prefixes (`/en/...`, `/fr/...`).
4.  **Content**: Replace hardcoded text with `t('key')`.
**Testing Method (Agent)**:
-   **Automated**: Verify that changing the URL locale changes the rendered text in a component test.

---

## 3. Advanced Features (Priority: Low)

### 3.1 Elasticsearch (Advanced Search)
**Context**: Database search (`contains`) is slow and dumb. Need typo tolerance.
**Requirements**: Section 13.
**Implementation Guide**:
1.  **Service**: Use **Algolia** (easier/managed) or **Elastic Cloud**.
2.  **Sync**:
    -   On `Professional` update/create -> Push data to search index.
    -   Use a "Sync Script" to index existing data.
3.  **UI**: Replace current search bar with InstantSearch components.
**Testing Method (Agent)**:
-   **Manual**: Search for "plumber" (with typo "plumbr") and verify results.

### 3.2 Advertising System
**Context**: Admins need to create promoted campaigns.
**Requirements**: Section 9 & 16.6.
**Implementation Guide**:
1.  **Data Model**: `Campaign` (image, targetUrl, budget, clicks, status).
2.  **Placement**: Inject "Sponsored" cards into the Professional List or Search Results.
3.  **Billing**: Similar to PPC, deduct from Campaign Budget on click.
**Testing Method (Agent)**:
-   **Automated**: Script to create a campaign and simulate clicks, verifying budget decrement.

---

## 4. Execution Strategy for Agents

**Recommended Order**:
1.  **Stripe** (Unlocks revenue).
2.  **SendGrid** (Unlocks retention).
3.  **Chat** (Unlocks core UX).
4.  **iDenfy** (Unlocks trust).
5.  **i18n** (Unlocks market reach).

**Agent Workflow**:
1.  **Pick a Feature** (e.g., Stripe).
2.  **Read this Plan**.
3.  **Create Task**: `task_boundary` -> "Implementing Stripe".
4.  **Implement**: Follow the guide.
5.  **Verify**: Write the specific test script mentioned.
6.  **Update Docs**: Mark as done in `gap_analysis.md`.
