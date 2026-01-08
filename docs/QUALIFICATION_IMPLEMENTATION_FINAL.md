# Universal Qualification Verification - Final Implementation

## ✅ What's Complete

### Simplified Approach
- **ALL professions** now require document upload (diploma, certificate, degree, resume, portfolio)
- Removed `requiresQualification` flag from Subcategory (no longer needed)
- System treats all services equally - simpler and more consistent

### Components Created
1. **QualificationsTab Component** (`src/components/profile/QualificationsTab.tsx`):
   - File upload UI with drag-and-drop support
   - Document status display (Pending/Approved/Rejected)
   - File validation (PDF, JPEG, PNG, max 10MB)
   - Real-time upload progress

2. **Document Upload API** (`src/app/api/professionals/documents/route.ts`):
   - GET: List professional's documents
   - POST: Upload new document with validation
   - Files saved to `public/uploads/documents/`
   - Creates `VerificationDocument` record with PENDING status

3. **Backend Logic Updated**:
   - `professionals/services/route.ts`: Sets `qualificationVerified = false` when ANY service is added
   - `verification/create-session/route.ts`: Blocks Stripe Identity if `!qualificationVerified`
   - `admin/verify-qualification/route.ts`: Admin approval endpoint (checks for services existence)

### Database Changes
- `Professional.qualificationVerified` (Boolean, default: true)
- No changes to Subcategory (removed `requiresQualification`)

## 📋 SQL Migration Script

**File**: `docs/FINAL_QUALIFICATION_MIGRATION.sql`

```sql
-- 1. Add qualificationVerified column
ALTER TABLE "professionals" 
ADD COLUMN IF NOT EXISTS "qualificationVerified" BOOLEAN NOT NULL DEFAULT true;

-- 2. Set to FALSE for professionals with services
UPDATE "professionals" 
SET "qualificationVerified" = false 
WHERE id IN (
    SELECT DISTINCT "professionalId" 
    FROM "professional_services"
);
```

## ⚠️ Manual Steps Required

### 1. Run SQL Migration in Supabase
Copy and execute the SQL from `docs/FINAL_QUALIFICATION_MIGRATION.sql` in Supabase SQL Editor.

### 2. Regenerate Prisma Client
```bash
npx prisma generate
```

### 3. Add Translation Keys (Manual)
The following keys need to be added to `messages/en.json` and `messages/fr.json`:

**English** (`messages/en.json` - add under `ProDashboard` section):
```json
"Qualifications": {
    "title": "Professional Qualifications",
    "description": "Upload your professional documents (diplomas, certificates, degrees, resume, etc.) for admin review.",
    "acceptedDocuments": "Accepted Documents",
    "docTypes": {
        "diploma": "Professional Diplomas",
        "certificate": "Certifications & Licenses",
        "degree": "Academic Degrees",
        "resume": "Professional Resume/CV",
        "portfolio": "Portfolio or Work Samples"
    },
    "uploadButton": "Upload Document",
    "uploading": "Uploading...",
    "uploadedDocuments": "Uploaded Documents",
    "status": {
        "pending": "Pending Review",
        "approved": "Approved",
        "rejected": "Rejected"
    }
}
```

**French** (`messages/fr.json` - add under `ProDashboard` section):
```json
"Qualifications": {
    "title": "Qualifications Professionnelles",
    "description": "Téléchargez vos documents professionnels (diplômes, certificats, CV, etc.) pour examen administratif.",
    "acceptedDocuments": "Documents Acceptés",
    "docTypes": {
        "diploma": "Diplômes Professionnels",
        "certificate": "Certifications et Licences",
        "degree": "Diplômes Académiques",
        "resume": "CV Professionnel",
        "portfolio": "Portfolio ou Échantillons de Travail"
    },
    "uploadButton": "Télécharger un Document",
    "uploading": "Téléchargement...",
    "uploadedDocuments": "Documents Téléchargés",
    "status": {
        "pending": "En Attente d'Examen",
        "approved": "Approuvé",
        "rejected": "Rejeté"
    }
}
```

### 4. Integrate QualificationsTab into ProfileForm
Add the tab to `src/app/[locale]/pro/profile/ProfileForm.tsx`:
- Import: `import { QualificationsTab } from '@/components/profile/QualificationsTab';`
- Add tab button in the tab list
- Add tab content panel with `<QualificationsTab professionalId={professional.id} documents={documents} />`
- Fetch documents in the page component

### 5. Create Upload Directory
```bash
mkdir -p public/uploads/documents
```

## 🧪 Testing Flow

1. **Professional Signs Up**
2. **Adds First Service** → `qualificationVerified` set to `false`
3. **Dashboard Shows**: "Qualification Verification Required" alert
4. **Clicks "Upload Documents"** → Goes to Profile > Qualifications tab
5. **Uploads Document** (PDF/Image) → Status: "Pending Review"
6. **Tries "Verify Identity"** → Blocked with 403 error
7. **Admin Approves**: `POST /api/admin/verify-qualification` with `{ professionalId, approved: true }`
8. **Dashboard Updates**: Alert changes to "Identity Verification Required"
9. **Completes Stripe Identity** → Fully verified ✅

## 🚀 Deployment Checklist

- [ ] Run SQL migration in Supabase
- [ ] Add translation keys to en.json and fr.json
- [ ] Integrate QualificationsTab into ProfileForm
- [ ] Create `public/uploads/documents` directory
- [ ] Test upload flow locally
- [ ] Deploy to Vercel
- [ ] Test end-to-end in production

## 📝 Notes

- **File Storage**: Currently using local file system (`public/uploads`). For production, consider cloud storage (S3, Cloudinary, etc.)
- **Admin UI**: No admin UI for reviewing documents yet - must use API directly or database
- **Notifications**: TODO - notify professionals when documents are approved/rejected
