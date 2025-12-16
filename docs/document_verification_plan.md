# Manual Document Verification System - Implementation Plan

## Overview
Implement a system for professionals to upload verification documents. The Admin side is **already implemented** (confirmed). We just need to allow professionals to upload files and ensure the Verified Badge appears correctly.

## 1. Database & Schema
- [x] `VerificationDocument` model exists.
- [x] `Professional.isVerified` field exists.

## 2. File Upload Mechanism (Discovery & Decision)

### Option A: Local Storage (Selected for MVP)
**How it works**: Files are saved directly to the `public/uploads` folder in your project.
- **Pros**: Zero setup, works immediately, 100% free.
- **Cons**: **Ephemeral on Vercel**. When you redeploy the site, verified documents will be deleted.
- **Verdict**: We will implement this **first** to get the logic working immediately without external dependencies.

### Option B: Supabase Storage (Recommended for later)
**How it works**: Files are verified and sent to a Supabase Bucket.
- **Pros**: Persistent, free (1GB Tier), secure.
- **Cons**: Requires creating a bucket in Supabase Dashboard and configuring RLS policies manually.
- **Status**: You have `@supabase/supabase-js` installed! We can switch to this easily later.

## 3. API Routes

### A. Upload Endpoint (New)
`POST /api/upload`
- Accepts `FormData` (file).
- **MVP Logic**: Writes file to `./public/uploads/[filename]`.
- Returns `{ url: "/uploads/[filename]" }`.
- [x] **Metadata**: `POST /api/professionals/documents/upload`
  - Already exists! Just needs the file URL from the step above.
- [x] **Admin Verification**: `PATCH /api/admin/professionals/[id]/verify`
  - Already exists!

## 4. User Interface

### A. Professional Dashboard (`/pro/verification` - NEW)
- **Status Overview**: Show if they are "Verified" or "Unverified".
- **Upload Component**:
  1.  File Input (Select ID/Diploma).
  2.  Upload to `/api/upload` -> get URL.
  3.  Submit URL to `/api/professionals/documents/upload`.
- **Document List**: Show uploaded docs and their status (Pending/Approved/Rejected).

### B. Public Profile & Search
- [ ] **Search Cards**: Verify "Verified" badge shows clearly (logic exists in Featured, check Search).
- [ ] **Profile Page**: Add "Verified Professional" badge prominently.

## 5. Security Checks
- [x] Logic is handled by admin manual review.
- [ ] Ensure `public/uploads` is accessible but protected from malicious execution (basic checks).
