# 🐛 Debugging Vercel Runtime Errors

## ✅ Build Deployed Successfully
But getting **500 Internal Server Error** when visiting the website.

---

## 🔍 How to Debug:

### **Step 1: Check Vercel Runtime Logs**

1. Go to your Vercel Dashboard
2. Click on your deployment
3. Click **Functions** tab (or **Logs** tab)
4. Look for error messages

**Common errors to look for:**
- Database connection errors
- Prisma Client errors
- Environment variable issues
- Module not found errors

---

### **Step 2: Check Specific Pages**

Try visiting different URLs to narrow down the issue:

**Test URLs:**
- `/` - Landing page
- `/login` - Login page (should work without DB)
- `/signup` - Signup page (should work without DB)
- `/api/test` - Test API endpoint

---

## 🔧 **Most Likely Issues:**

### **Issue 1: Database Connection**
**Error:** Can't connect to Supabase database

**Check:**
1. Are `DATABASE_URL` and `DIRECT_URL` correctly set in Vercel?
2. Does Supabase allow connections from Vercel IPs?
3. Is the connection string using the pooling URL (port 6543)?

**Fix:**
- Update environment variables in Vercel
- Verify Supabase database is accessible

---

### **Issue 2: Prisma Client Not Generated**
**Error:** `Cannot find module '@prisma/client'`

**Fix:**
Already handled with `prisma generate` in build script ✅

---

### **Issue 3: Prisma Config Issue**
**Error:** Prisma can't read `DATABASE_URL`

**Check:**
Does `prisma/prisma.config.ts` work in production?

**Potential Fix:**
We might need to update how Prisma reads the config in production.

---

### **Issue 4: Clerk Configuration**
**Error:** Clerk authentication failing

**Check:**
1. Is `CLERK_SECRET_KEY` set in Vercel?
2. Is your Vercel domain added to Clerk dashboard?

**Fix:**
- Add Vercel domain to Clerk: https://dashboard.clerk.com
- Go to **Configure** → **Domains**
- Add your Vercel URL (e.g., `your-app.vercel.app`)

---

## 📋 **Quick Diagnostic Steps:**

### **1. Check if it's a database issue:**
Visit: `https://your-app.vercel.app/login`
- ✅ **Works**: Database might be the issue
- ❌ **Fails**: More fundamental issue (Clerk, build, etc.)

### **2. Check logs in Vercel:**
Look for these error patterns:
```
- PrismaClientInitializationError
- Can't reach database server
- Invalid Clerk key
- Module not found
- Unexpected token
```

### **3. Test API directly:**
Visit: `https://your-app.vercel.app/api/test`
Should return: `{ "message": "API is working" }`

---

## 🎯 **Next Steps:**

1. **Share the error from Vercel logs** - I need to see the actual error message
2. **Try visiting `/login`** - Does it work?
3. **Check environment variables** - Are they all set correctly?

---

## 📝 **How to Get Vercel Logs:**

### Method 1: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click on the latest deployment
4. Click **Functions** → Find the error
5. Or click **Runtime Logs** → Filter by errors

### Method 2: Vercel CLI (if installed)
```bash
vercel logs https://your-app.vercel.app
```

---

## 💡 **Share With Me:**

Please provide:
1. **Error message from Vercel logs** (screenshot or text)
2. **Which URL gives the error** (all pages or specific ones?)
3. **Screenshot of Vercel environment variables** (names only, not values)

With this info, I can give you an exact fix! 🚀
