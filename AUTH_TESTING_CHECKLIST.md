# Authentication System Testing Checklist

## 🧪 Complete Testing Guide

This document provides a comprehensive checklist for testing the improved authentication system.

## ✅ Pre-Testing Setup

- [x] Database cleared of test users (completed earlier)
- [x] Dev server running on http://localhost:3000
- [x] Clerk dashboard accessible for monitoring
- [ ] Browser console open for monitoring logs
- [ ] Network tab open for monitoring API calls

## 📋 Test Scenarios

### 1. New User - Complete Profile Flow

**Test Case**: Brand new user completes full profile

**Steps**:
1. Navigate to `/signup`
2. Sign up with a new email
3. Wait for redirect to `/auth-redirect`
4. Verify "Welcome to SkillFind" heading appears
5. Select CLIENT role
6. Verify profile completion form appears
7. Fill in all fields:
   - Date of Birth (18+ years old)
   - Phone Number (E.164 format: +33612345678)
   - City (e.g., Paris)
   - Country (e.g., France)
8. Click "Complete Profile"
9. Verify redirect to `/client` dashboard

**Expected Console Logs**:
```
👤 User selected role: CLIENT
✅ Role saved
🔄 User session refreshed
📝 Submitting profile completion form...
📤 Sending payload
✅ Profile completed successfully
🔄 Preparing to redirect to /client...
➡️ Redirecting to /client
```

**Expected Results**:
- ✅ No errors displayed
- ✅ Smooth redirect to client dashboard
- ✅ User appears in database with CLIENT role
- ✅ Client profile created in database
- ✅ Clerk metadata has role: CLIENT

---

### 2. New User - Skip Profile Flow

**Test Case**: New user skips profile completion

