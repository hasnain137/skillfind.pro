# 🔧 Clerk Hosted Pages Issue

## Problem
When visiting `http://localhost:3000/signup`, Clerk redirects to:
```
https://picked-shiner-35.accounts.dev/sign-up
```

This means Clerk is using **hosted pages** instead of your custom embedded signup page.

## Root Cause
This happens when Clerk's Dashboard is configured to use "Hosted Pages" mode instead of "Embedded" mode, OR when the environment variables aren't being picked up correctly.

## Solution

### Option 1: Verify Clerk Dashboard Settings (RECOMMENDED)

1. Go to: https://dashboard.clerk.com/
2. Select your application: **picked-shiner-35**
3. Navigate to: **Paths** (in the left sidebar)
4. Look for **Component Mode** or **Page Mode** setting
5. Ensure it's set to: **"Use embedded components"** or **"Component mode"**
   - NOT "Hosted pages mode"

### Option 2: Check Environment Variables

Your `.env` file has the correct variables:
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/complete-profile
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/complete-profile
```

**Action**: Restart dev server (already done)

### Option 3: Update SignUp Component Props

If the above doesn't work, we can force the component to use the embedded mode by updating the SignUp component in `src/app/signup/page.tsx`.

Current configuration:
```tsx
<SignUp
  routing="path"
  path="/signup"
  signInUrl="/login"
  afterSignUpUrl="/complete-profile"
/>
```

This should work, but if Clerk Dashboard overrides it, we need to change the Dashboard settings.

## Verification Steps

After applying the fix:

1. **Restart dev server** (done)
2. **Clear browser cache and cookies** for localhost:3000
3. **Visit**: http://localhost:3000/signup
4. **Expected**: See the custom signup form on your domain
5. **Should NOT**: Redirect to `accounts.dev`

## What Should Happen

### ✅ Correct Behavior (Embedded)
```
User visits: http://localhost:3000/signup
↓
Shows: Custom signup form with SkillFind branding
↓
User fills form and submits
↓
Redirects to: http://localhost:3000/complete-profile
```

### ❌ Current Behavior (Hosted)
```
User visits: http://localhost:3000/signup
↓
Redirects to: https://picked-shiner-35.accounts.dev/sign-up
↓
User fills form on Clerk's hosted page
↓
Redirects back to: http://localhost:3000/complete-profile
```

## Why This Matters

**Embedded mode** (what you want):
- ✅ Custom branding and styling
- ✅ Full control over the UI
- ✅ Seamless user experience
- ✅ Keeps users on your domain

**Hosted mode** (what's happening now):
- ❌ Uses Clerk's default styling
- ❌ Takes users off your domain
- ❌ Less control over the flow
- ⚠️ Can still work, but not ideal for your use case

## Clerk Dashboard Configuration

### To Change from Hosted to Embedded:

1. **Dashboard** → Your App → **Paths**
2. Look for these settings:
   - **Sign-in page**: Should be `/login` (not a full URL)
   - **Sign-up page**: Should be `/signup` (not a full URL)
   - **Component mode**: Should be enabled/selected

3. If you see options like:
   - "Use Clerk Hosted Pages" → Disable this
   - "Use embedded components" → Enable this

## Alternative: Keep Using Hosted Pages

If you want to keep using Clerk's hosted pages (simpler, but less customizable):

1. **Update environment variables** in `.env`:
```env
# Change these to full URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://picked-shiner-35.accounts.dev/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://picked-shiner-35.accounts.dev/sign-up
```

2. **Remove custom pages**:
   - Keep `/signup` and `/login` pages OR
   - Redirect them to Clerk's hosted pages

3. **Update Navbar links** to point to Clerk's hosted pages

**Note**: This is NOT recommended for your project since you've already built custom branded pages.

## Testing After Fix

```bash
# 1. Restart dev server (done)
# 2. Clear browser cache
# 3. Visit signup page
curl -I http://localhost:3000/signup

# Should return:
# Status: 200 OK
# Should NOT redirect to accounts.dev
```

## Expected Result

After fixing the Clerk Dashboard settings:
- ✅ `/signup` shows your custom page (stays on localhost:3000)
- ✅ `/login` shows your custom page (stays on localhost:3000)
- ✅ Forms work and redirect to `/complete-profile`
- ✅ No redirects to `accounts.dev`

---

**Next Step**: Check your Clerk Dashboard settings and switch from "Hosted Pages" to "Component Mode"

Dashboard URL: https://dashboard.clerk.com/apps/
