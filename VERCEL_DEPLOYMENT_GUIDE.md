# 🚀 Vercel Deployment Guide - SkillFind

## ❌ Current Error:

```
Missing required environment variable: DATABASE_URL
```

---

## ✅ **Fix: Add Environment Variables in Vercel**

### **Step 1: Go to Vercel Dashboard**
1. Visit: https://vercel.com/dashboard
2. Select your project: `skillfind.pro`
3. Click **Settings**
4. Click **Environment Variables** (left sidebar)

---

### **Step 2: Add Required Variables**

Add these environment variables (copy from your local `.env` file):

#### **Required Variables:**

**1. DATABASE_URL** (Production)
```
postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```
- Environment: `Production`, `Preview`, `Development`
- ⚠️ Must use **connection pooling URL** (port 6543)

**2. DIRECT_URL** (for migrations)
```
postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```
- Environment: `Production`, `Preview`, `Development`
- ⚠️ Direct connection (port 5432)

**3. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
```
pk_test_...
```
- Environment: `Production`, `Preview`, `Development`
- ⚠️ Use production key for Production environment

**4. CLERK_SECRET_KEY**
```
sk_test_...
```
- Environment: `Production`, `Preview`, `Development`
- ⚠️ Use production key for Production environment

---

### **Step 3: Get Your Supabase URLs**

#### Option A: From Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection String**
5. Select **Session mode** for DATABASE_URL
6. Select **Transaction mode** for DIRECT_URL
7. Copy the URLs

#### Option B: From Your Local `.env`
```bash
cd skillfind
cat .env
```

Copy the values for:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

---

### **Step 4: Format for Vercel**

In Vercel, add each variable:

**Name:** `DATABASE_URL`  
**Value:** `postgresql://postgres.abc...`  
**Environment:** Select all three (Production, Preview, Development)

**Name:** `DIRECT_URL`  
**Value:** `postgresql://postgres.abc...`  
**Environment:** Select all three

**Name:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  
**Value:** `pk_test_...`  
**Environment:** Select all three

**Name:** `CLERK_SECRET_KEY`  
**Value:** `sk_test_...`  
**Environment:** Select all three

---

### **Step 5: Redeploy**

After adding all variables:
1. Click **Save**
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger deployment

---

## 🔒 **Important Notes:**

### **Production vs Test Keys**

**For Production Deployment:**
- Use Clerk **production** keys
- Format: `pk_live_...` and `sk_live_...`

**For Preview/Development:**
- Use Clerk **test** keys
- Format: `pk_test_...` and `sk_test_...`

### **Clerk Domain Configuration**

After deployment:
1. Go to Clerk Dashboard
2. Navigate to **Configure** → **Domains**
3. Add your Vercel domain:
   - Production: `your-app.vercel.app`
   - Or your custom domain

---

## ✅ **Verification Checklist**

After adding environment variables and redeploying:

- [ ] Build completes successfully
- [ ] No environment variable errors
- [ ] Prisma Client generates
- [ ] Application deploys
- [ ] Can visit the live URL
- [ ] Database connection works
- [ ] Clerk authentication works
- [ ] API endpoints respond

---

## 🐛 **Troubleshooting**

### Error: "Missing DATABASE_URL"
✅ **Fix:** Add DATABASE_URL in Vercel environment variables

### Error: "Can't reach database server"
✅ **Fix:** 
- Check DATABASE_URL is correct
- Use connection pooling URL (port 6543)
- Ensure Supabase allows connections from Vercel

### Error: "Invalid Clerk key"
✅ **Fix:**
- Verify keys are correct
- Add Vercel domain to Clerk dashboard
- Check you're using the right keys (test vs production)

### Error: "Cannot find module '.prisma/client'"
✅ **Fix:** Already fixed with `postinstall` script

---

## 📝 **Your Current Setup**

Based on your `.env` file, you should have:

```
DATABASE_URL=postgresql://...supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...supabase.com:5432/postgres
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Copy these exact values to Vercel.

---

## 🎯 **Next Steps**

1. **Add environment variables in Vercel** (see Step 2 above)
2. **Redeploy** the application
3. **Wait for build to complete**
4. **Test the live site**

---

**Need Help?**

If you're stuck, provide:
- Screenshot of Vercel environment variables page
- Current error from Vercel deployment logs
- Confirmation that Supabase database is accessible

---

**Once you add the environment variables, the deployment will succeed!** 🚀
