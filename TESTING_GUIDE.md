# 🧪 Authentication Testing Guide - Step by Step

**Follow this guide to test your authentication system end-to-end.**

---

## 📋 Pre-Testing Checklist

Before you start testing, make sure you have:

- [ ] Clerk account created at [clerk.com](https://clerk.com)
- [ ] Clerk application created in dashboard
- [ ] Environment variables set in `.env` file
- [ ] Database is running and migrated
- [ ] Node modules installed (`npm install`)

---

## Step 1: Configure Clerk Dashboard 🔧

### 1.1 Get Your Clerk Keys

1. Go to: https://dashboard.clerk.com
2. Sign in to your account
3. Select your application (or create a new one)
4. Click on **"API Keys"** in the left sidebar
5. Copy your keys:
   - `Publishable key` (starts with `pk_test_...`)
   - `Secret key` (starts with `sk_test_...`)

### 1.2 Update Your .env File

Open your `.env` file and verify these keys are set:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/complete-profile
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/complete-profile
```

### 1.3 Configure Session Claims (CRITICAL!)

This is the most important step for role-based access to work:

1. In Clerk Dashboard, go to: **Sessions** (in left sidebar)
2. Click on **"Customize session token"**
3. You'll see a JSON editor
4. Paste this configuration:

```json
{
  "metadata": {
    "role": "{{user.public_metadata.role}}"
  }
}
```

5. Click **"Save"** at the bottom
6. ✅ **Done!** This allows the middleware to read user roles from the session

### 1.4 Configure Redirect URLs (Optional but Recommended)

1. In Clerk Dashboard, go to: **Paths** (in left sidebar)
2. Set these URLs:
   - **After sign-in URL**: `/complete-profile`
   - **After sign-up URL**: `/complete-profile`
3. Click **"Save"**

---

## Step 2: Verify Database Connection 💾

### 2.1 Check Database URL

Open your `.env` file and verify you have:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 2.2 Run Database Migrations

In your terminal, run:

```bash
npx prisma migrate deploy
```

Expected output:
```
✓ Database connection successful
✓ Applied migrations:
  └─ 20251121221955_init
```

### 2.3 (Optional) Seed the Database

If you want test categories and data:

```bash
npx prisma db seed
```

---

## Step 3: Build and Start the Application 🚀

### 3.1 Test the Build

First, make sure the build works:

```bash
npm run build
```

✅ **Expected**: Build completes successfully with no errors
❌ **If errors**: Check that all server-only imports are in place

### 3.2 Start Development Server

```bash
npm run dev
```

✅ **Expected output**:
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.3s
```

### 3.3 Open in Browser

Open your browser to: **http://localhost:3000**

You should see the SkillFind landing page.

---

## Step 4: Test Sign Up Flow ✍️

### 4.1 Navigate to Sign Up

1. Click **"Sign Up"** button on the landing page
2. OR go directly to: `http://localhost:3000/signup`

✅ **Expected**: You see the Clerk sign-up form

### 4.2 Create a New Account

Choose one of these methods:

**Option A: Email/Password**
1. Enter email: `client@test.com`
2. Enter password: `TestPassword123!`
3. Click **"Continue"**

**Option B: Google OAuth**
1. Click **"Continue with Google"**
2. Follow Google sign-in flow

### 4.3 Verify Email (if required)

Clerk might require email verification:
1. Check your email inbox
2. Click the verification link
3. Return to the browser

✅ **Expected**: After verification, you're redirected to `/complete-profile`

---

## Step 5: Complete Your Profile 📝

You should now be on the `/complete-profile` page.

### 5.1 Select Role (Step 1)

Choose a role:
- Click **"I'm a Client"** for testing client features
- Click **"I'm a Professional"** for testing pro features

Let's test as **CLIENT** first.

✅ **Expected**: After clicking, you move to Step 2 (profile form)

### 5.2 Fill Profile Details (Step 2)

Fill in all required fields:

| Field | Example Value |
|-------|---------------|
| **Date of Birth** | 1990-01-15 (must be 18+) |
| **Phone Number** | +33 6 12 34 56 78 |
| **City** | Paris |
| **Country** | France |
| **Terms Checkbox** | ✓ Check this |

### 5.3 Submit the Form

1. Click **"Complete Profile"**
2. Wait for processing (shows "Creating profile...")

✅ **Expected**: 
- Form submits successfully
- You're redirected to `/client` dashboard
- No errors shown

❌ **If error "User profile already exists"**: You already completed this profile. Sign out and create a new account.

---

## Step 6: Verify Database Records 🔍

### 6.1 Check User Record

Open Prisma Studio to see the database:

```bash
npx prisma studio
```

This opens: `http://localhost:5555`

### 6.2 Verify User Table

1. Click on **"User"** table
2. Find your user by email: `client@test.com`
3. Verify fields:
   - ✅ `role` = "CLIENT"
   - ✅ `email` = your email
   - ✅ `emailVerified` = true
   - ✅ `isOver18` = true
   - ✅ `clerkId` = starts with "user_"

### 6.3 Verify Client Table

1. Click on **"Client"** table
2. Find the record with your `userId`
3. Verify fields:
   - ✅ `city` = "Paris"
   - ✅ `country` = "FR"

✅ **Expected**: All records created correctly

---

## Step 7: Test Sign Out & Sign In 🔄

### 7.1 Sign Out

1. Click on your profile icon (top right)
2. Click **"Sign Out"**

✅ **Expected**: You're signed out and redirected to home page

### 7.2 Sign In Again

1. Go to: `http://localhost:3000/login`
2. Enter the same credentials:
   - Email: `client@test.com`
   - Password: `TestPassword123!`
3. Click **"Sign In"**

✅ **Expected**: 
- Sign in successful
- You're redirected to `/client` (NOT `/complete-profile`)
- This confirms the profile check works!

---

## Step 8: Test Role-Based Access 🛡️

### 8.1 Test Professional Route (Should Fail)

While signed in as CLIENT:
1. Try to access: `http://localhost:3000/pro`

✅ **Expected**: 
- You're redirected to `/` (home page)
- You cannot access the professional dashboard

### 8.2 Test Admin Route (Should Fail)

While signed in as CLIENT:
1. Try to access: `http://localhost:3000/admin/users`

✅ **Expected**:
- You're redirected to `/` (home page)
- You cannot access admin routes

---

## Step 9: Test Protected API Routes 🔒

### 9.1 Test Without Authentication

1. Sign out if signed in
2. Open a new terminal
3. Run this command:

```bash
curl http://localhost:3000/api/wallet
```

✅ **Expected response**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required. Please sign in."
}
```

### 9.2 Test With Authentication

This is more complex and requires a session cookie. We'll test via browser:

1. Sign in to your account
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Run this JavaScript:

```javascript
fetch('/api/user/profile')
  .then(r => r.json())
  .then(console.log)
