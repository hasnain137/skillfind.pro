# Build and Test Instructions

## 🚀 Build Your Project

Run the following command to verify all fixes:

```bash
npm run build
```

### Expected Output:
```
✓ Compiled successfully
✓ Type checking passed
✓ Linting passed
✓ Creating optimized production build
```

---

## 🧪 Test Your APIs

### 1. Test Request Creation
```bash
POST http://localhost:3000/api/requests
Content-Type: application/json

{
  "categoryId": "your-category-id",
  "subcategoryId": "your-subcategory-id",
  "title": "Need a plumber for kitchen sink",
  "description": "My kitchen sink is leaking and needs immediate attention",
  "budgetMin": 5000,
  "budgetMax": 10000,
  "locationType": "ON_SITE",
  "city": "Paris",
  "region": "Île-de-France",
  "country": "FR",
  "urgency": "URGENT",
  "preferredStartDate": "2024-12-20"
}
```

### 2. Test Service Creation
```bash
POST http://localhost:3000/api/professionals/services
Content-Type: application/json

{
  "subcategoryId": "your-subcategory-id",
  "priceFrom": 5000,
  "priceTo": 15000,
  "description": "Expert plumbing services with 10 years experience"
}
```

### 3. Test Offer Creation
```bash
POST http://localhost:3000/api/offers
Content-Type: application/json

{
  "requestId": "your-request-id",
  "message": "I can help with your plumbing issue. I have 10 years of experience...",
  "proposedPrice": 7500,
  "estimatedDuration": "2-3 hours",
  "availableTimeSlots": "Monday-Friday, 9am-5pm"
}
```

---

## 📋 Verification Checklist

- [ ] Build completes without TypeScript errors
- [ ] Request creation works with new field structure
- [ ] Offer creation works with availableTimeSlots
- [ ] Service creation works with priceFrom/priceTo
- [ ] Professional matching returns correct data
- [ ] Wallet operations show correct click data
- [ ] Professional profiles display correctly
- [ ] Review listing works

---

## 🐛 If You Encounter Errors

Most remaining errors will be similar to what we fixed:

1. **"Property 'X' does not exist on type 'User'"**
   - Solution: Check if field is on Client/Professional instead

2. **"Property 'createdAt' does not exist on type 'ClickEvent'"**
   - Solution: Use `clickedAt` instead

3. **"X is possibly 'null'"**
   - Solution: Add null check `X ? X.someMethod() : defaultValue`

---

## 📝 Frontend Updates Needed

Your frontend will need to send new field structures:

### Old Request Format (DEPRECATED):
```json
{
  "budget": 10000,
  "location": "Paris",
  "remoteOk": false
}
```

### New Request Format (REQUIRED):
```json
{
  "budgetMin": 5000,
  "budgetMax": 10000,
  "locationType": "ON_SITE",
  "city": "Paris",
  "region": "Île-de-France",
  "country": "FR",
  "urgency": "FLEXIBLE"
}
```

---

Good luck with your build! 🎉
