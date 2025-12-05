# Prisma 7 Configuration Guide

This document describes the correct configuration for Prisma 7 with Supabase, including common pitfalls to avoid.

## Correct Configuration

### `prisma.config.ts`

```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';  // ← IMPORTANT: Use 'prisma/config', NOT '@prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: env('DATABASE_URL'),  // ← Use env() helper, not process.env
    },
});
```

### `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}
```

> **Note:** When using `prisma.config.ts`, the datasource URL is configured there, not in the schema file.

---

## Common Mistakes to Avoid

### ❌ Wrong Import Path

```typescript
// WRONG - causes silent failures with env() helper
import { defineConfig, env } from "@prisma/config"

// CORRECT
import { defineConfig, env } from 'prisma/config'
```

### ❌ Using process.env Instead of env()

```typescript
// WRONG - may not load .env properly
url: process.env.DATABASE_URL

// CORRECT
url: env('DATABASE_URL')
```

### ❌ Adding URL to Schema When Using prisma.config.ts

```prisma
// WRONG - conflicts with prisma.config.ts
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// CORRECT - just provider when using prisma.config.ts
datasource db {
  provider = "postgresql"
}
```

---

## Supabase Connection Strings

Your `.env` file should have:

```env
# For application runtime (transaction pooler, port 6543)
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For Prisma CLI/migrations (session mode, port 5432) - optional
DIRECT_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
```

**Key differences:**
- `DATABASE_URL`: Port 6543 with `?pgbouncer=true` for pooled connections
- `DIRECT_URL`: Port 5432 without pgbouncer for direct connections

---

## Symptoms of Misconfiguration

If your `prisma.config.ts` has the wrong import path, you'll see errors like:

```
select "ns"."nspname" as "schema", "cls"."relname" as "name", 
(select coalesce(json_agg(agg), '[]') from (select "att"."attname" as "name"...
```

This PostgreSQL introspection query error is **misleading** - it looks like a database problem but is actually caused by the `env()` helper failing to read environment variables due to the incorrect import path.

---

## Quick Reference

| Component | Correct Value |
|-----------|---------------|
| Import path | `'prisma/config'` |
| Env helper | `env('DATABASE_URL')` |
| Schema datasource | Only `provider`, no URL |

---

*Last updated: December 5, 2025*
*Issue discovered during Prisma 7.1 setup with Supabase*
