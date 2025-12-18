# Prisma Studio Connection Error Fix

## Problem
You're getting SQL errors in Prisma Studio because:
1. Your **DIRECT_URL** (direct database connection) is not accessible from your network
2. Your **DATABASE_URL** (pooler connection) uses pgBouncer, which Prisma Studio doesn't support well

The error you see is related to Prisma Studio trying to introspect the database schema through pgBouncer, which doesn't handle prepared statements correctly.

## Solutions

### Option 1: Use Supabase Studio (Recommended)
Instead of Prisma Studio, use Supabase's built-in database viewer:

1. Go to https://supabase.com/dashboard
2. Select your project: `jppugzqceagjnbqlzaxr`
3. Click on "Table Editor" in the left sidebar
4. You can view and edit your data directly there

**Advantages:**
- No connection issues
- Better integrated with Supabase
- More features for Supabase-specific functionality

### Option 2: Enable Direct Connection
If you need Prisma Studio specifically, you need to allow direct database connections:

1. Go to Supabase Dashboard → Project Settings → Database
2. Under "Connection Pooling", find your direct connection settings
3. Check if your IP is whitelisted or if there's a firewall blocking port 5432
4. Add your IP address to the allowed list if needed

### Option 3: Use Supabase Connection Pooler in Session Mode
Modify your `.env` to use session mode instead of transaction mode:

```env
STUDIO_URL="postgresql://postgres.jppugzqceagjnbqlzaxr:kF9VwQxuNmtGSrF1@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&pgbouncer_mode=session"
```

Then run:
```bash
cd skillfind
npx prisma studio
```

### Option 4: Use Supabase Local Development
For local development with full Prisma Studio support:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (includes local database)
supabase start

# Update .env for local development
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
```

## Current Configuration Status

Your `prisma.config.ts` is now set up to use `STUDIO_URL` for Prisma Studio connections.

**For your application runtime**, you should use:
- `DATABASE_URL` (pooler with pgbouncer) - for app queries
- `DIRECT_URL` (direct connection) - for migrations

**For Prisma Studio**, you need:
- Either the direct connection to work (Option 2)
- Or use Supabase Studio instead (Option 1 - Recommended)

## Testing the Connection

Test if your database is reachable:
```bash
# Test pooler
Test-NetConnection -ComputerName aws-1-eu-west-3.pooler.supabase.com -Port 6543

# Test direct connection
Test-NetConnection -ComputerName db.jppugzqceagjnbqlzaxr.supabase.co -Port 5432
```

## Next Steps

1. **Recommended**: Use Supabase Studio for database browsing (Option 1)
2. **If you need Prisma Studio**: Contact your network admin to whitelist Supabase IPs or enable the direct connection (Option 2)
3. **For local dev**: Set up Supabase local development (Option 4)
