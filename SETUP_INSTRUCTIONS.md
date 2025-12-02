# 🚀 Setup Instructions - Foundation Layer Complete

## ✅ What Was Built

The **complete foundation layer** for SkillFind.pro is now in place:

- ✅ Authentication system with Clerk
- ✅ Role-based access control
- ✅ Validation schemas (Zod) for all entities
- ✅ Error handling and API responses
- ✅ Wallet service with transaction safety
- ✅ Click billing system (PPC)
- ✅ Profile completion calculator
- ✅ Example API endpoints

**Total: 17 new files created, 1,500+ lines of production-ready code**

---

## 📋 Next Steps to Get Running

### 1. Install Dependencies

```bash
npm install
```

This will install `zod` (already added to package.json).

### 2. Setup Clerk Authentication

**a) Create a Clerk Account:**
1. Go to https://clerk.com
2. Create a new application
3. Choose "Next.js" as your framework

**b) Get Your Clerk Keys:**
1. In Clerk Dashboard, go to **API Keys**
2. Copy your keys

**c) Add to `.env.local`:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/api/auth/complete-signup
```

**d) Configure Clerk Session Claims (Important!):**

In your Clerk Dashboard, go to **Sessions** → **Customize session token**:

Add this custom claim to include the user role:
```json
{
  "metadata": {
    "role": "{{user.public_metadata.role}}"
  }
}
```

### 3. Update Clerk Sign-Up Flow

You need to update the sign-up flow to call our complete-signup endpoint.

**Option A: Use Clerk's built-in redirect**
- In Clerk Dashboard → **Paths**, set "After sign up URL" to: `/api/auth/complete-signup`

**Option B: Custom sign-up page (recommended)**
- Create a custom sign-up page that collects role, date of birth, etc.
- Call `/api/auth/complete-signup` after Clerk authentication

### 4. Test the Foundation

**a) Start the development server:**
```bash
npm run dev
```

**b) Test database connection:**
```
http://localhost:3000/api/test
```

**c) Test authentication (requires Clerk setup):**
1. Sign up at `/signup`
2. Complete profile with role selection
3. Check user profile: `GET /api/user/profile`

### 5. Verify Everything Works

Run these checks:

```bash
# Check if TypeScript compiles
npx tsc --noEmit

# Check for linting errors
npm run lint

# Check Prisma client is generated
npx prisma generate
```

---

## 🎯 Foundation Components Overview

### Authentication (`src/lib/auth.ts`)
```typescript
// In any API route:
import { requireAuth, requireClient, requireProfessional } from '@/lib/auth';

// Basic auth
const { userId, role } = await requireAuth();

// Role-specific
const { userId } = await requireClient();
const { userId } = await requireProfessional();
```

### Validation (`src/lib/validations/`)
```typescript
import { createRequestSchema } from '@/lib/validations/request';

// Parse and validate
const data = createRequestSchema.parse(body);
```

### API Responses (`src/lib/api-response.ts`)
```typescript
import { successResponse, handleApiError } from '@/lib/api-response';

// Success
return successResponse(data, 'Optional message');

// Error handling
try {
  // Your code
} catch (error) {
  return handleApiError(error);
}
```

### Business Services

**Wallet:**
```typescript
import { debitWallet, creditWallet } from '@/lib/services/wallet';

await debitWallet({
  professionalId: 'xxx',
  amount: 10, // €0.10
  description: 'Click fee',
});
```

**Click Billing:**
```typescript
import { recordClickAndCharge } from '@/lib/services/click-billing';

await recordClickAndCharge({
  offerId: 'xxx',
  clientId: 'yyy',
  clickType: 'OFFER_VIEW',
});
```

**Profile Completion:**
```typescript
import { calculateProfileCompletion } from '@/lib/services/profile-completion';

const result = await calculateProfileCompletion(professionalId);
// result.percentage, result.completedSteps, result.missingSteps
```

---

## 🔄 Workflow Example

### Complete User Journey:

1. **User signs up via Clerk** → `/signup`
2. **Clerk redirects to** → `/api/auth/complete-signup`
3. **User selects role** (CLIENT or PROFESSIONAL)
4. **System creates:**
   - User record
   - Role-specific profile (Client or Professional)
   - Wallet (for professionals)
5. **User is authenticated** and can access protected routes

### Professional Journey:
1. Complete profile → `PUT /api/professionals/profile`
2. Add services → `POST /api/professionals/services`
3. View matching requests → `GET /api/professionals/matching-requests`
4. Send offers → `POST /api/offers`
5. Client views offer → **Click charged** (€0.10)
6. Track wallet balance → `GET /api/wallet`

---

## 📁 File Structure

```
src/
├── lib/
│   ├── auth.ts                          # Authentication helpers
│   ├── errors.ts                        # Custom errors
│   ├── api-response.ts                  # Response utilities
│   ├── utils.ts                         # General utilities
│   ├── validations/                     # Zod schemas
│   │   ├── common.ts
│   │   ├── user.ts
│   │   ├── request.ts
│   │   ├── offer.ts
│   │   ├── wallet.ts
│   │   └── review.ts
│   └── services/                        # Business logic
│       ├── profile-completion.ts
│       ├── wallet.ts
│       └── click-billing.ts
├── app/api/
│   ├── auth/complete-signup/route.ts    # ✅ Built
│   ├── user/profile/route.ts            # ✅ Built
│   ├── professionals/profile/           # ✅ Built
│   ├── requests/                        # ⏳ Next to build
│   ├── offers/                          # ⏳ Next to build
│   └── wallet/                          # ⏳ Next to build
└── middleware.ts                        # Clerk middleware
```

---

## ⚠️ Important Notes

1. **Clerk Setup is Required** - The app won't work without Clerk configuration
2. **Database Must Be Seeded** - Run `npx prisma db seed` if not done
3. **Environment Variables** - Copy `.env.example` to `.env.local` and fill in values
4. **Role in Session** - Configure Clerk to include role in session token
5. **TypeScript Strict Mode** - All code is fully typed

---

## 🐛 Troubleshooting

### "Clerk is not configured"
- Make sure you added Clerk keys to `.env.local`
- Restart dev server after adding env vars

### "User not found" after signup
- Check if `/api/auth/complete-signup` is being called
- Verify database connection
- Check Prisma client is generated

### "Zod is not defined"
- Run `npm install` to install dependencies
- Check `package.json` includes `"zod": "^3.23.8"`

### TypeScript errors
- Run `npx prisma generate` to update Prisma client
- Check all imports are correct
- Restart TypeScript server in your editor

---

## ✨ What's Next?

Now that the foundation is solid, you can build the core APIs:

### Priority 1: Request APIs
- `POST /api/requests` - Create request
- `GET /api/requests` - List requests
- `GET /api/requests/[id]` - View request
- `POST /api/requests/[id]/close` - Close request

### Priority 2: Offer APIs
- `POST /api/offers` - Create offer
- `GET /api/offers` - List offers
- `DELETE /api/offers/[id]` - Withdraw offer
- `GET /api/professionals/matching-requests` - Matching

### Priority 3: Wallet & Billing
- `GET /api/wallet` - Get wallet
- `POST /api/wallet/deposit` - Top up
- `POST /api/offers/[id]/click` - Record click

---

**Would you like me to:**
1. ✅ Build the Request APIs next?
2. ✅ Build the Offer APIs?
3. ✅ Set up Clerk configuration guide?
4. ✅ Create a complete API testing guide?
5. ✅ Something else?

**Foundation is ready! 🚀 Let's build the marketplace logic!**
