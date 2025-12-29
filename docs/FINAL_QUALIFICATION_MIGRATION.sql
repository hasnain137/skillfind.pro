-- Universal Qualification Verification Migration
-- Run this in Supabase SQL Editor

-- 1. Add qualificationVerified column to professionals table (if not exists)
ALTER TABLE "professionals" 
ADD COLUMN IF NOT EXISTS "qualificationVerified" BOOLEAN NOT NULL DEFAULT true;

-- 2. Set qualificationVerified to FALSE for all professionals who have services
-- (They need to upload documents and get admin approval)
UPDATE "professionals" 
SET "qualificationVerified" = false 
WHERE id IN (
    SELECT DISTINCT "professionalId" 
    FROM "professional_services"
);

-- 3. Verify the changes
SELECT 
    p.id,
    u."firstName",
    u."lastName",
    p."qualificationVerified",
    COUNT(ps.id) as service_count
FROM "professionals" p
LEFT JOIN "users" u ON p."userId" = u.id
LEFT JOIN "professional_services" ps ON ps."professionalId" = p.id
GROUP BY p.id, u."firstName", u."lastName", p."qualificationVerified"
ORDER BY service_count DESC;

-- Expected: Professionals with services should have qualificationVerified = false
-- Professionals without services should have qualificationVerified = true
