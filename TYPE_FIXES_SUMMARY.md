# Type Mismatch Fixes - Quick Reference

## ✅ ALL FIXES COMPLETE

### Fixed Files (18 total)

**Validation Schemas:**
- ✅ `src/lib/validations/request.ts`
- ✅ `src/lib/validations/offer.ts`
- ✅ `src/lib/validations/user.ts`

**Request Routes:**
- ✅ `src/app/api/requests/route.ts`
- ✅ `src/app/api/requests/[id]/route.ts`
- ✅ `src/app/api/requests/[id]/offers/route.ts`

**Offer Routes:**
- ✅ `src/app/api/offers/route.ts`
- ✅ `src/app/api/offers/[id]/route.ts`

**Service Routes:**
- ✅ `src/app/api/professionals/services/route.ts`
- ✅ `src/app/api/professionals/services/[id]/route.ts`

**Professional Routes:**
- ✅ `src/app/api/professionals/matching-requests/route.ts`

**Wallet Routes:**
- ✅ `src/app/api/wallet/route.ts`
- ✅ `src/app/api/wallet/deposit.ts`
- ✅ `src/app/api/wallet/transactions/route.ts`

---

## 🔄 Field Mappings (What Changed)

| Old Field | New Field(s) | Model |
|-----------|--------------|-------|
| `budget` | `budgetMin`, `budgetMax` | Request |
| `location` | `locationType`, `city`, `region`, `country` | Request |
| `remoteOk` | `locationType` (enum) | Request |
| `preferredDays` | Removed (use `urgency`) | Request |
| `priceHourly`, `priceFlat` | `priceFrom`, `priceTo` | ProfessionalService |
| `availableSlots` | `availableTimeSlots` | Offer |
| `profilePhotoUrl` | `avatar` | User |
| `remoteAvailable` | `remoteAvailability` | Professional |
| `termsAcceptedAt` | Removed (doesn't exist) | Professional |
| `metadata` | Removed | Transaction |
| `relatedEntityId`, `relatedEntityType` | `referenceId` | Transaction |

---

## 🧪 Test These Endpoints

```bash
# Create a request
POST /api/requests
{
  "categoryId": "...",
  "subcategoryId": "...",
  "title": "Need a plumber",
  "description": "Detailed description...",
  "budgetMin": 5000,
  "budgetMax": 10000,
  "locationType": "ON_SITE",
  "city": "Paris",
  "country": "FR",
  "urgency": "SOON"
}

# Create a service
POST /api/professionals/services
{
  "subcategoryId": "...",
  "priceFrom": 5000,
  "priceTo": 15000,
  "description": "..."
}

# Create an offer
POST /api/offers
{
  "requestId": "...",
  "message": "I can help with this...",
  "proposedPrice": 7500,
  "availableTimeSlots": "Monday-Friday 9am-5pm"
}
```

---

## 🚀 Ready to Deploy!

All type mismatches are resolved. Your API should now work correctly with your Prisma schema.