```

✅ **Expected**: You see user profile data (not an error)

---

## Step 10: Test Professional Role 👔

### 10.1 Create Professional Account

1. Sign out
2. Go to: `http://localhost:3000/signup`
3. Create a new account with different email: `pro@test.com`
4. Complete profile and select **"I'm a Professional"**
5. Fill in the form with test data

✅ **Expected**: Redirected to `/pro` dashboard

### 10.2 Verify Wallet Creation

1. Open Prisma Studio: `npx prisma studio`
2. Click on **"Professional"** table
3. Find your professional record
4. Note the `id` (e.g., "cm4abc123...")
5. Click on **"Wallet"** table
6. Find wallet with `professionalId` matching your pro ID

✅ **Expected**: 
- Wallet exists
- `balance` = 0
- `currency` = "EUR"

### 10.3 Test Client Route (Should Fail)

While signed in as PROFESSIONAL:
1. Try to access: `http://localhost:3000/client`

✅ **Expected**: Redirected to `/` (cannot access client routes)

---

## Step 11: Test Edge Cases 🔧

### 11.1 Under 18 Validation

1. Sign out, create new account
2. On complete-profile, enter date of birth: `2010-01-01`
3. Try to submit

✅ **Expected**: Error message about age requirement

### 11.2 Missing Terms Checkbox