**Steps**:
1. Navigate to `/signup`
2. Sign up with a new email
3. Wait for redirect to `/auth-redirect`
4. Select PROFESSIONAL role
5. Verify profile completion form appears
6. Click "Skip for Now" (don't fill any fields)
7. Verify redirect to `/pro` dashboard

**Expected Console Logs**:
```
👤 User selected role: PROFESSIONAL
✅ Role saved
⏭️ Skipping profile completion, creating minimal profile...
✅ Profile created
🔄 Preparing to redirect to /pro...
➡️ Redirecting to /pro
```

**Expected Results**:
- ✅ No errors displayed
- ✅ Redirect to professional dashboard
- ✅ User created in database with minimal data
- ✅ Professional profile created
- ✅ Wallet initialized with 0 balance
- ✅ Profile completion shows low percentage

---

### 3. Existing User - Complete Profile

**Test Case**: User with account logs in successfully

**Steps**:
1. Log out from previous test
2. Navigate to `/login`
3. Sign in with previous account
4. Verify immediate redirect to appropriate dashboard

**Expected Console Logs**:
```
Profile check result: { exists: true, hasProfile: true, role: 'CLIENT' }
Redirecting to dashboard: /client
```

**Expected Results**:
- ✅ No onboarding steps shown
- ✅ Immediate redirect to dashboard
- ✅ No unnecessary API calls
- ✅ Fast login experience

---

### 4. Phone Number Validation

**Test Case**: Validate phone number format checking

**Steps**:
1. Start new signup → select role → reach profile form
2. Enter invalid phone numbers:
   - `123456789` (no country code)
   - `+1` (too short)
   - `++33612345678` (double plus)
   - `+33 6 12 34 56 78` (with spaces)
3. Try to submit
4. Verify error message appears

**Expected Results**:
- ✅ Red error message: "Please enter phone in international format..."
- ✅ Field highlighted in red
- ✅ Form does not submit

**Valid Formats to Test**:
- `+33612345678` (France)
- `+1234567890` (US)
- `+447123456789` (UK)
- `+4917612345678` (Germany)

---

### 5. Age Validation (18+)

**Test Case**: Prevent users under 18 from signing up

**Steps**:
1. Start new signup → select role → reach profile form
2. Enter date of birth less than 18 years ago
3. Fill other fields
4. Click "Complete Profile"
5. Verify error appears

**Expected Results**:
- ✅ Error message about age requirement
- ✅ Profile not created
- ✅ Console shows: `❌ Age validation failed`

---

### 6. Network Failure - Error Recovery

**Test Case**: Handle network failures gracefully

**Steps**:
1. Open DevTools → Network tab
2. Start new signup → select role
3. Before clicking "Complete Profile", set network to Offline
4. Click "Complete Profile"
5. Verify error message appears
6. Set network back to Online
7. Dismiss error and try again

**Expected Results**:
- ✅ Error message displayed with icon
- ✅ Dismiss button works
- ✅ Retry counter visible (if multiple attempts)
- ✅ Second attempt succeeds

---

### 7. Middleware - Incomplete Profile Protection

**Test Case**: Users without complete profiles can't access protected routes

**Steps**:
1. Clear Clerk session (log out)
2. Manually navigate to `/client` or `/pro` while logged out
3. Verify redirect to `/login`
4. Log in with incomplete profile (if you have one)
5. Try to access protected route
6. Verify redirect to `/auth-redirect`

**Expected Results**:
- ✅ Logged out users redirected to `/login`
- ✅ Users without roles redirected to `/auth-redirect`
- ✅ API returns 403 with helpful message

---

### 8. Middleware - Role-Based Access

**Test Case**: Users can only access their role-specific routes

**Steps**:
1. Log in as CLIENT
2. Try to navigate to `/pro` (professional route)
3. Verify redirect to homepage
4. Try to call `/api/pro/*` endpoints
5. Verify 403 Forbidden response

**Expected Results**:
- ✅ Redirect to homepage for wrong role
- ✅ API returns 403 with message: "Access denied. Professional role required."

---

### 9. Clerk Metadata Sync

**Test Case**: Ensure Clerk metadata stays in sync with database

**Steps**:
1. Complete full signup flow
2. Open Clerk Dashboard → Users
3. Find your test user
4. Check Metadata → Public Metadata
5. Verify `role` field matches database

**Expected Results**:
- ✅ Clerk publicMetadata.role matches database user.role
- ✅ Role persists across sessions

---

### 10. Redirect Loop Prevention

**Test Case**: No redirect loops during authentication

**Steps**:
1. Open DevTools → Network tab
2. Sign up with new account
3. Monitor redirects during onboarding
4. Count number of redirects

**Expected Results**:
- ✅ Clean redirect flow (no loops)
- ✅ Maximum 2-3 redirects (signup → auth-redirect → dashboard)
- ✅ No infinite redirect cycles
- ✅ Console shows proper step progression

---

### 11. Skip Button Edge Case

**Test Case**: Skip without any data entry works properly

**Steps**:
1. New signup → select role
2. Don't touch any form fields
3. Click "Skip for Now"
4. Monitor console logs
5. Verify successful redirect

**Expected Console Logs**:
```
⏭️ Skipping profile completion, creating minimal profile...
🆕 Creating new user in database...
✅ User created in database: [id]
🔨 Creating professional profile...
✅ Professional profile and wallet created
✅ Clerk metadata updated with role
🎉 Account creation complete!
```

**Expected Results**:
- ✅ No validation errors
- ✅ User created with null/empty optional fields
- ✅ Profile completion percentage is low (10%)
- ✅ Redirect successful

---

### 12. Database State Verification

**Test Case**: Verify database records are created correctly

**Steps**:
1. After completing a full signup flow
2. Check database tables:
   - `User` table
   - `Client` or `Professional` table
   - `Wallet` table (for professionals)

**Expected Results**:

**For Client**:
```sql
-- User record
SELECT * FROM "User" WHERE email = 'testuser@example.com';
-- Should have: clerkId, email, firstName, lastName, role='CLIENT'

-- Client profile
SELECT * FROM "Client" WHERE "userId" = [user_id];
-- Should have: userId, city, country
```

**For Professional**:
```sql
-- User record
SELECT * FROM "User" WHERE email = 'testpro@example.com';
-- Should have: clerkId, email, firstName, lastName, role='PROFESSIONAL'

-- Professional profile
SELECT * FROM "Professional" WHERE "userId" = [user_id];
-- Should have: userId, city, country, profileCompletion

-- Wallet
SELECT * FROM "Wallet" WHERE "professionalId" = [professional_id];
-- Should have: professionalId, balance=0
```

---

### 13. Session Refresh Test

**Test Case**: Session updates properly after role selection

**Steps**:
1. New signup → select role
2. Monitor user object in console
3. After role saved, check if user metadata updated
4. Verify session reflects new role immediately

**Expected Results**:
- ✅ Console shows: `🔄 User session refreshed`
- ✅ user.publicMetadata.role is updated
- ✅ No need to refresh page manually

---

### 14. Error Message Quality

**Test Case**: Error messages are helpful and actionable

**Steps**:
1. Trigger various errors intentionally:
   - Invalid phone format
   - Under 18 years old
   - Network failure
   - Invalid role selection
2. Read error messages

**Expected Results**:
- ✅ Error messages explain what went wrong
- ✅ Error messages suggest how to fix
- ✅ Visual indicators (⚠️ icon, red colors)
- ✅ Dismiss button available
- ✅ Retry counter visible

---

### 15. Loading States

**Test Case**: Loading indicators show during async operations

**Steps**:
1. During signup flow, monitor loading states:
   - Role selection
   - Profile completion
   - Redirect
2. Verify spinners and messages appear

**Expected Results**:
- ✅ "Setting up your account..." during initial load
- ✅ Buttons disabled during loading
- ✅ "Saving..." text on submit buttons
- ✅ "Taking you to your dashboard..." during redirect
- ✅ Spinner animation visible

---

## 🎯 Quick Test Summary

| Test | Status | Notes |
|------|--------|-------|
| New user complete profile | ⬜ | |
| New user skip profile | ⬜ | |
| Existing user login | ⬜ | |
| Phone validation | ⬜ | |
| Age validation | ⬜ | |
| Network failure recovery | ⬜ | |
| Middleware protection | ⬜ | |
| Role-based access | ⬜ | |
| Clerk metadata sync | ⬜ | |
| No redirect loops | ⬜ | |
| Skip edge case | ⬜ | |
| Database verification | ⬜ | |
| Session refresh | ⬜ | |
| Error message quality | ⬜ | |
| Loading states | ⬜ | |

---

## 🐛 Bug Report Template

If you find any issues during testing, use this template:

```
**Bug Title**: [Brief description]

**Test Scenario**: [Which test case from above]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
- 

**Actual Behavior**:
- 

**Console Logs**:
```
[Paste relevant console logs]
```

**Network Activity**:
- Request URL:
- Status Code:
- Response:

**Environment**:
- Browser:
- Clerk Environment:
- Database State:
```

---

## ✨ Success Criteria

All tests pass when:
- ✅ No redirect loops occur
- ✅ All error cases handled gracefully
- ✅ Database records created correctly
- ✅ Clerk metadata in sync
- ✅ Loading states show appropriately
- ✅ Error messages are helpful
- ✅ Both skip and complete flows work
- ✅ Role-based access enforced
- ✅ Session updates properly
- ✅ Edge cases handled

---

## 📱 Additional Testing (Optional)

### Mobile Testing
- Test on mobile viewport (Chrome DevTools)
- Verify forms are responsive
- Check touch interactions

### Browser Compatibility
- Test on Chrome
- Test on Firefox
- Test on Safari
- Test on Edge

### Performance Testing
- Monitor page load times
- Check API response times
- Verify no memory leaks
- Test with slow 3G network throttling
