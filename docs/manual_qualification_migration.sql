-- Manual Migration: Add Qualification Verification Fields
-- Run this in Supabase SQL Editor

-- 1. Add requiresQualification to subcategories table
ALTER TABLE "subcategories" 
ADD COLUMN IF NOT EXISTS "requiresQualification" BOOLEAN NOT NULL DEFAULT false;

-- 2. Add qualificationVerified to professionals table
ALTER TABLE "professionals" 
ADD COLUMN IF NOT EXISTS "qualificationVerified" BOOLEAN NOT NULL DEFAULT true;

-- 3. Update specific subcategories to require qualification
-- Plumbing
UPDATE "subcategories" 
SET "requiresQualification" = true 
WHERE "slug" = 'plumbing';

-- Electrical Work
UPDATE "subcategories" 
SET "requiresQualification" = true 
WHERE "slug" = 'electrical';

-- Nutrition Consulting
UPDATE "subcategories" 
SET "requiresQualification" = true 
WHERE "slug" = 'nutrition';

-- 4. Verify the changes
SELECT slug, "nameEn", "requiresQualification" 
FROM "subcategories" 
WHERE "requiresQualification" = true;

-- Expected output: plumbing, electrical, nutrition should all show requiresQualification = true
