# Authentication System Debugging & Resolution Log

**Date:** December 3, 2025
**Topic:** Auth Redirect Loops, Role Detection, and Dashboard Access

## Summary
This document outlines the critical fixes implemented to resolve persistent redirect loops and authentication errors in the SkillFind application. Future AI agents should refer to this when working on authentication, onboarding, or dashboard routing.

## 1. The Redirect Loop Issue
**Symptoms:**
- User logs in as `PROFESSIONAL`.
- Middleware allows access to `/pro`.
- Browser redirects back to `/auth-redirect`.
- Loop continues indefinitely.

**Root Cause:**
The `ProDashboardPage` (`src/app/pro/page.tsx`) was querying the database using the **Clerk User ID** (`user_...`) to find the `Professional` profile.
However, the `Professional` model is linked to the internal `User` model via the internal `id` (UUID), not the Clerk ID.
```prisma
model Professional {
  userId String @unique // References User.id (UUID), NOT User.clerkId
  user   User   @relation(fields: [userId], references: [id])
}
```
Because the query failed to find the profile, the page logic redirected the user back to `/auth-redirect`, creating the loop.

**Resolution:**
Updated `src/app/pro/page.tsx` to perform a two-step lookup:
1.  Find `User` by `clerkId`.
2.  Find `Professional` by `userId` (the internal UUID from step 1).

## 2. Middleware & Role Detection
**Symptoms:**
- Middleware was sometimes failing to detect the role, or rejecting valid tokens.
- "JWT issued at date claim (iat) is in the future" errors.

**Root Cause:**
- **Clock Skew:** The development machine's time was slightly out of sync with Clerk's servers, causing JWT validation to fail immediately after login.
- **Role Location:** The role is stored in `sessionClaims.metadata.role`, but sometimes accessed via `publicMetadata`.

**Resolution:**
- Added `clockSkewInMs: 30000` (30 seconds) to `clerkMiddleware` in `src/middleware.ts`.
- Standardized role access in middleware to check both `metadata.role` and `publicMetadata.role`.

## 3. API Authentication (401 Errors)
**Symptoms:**
- Calls to `/api/auth/check-profile` returned `401 Unauthorized` even when the user was logged in.

**Root Cause:**
- The `fetch` requests from the client (in `auth-redirect/page.tsx`) were not including the session cookie.

**Resolution:**
- Added `credentials: 'include'` to all `fetch` calls to internal API routes.
- Explicitly marked `/api/auth/check-profile` as a public route in middleware to allow initial checks, though it still performs internal auth verification.

## 4. Prisma Model Typos
**Symptoms:**
- Runtime error: `Cannot read properties of undefined (reading 'count')`.

**Root Cause:**
- Code was attempting to access `prisma.professionalClick`, but the model name in `schema.prisma` is `ClickEvent` (mapped to `click_events` table).

**Resolution:**
- Corrected the query to use `prisma.clickEvent.count()`.

## Architecture Overview (Current State)

### Onboarding Flow
1.  **New User** -> Sign Up via Clerk.
2.  **Middleware** -> Sees no role -> Redirects to `/auth-redirect`.
3.  **Auth Redirect Page** (`/auth-redirect`):
    - User selects role (Client/Pro).
    - Calls `/api/auth/save-role` -> Updates Clerk Metadata.
    - Calls `/api/auth/complete-signup` -> Creates DB records (User + Client/Pro + Wallet).
    - **Polling**: Client polls `check-profile` until role and DB records are synced.
4.  **Redirection**: Once synced, redirects to `/client` or `/pro`.

### Dashboard Access
1.  **User** -> Navigates to `/pro`.
2.  **Middleware**:
    - Verifies Clerk Session.
    - Checks `sessionClaims.metadata.role` == 'PROFESSIONAL'.
    - Allows request.
3.  **Page Load** (`src/app/pro/page.tsx`):
    - `auth()` -> Get Clerk ID.
    - `prisma.user.findUnique({ clerkId })` -> Get Internal ID.
    - `prisma.professional.findUnique({ userId: internalId })` -> Get Profile.
    - If missing -> Redirect to `/auth-redirect`.
    - If found -> Render Dashboard.

## Key Files
- `src/middleware.ts`: Auth enforcement & role checks.
- `src/app/auth-redirect/page.tsx`: Onboarding orchestration & polling.
- `src/app/pro/page.tsx`: Professional dashboard logic.
- `src/lib/api-response.ts`: Standardized API error handling.
