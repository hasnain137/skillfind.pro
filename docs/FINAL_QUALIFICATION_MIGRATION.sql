-- Universal Qualification Verification Migration (VERIFIED)
-- Run this in Supabase SQL Editor
-- This script is SAFE to run multiple times (idempotent)

-- Step 1: Check if column exists (informational query - run this first)
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'professionals' 
AND column_name = 'qualificationVerified';

-- If the above query returns NO ROWS, the column doesn't exist yet - proceed with Step 2
-- If it returns a row, the column already exists - skip to Step 3

-- Step 2: Add qualificationVerified column (ONLY if it doesn't exist)
-- The IF NOT EXISTS clause makes this safe to run even if column exists
ALTER TABLE "professionals" 
ADD COLUMN IF NOT EXISTS "qualificationVerified" BOOLEAN NOT NULL DEFAULT true;

-- Step 3: Set qualificationVerified to FALSE for professionals with services
-- This is safe to run multiple times (idempotent)
UPDATE "professionals" 
SET "qualificationVerified" = false 
WHERE id IN (
    SELECT DISTINCT "professionalId" 
    FROM "professional_services"
)
AND "qualificationVerified" = true; -- Only update if currently true (prevents unnecessary updates)

-- Step 4: Verification Query - Check the results
SELECT 
    p.id,
    u."firstName",
    u."lastName",
    u.email,
    p."qualificationVerified",
    p."isVerified",
    COUNT(ps.id) as service_count,
    COUNT(vd.id) as document_count
FROM "professionals" p
LEFT JOIN "users" u ON p."userId" = u.id
LEFT JOIN "professional_services" ps ON ps."professionalId" = p.id
LEFT JOIN "verification_documents" vd ON vd."professionalId" = p.id
GROUP BY p.id, u."firstName", u."lastName", u.email, p."qualificationVerified", p."isVerified"
ORDER BY service_count DESC, p."createdAt" DESC
LIMIT 20;

-- Expected Results:
-- ✅ Professionals WITH services: qualificationVerified = false
-- ✅ Professionals WITHOUT services: qualificationVerified = true
-- ✅ All professionals: isVerified should be independent of qualificationVerified

-- Step 5 (Optional): Count summary
SELECT 
    "qualificationVerified",
    COUNT(*) as count,
    COUNT(CASE WHEN "isVerified" = true THEN 1 END) as verified_count
FROM "professionals"
GROUP BY "qualificationVerified";
