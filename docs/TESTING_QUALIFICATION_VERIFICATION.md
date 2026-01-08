# Testing Checklist - Qualification Verification

## ✅ Database Migration Complete
- SQL migration executed in Supabase
- Prisma Client regenerated
- TypeScript errors resolved

## 🧪 Ready to Test

### Test 1: New Professional Flow
1. **Sign up** as a new professional
2. **Navigate to Profile** → Should see standard tabs
3. **Add a service** (any service - e.g., "Web Development")
4. **Check Dashboard** → Should show "Qualification Verification Required" alert
5. **Click "Upload Documents"** → Should navigate to Profile with `?activeTab=qualifications`
6. **Try "Verify Identity"** → Should be blocked with error message

### Test 2: Document Upload (After Integration)
*Note: QualificationsTab needs to be integrated into ProfileForm first*
1. Go to Profile → Qualifications tab
2. Upload a PDF or image file
3. Verify document appears with "Pending Review" status
4. Check database: `verification_documents` table should have new entry

### Test 3: Admin Approval
Use API or database to approve:

**Option A: Direct Database Update**
```sql
UPDATE "professionals" 
SET "qualificationVerified" = true 
WHERE id = 'PROFESSIONAL_ID_HERE';
```

**Option B: API Call**
```bash
curl -X POST http://localhost:3000/api/admin/verify-qualification \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "PROFESSIONAL_ID_HERE",
    "approved": true
  }'
```

### Test 4: Post-Approval Flow
1. After admin approval
2. **Check Dashboard** → Alert should change to "Identity Verification Required"
3. **Click "Verify Now"** → Should open Stripe Identity session
4. **Complete verification** → Professional becomes fully verified

## 🔧 Remaining Integration Tasks

### 1. Add Qualifications Tab to ProfileForm
File: `src/app/[locale]/pro/profile/ProfileForm.tsx`

**Add Import:**
```typescript
import { QualificationsTab } from '@/components/profile/QualificationsTab';
```

**Add Tab Button** (in the tab list):
```typescript
<button
  onClick={() => setActiveTab('qualifications')}
  className={activeTab === 'qualifications' ? 'active' : ''}
>
  {t('tabs.qualifications')}
</button>
```

**Add Tab Content:**
```typescript
{activeTab === 'qualifications' && (
  <QualificationsTab 
    professionalId={professional.id} 
    documents={documents} 
  />
)}
```

**Fetch Documents** (in page component):
```typescript
const documents = await prisma.verificationDocument.findMany({
  where: { professionalId: professional.id },
  orderBy: { uploadedAt: 'desc' },
});
```

### 2. Add Translation Keys
See `docs/QUALIFICATION_IMPLEMENTATION_FINAL.md` for the full translation keys to add to `messages/en.json` and `messages/fr.json`.

### 3. Create Upload Directory
```bash
mkdir public/uploads/documents
```

## 📊 Current Status

- ✅ Database schema updated
- ✅ Backend logic complete
- ✅ Dashboard alerts working
- ✅ Gating logic in place
- ✅ Admin approval endpoint ready
- ✅ QualificationsTab component created
- ✅ Document upload API created
- ⏳ Tab integration pending
- ⏳ Translation keys pending
- ⏳ Upload directory creation pending

## 🎯 Quick Start Testing (Without Full Integration)

You can test the core flow right now:

1. **Add a service** to your professional account
2. **Check Dashboard** → Should see qualification alert
3. **Try to verify identity** → Should be blocked
4. **Manually approve in database**:
   ```sql
   UPDATE "professionals" SET "qualificationVerified" = true WHERE "userId" = 'YOUR_USER_ID';
   ```
5. **Refresh Dashboard** → Alert should change to identity verification
6. **Complete Stripe Identity** → Success!

The document upload UI will work once the tab is integrated into ProfileForm.
