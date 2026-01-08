-- Quick Database Verification
-- Run this single query in Supabase SQL Editor to confirm everything is working

SELECT 
    COUNT(*) FILTER (WHERE "qualificationVerified" = false AND service_count > 0) as correct_professionals,
    COUNT(*) FILTER (WHERE "qualificationVerified" = true AND service_count > 0) as needs_fixing,
    COUNT(*) FILTER (WHERE service_count = 0) as no_services_yet
FROM (
    SELECT 
        p."qualificationVerified",
        COUNT(ps.id) as service_count
    FROM "professionals" p
    LEFT JOIN "professional_services" ps ON ps."professionalId" = p.id
    GROUP BY p.id, p."qualificationVerified"
) subquery;

-- Expected Results:
-- correct_professionals: Number of professionals with services (should have qualificationVerified = false)
-- needs_fixing: Should be 0 (no professionals with services should have qualificationVerified = true)
-- no_services_yet: Professionals without services (qualificationVerified = true is correct for them)