1. Fill the form completely
2. DO NOT check "I agree to Terms..."
3. Try to submit

✅ **Expected**: Browser validation prevents submission

### 11.3 Already Completed Profile

1. Sign in to an account that already completed profile
2. Manually navigate to: `http://localhost:3000/complete-profile`

✅ **Expected**: 
- Shows "Loading..." briefly
- Automatically redirects to your dashboard
- Prevents duplicate profile creation

---

## ✅ Testing Checklist Summary

Copy this checklist and mark off as you test:

### Setup
- [ ] Clerk keys configured in .env
- [ ] Session claims configured in Clerk Dashboard
- [ ] Database connected and migrated
- [ ] Build successful (`npm run build`)
- [ ] Dev server running (`npm run dev`)

### Sign Up Flow
- [ ] Can access signup page
- [ ] Can create new account
- [ ] Redirects to /complete-profile
- [ ] Can select role
- [ ] Can fill profile form
- [ ] Terms checkbox required
- [ ] Age validation works (18+)
- [ ] Profile creation successful
- [ ] Redirects to correct dashboard

### Sign In Flow
- [ ] Can access login page
- [ ] Can sign in with existing account
- [ ] Redirects to dashboard (not complete-profile)
- [ ] Session persists on refresh

### Role-Based Access
- [ ] CLIENT can access /client
- [ ] CLIENT cannot access /pro
- [ ] PROFESSIONAL can access /pro
- [ ] PROFESSIONAL cannot access /client
- [ ] Neither can access /admin

### Database
- [ ] User record created
- [ ] Client/Professional profile created
- [ ] Wallet created (for professionals)
- [ ] Clerk metadata updated

### API Protection
- [ ] Unauthenticated requests return 401
- [ ] Authenticated requests work
- [ ] Wrong role returns 403

---

## 🐛 Troubleshooting

### Problem: "Clerk is not defined" error

**Solution**:
1. Check `.env` file has correct Clerk keys
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Clear browser cache and cookies

### Problem: Stuck on "Loading..." at /complete-profile

**Solution**:
1. Check browser console for errors (F12)
2. Verify Clerk session claims are configured
3. Sign out and sign back in

### Problem: "Forbidden" error after completing profile

**Solution**:
1. Verify session claims are configured in Clerk Dashboard
2. Sign out and sign back in to refresh session
3. Check middleware.ts includes role checking

### Problem: Database connection error

**Solution**:
1. Verify DATABASE_URL in .env is correct
2. Make sure database is running
3. Run: `npx prisma migrate deploy`

### Problem: Build fails with import errors

**Solution**: Already fixed! But if you see this:
1. Verify all server modules have `import 'server-only'`
2. Check `src/app/page.tsx` has `export const dynamic = 'force-dynamic'`

---

## 🎉 Success Indicators

You've successfully tested authentication when:

✅ You can sign up and complete profile  
✅ You can sign in and access dashboard  
✅ Role-based routing works correctly  
✅ Protected routes require authentication  
✅ API routes return proper errors when unauthenticated  
✅ Database records are created correctly  
✅ Session persists across page refreshes  

---

## 📸 Screenshots to Take (Optional)

For documentation purposes, take screenshots of:
1. Sign up page
2. Complete profile - role selection
3. Complete profile - form
4. Client dashboard
5. Professional dashboard
6. Prisma Studio showing your user data

---

## Next Steps After Testing ✨

Once authentication is fully tested and working:

1. **Build Client Dashboard** - Connect to request APIs
2. **Build Professional Dashboard** - Show matching requests
3. **Add Profile Editing** - Let users update their info
4. **Configure Payments** - Set up Stripe integration
5. **Add Email Notifications** - Configure SendGrid

---

**Ready to start? Begin with Step 1! 🚀**
