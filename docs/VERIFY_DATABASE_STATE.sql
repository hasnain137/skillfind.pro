-- Database Verification Query
-- Run this in Supabase SQL Editor to verify the qualification system is set up correctly

-- 1. Check all professionals and their qualification status
SELECT 
    p.id,
    u.email,
    u."firstName",
    u."lastName",
    p."qualificationVerified",
    p."isVerified",
    p.status,
    COUNT(DISTINCT ps.id) as service_count,
    COUNT(DISTINCT vd.id) as document_count,
    p."createdAt"
FROM "professionals" p
LEFT JOIN "users" u ON p."userId" = u.id
LEFT JOIN "professional_services" ps ON ps."professionalId" = p.id
LEFT JOIN "verification_documents" vd ON vd."professionalId" = p.id
GROUP BY p.id, u.email, u."firstName", u."lastName", p."qualificationVerified", p."isVerified", p.status, p."createdAt"
ORDER BY p."createdAt" DESC
LIMIT 10;

-- Expected Results:
-- ✅ Professionals WITH services: qualificationVerified = false
-- ✅ Professionals WITHOUT services: qualificationVerified = true
-- ✅ New professionals (no services yet): qualificationVerified = true

-- 2. Check if any professionals are in an inconsistent state
SELECT 
    'Professionals with services but qualificationVerified=true' as issue,
    COUNT(*) as count
FROM "professionals" p
WHERE p."qualificationVerified" = true
AND EXISTS (
    SELECT 1 FROM "professional_services" ps 
    WHERE ps."professionalId" = p.id
);

-- Expected: count = 0 (no inconsistencies)

-- 3. Summary statistics
SELECT 
    "qualificationVerified",
    "isVerified",
    COUNT(*) as count
FROM "professionals"
GROUP BY "qualificationVerified", "isVerified"
ORDER BY "qualificationVerified" DESC, "isVerified" DESC;
