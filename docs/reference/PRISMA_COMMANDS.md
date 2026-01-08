# 📚 Prisma Commands Reference Guide

> **Version:** Prisma 7.x  
> **Project:** Skillfind Platform  
> **Database:** PostgreSQL (Supabase)

---

## 🚀 Quick Start - Most Common Commands

These are the commands you'll use 90% of the time:

```bash
# Generate Prisma Client (run after any schema changes)
npx prisma generate

# Create and apply migration (development)
npx prisma migrate dev --name description_of_changes

# Open database GUI
npx prisma studio

# Seed database with initial data
npx prisma db seed

# Check migration status
npx prisma migrate status
```

---

## 📖 Table of Contents

1. [Client Generation](#1-client-generation)
2. [Migrations (Development)](#2-migrations-development)
3. [Migrations (Production)](#3-migrations-production)
4. [Database Operations](#4-database-operations)
5. [Seeding](#5-seeding)
6. [Introspection](#6-introspection)
7. [Studio (Database GUI)](#7-studio-database-gui)
8. [Validation & Formatting](#8-validation--formatting)
9. [Debugging & Troubleshooting](#9-debugging--troubleshooting)
10. [Advanced Commands](#10-advanced-commands)

---

## 1. Client Generation

### `npx prisma generate`

**What it does:** Generates the Prisma Client based on your `schema.prisma` file.

**When to use:**
- ✅ After any changes to `schema.prisma`
- ✅ After pulling the project for the first time
- ✅ After running migrations
- ✅ When TypeScript can't find Prisma types

**Example:**
```bash
npx prisma generate
```

**Output:**
```
✔ Generated Prisma Client (v7.0.0) to ./node_modules/@prisma/client in 123ms
```

---

## 2. Migrations (Development)

### `npx prisma migrate dev`

**What it does:** Creates a new migration from schema changes and applies it to the database.

**When to use:**
- ✅ During development when you change the schema
- ✅ Adding new models/fields
- ✅ Modifying existing models
- ✅ Creating indexes or constraints

**Example:**
```bash
# Create migration with descriptive name
npx prisma migrate dev --name add_user_verification

# Create migration and skip seed
npx prisma migrate dev --name add_booking_status --skip-seed

# Create migration without prompts
npx prisma migrate dev --name update_prices --skip-generate
```

**What happens:**
1. Compares schema with database
2. Creates migration SQL file in `prisma/migrations/`
3. Applies migration to database
4. Regenerates Prisma Client
5. Runs seed script (if configured)

---

### `npx prisma migrate reset`

**What it does:** ⚠️ **DANGER!** Drops entire database, recreates it, and applies all migrations.

**When to use:**
- ⚠️ Only in development!
- 🔴 When your migration history is broken
- 🔴 When you want a fresh start
- 🔴 **NEVER in production!**

**Example:**
```bash
npx prisma migrate reset

# Skip confirmation prompt
npx prisma migrate reset --force

# Reset and skip seed
npx prisma migrate reset --skip-seed
```

**What happens:**
1. Drops all tables and data ⚠️
2. Recreates database
3. Applies all migrations from scratch
4. Runs seed script

---

### `npx prisma migrate dev --create-only`

**What it does:** Creates migration file without applying it.

**When to use:**
- ✅ When you want to review/edit SQL before applying
- ✅ For complex migrations that need manual adjustments
- ✅ When generating migration for code review

**Example:**
```bash
npx prisma migrate dev --create-only --name add_complex_constraint
```

---

## 3. Migrations (Production)

### `npx prisma migrate deploy`

**What it does:** Applies pending migrations to production database.

**When to use:**
- ✅ In CI/CD pipeline before deployment
- ✅ On production server after code deployment
- ✅ Never creates new migrations, only applies existing ones

**Example:**
```bash
# Standard deployment
npx prisma migrate deploy

# In Docker/CI environment
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**Best Practice - Production Deployment:**
```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Apply migrations
npx prisma migrate deploy

# 3. Start application
npm start
```

---

### `npx prisma migrate status`

**What it does:** Shows which migrations are applied and which are pending.

**When to use:**
- ✅ Before deploying to production
- ✅ To verify migration state
- ✅ When debugging migration issues

**Example:**
```bash
npx prisma migrate status
```

**Output:**
```
Status
1 migration found in prisma/migrations

Following migration have been applied:
20251121221955_init

Database schema is up to date!
```

---

### `npx prisma migrate resolve`

**What it does:** Marks a failed migration as rolled back or applied.

**When to use:**
- 🔧 When migration failed halfway
- 🔧 Manual recovery after migration errors
- 🔧 Fixing migration history inconsistencies

**Example:**
```bash
# Mark as applied (if manually fixed)
npx prisma migrate resolve --applied "20251121221955_init"

# Mark as rolled back (if migration failed)
npx prisma migrate resolve --rolled-back "20251121221955_init"
```

---

## 4. Database Operations

### `npx prisma db push`

**What it does:** Pushes schema changes directly to database WITHOUT creating migration files.

**When to use:**
- ✅ Rapid prototyping in development
- ✅ When you don't need migration history
- ⚠️ Not recommended for production
- ⚠️ Can cause data loss if not careful

**Example:**
```bash
# Push schema changes
npx prisma db push

# Skip generation step
npx prisma db push --skip-generate

# Accept data loss warnings
npx prisma db push --accept-data-loss
```

**Pros:**
- Fast iteration
- No migration files to manage

**Cons:**
- No migration history
- Harder to track changes
- Can't review SQL before applying

---

### `npx prisma db pull`

**What it does:** Introspects database and updates `schema.prisma` to match.

**When to use:**
- ✅ Connecting to existing database
- ✅ Someone made manual database changes
- ✅ Syncing schema with database state

**Example:**
```bash
# Pull schema from database
npx prisma db pull

# Pull and force overwrite
npx prisma db pull --force
```

**Workflow:**
```bash
# 1. Pull schema from database
npx prisma db pull

# 2. Generate client
npx prisma generate

# 3. Review schema.prisma for any changes
```

---

### `npx prisma db execute`

**What it does:** Executes raw SQL against the database.

**When to use:**
- ✅ Running custom SQL queries
- ✅ Database maintenance tasks
- ✅ Bulk operations not supported by migrations

**Example:**
```bash
# Execute SQL from stdin
echo "SELECT COUNT(*) FROM \"User\";" | npx prisma db execute --stdin

# Execute SQL from file
npx prisma db execute --file ./scripts/fix_data.sql

# Execute inline SQL
npx prisma db execute --stdin <<< "VACUUM ANALYZE;"
```

---

## 5. Seeding

### `npx prisma db seed`

**What it does:** Runs the seed script defined in `package.json`.

**When to use:**
- ✅ After fresh database setup
- ✅ Populating initial/required data
- ✅ After `prisma migrate reset`
- ✅ Setting up development environment

**Configuration (package.json):**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Example:**
```bash
# Run seed script
npx prisma db seed

# Seed is also automatically run after:
# - prisma migrate dev
# - prisma migrate reset
```

**Your Seed File Location:**
```
prisma/seed.ts
```

---

## 6. Introspection

### `npx prisma db pull` (Introspection)

**What it does:** Generates Prisma schema from existing database.

**When to use:**
- ✅ First time connecting to existing database
- ✅ Importing legacy database
- ✅ Syncing after manual database changes

**Example:**
```bash
# Basic introspection
npx prisma db pull

# Force overwrite existing schema
npx prisma db pull --force

# Print schema without writing to file
npx prisma db pull --print
```

**Workflow for existing database:**
```bash
# 1. Configure DATABASE_URL in .env
# 2. Run introspection
npx prisma db pull

# 3. Review generated schema.prisma
# 4. Make any manual adjustments
# 5. Generate client
npx prisma generate
```

---

## 7. Studio (Database GUI)

### `npx prisma studio`

**What it does:** Opens a web-based GUI to view/edit database data.

**When to use:**
- ✅ Viewing data during development
- ✅ Manually editing records
- ✅ Debugging data issues
- ✅ Quick database inspection

**Example:**
```bash
# Start Prisma Studio (opens at http://localhost:5555)
npx prisma studio

# Use custom port
npx prisma studio --port 3333

# Use in browser mode (doesn't auto-open browser)
npx prisma studio --browser none
```

**Features:**
- Browse all tables
- Filter and search records
- Create/edit/delete records
- View relationships
- Export data

**Access:**
```
http://localhost:5555
```

---

## 8. Validation & Formatting

### `npx prisma validate`

**What it does:** Validates your Prisma schema for errors.

**When to use:**
- ✅ Before committing schema changes
- ✅ In CI/CD pipeline
- ✅ Checking schema syntax

**Example:**
```bash
npx prisma validate
```

**Output (success):**
```
✔ Prisma schema loaded from prisma/schema.prisma
✔ Schema is valid!
```

**Output (error):**
```
Error validating datasource `db`: 
  The URL must start with the protocol `postgresql://` or `postgres://`.
```

---

### `npx prisma format`

**What it does:** Formats your `schema.prisma` file.

**When to use:**
- ✅ After manual schema edits
- ✅ Before committing
- ✅ Standardizing schema formatting

**Example:**
```bash
npx prisma format
```

**What it does:**
- Aligns field names
- Sorts attributes consistently
- Applies consistent spacing
- Formats comments

---

## 9. Debugging & Troubleshooting

### Enable Debug Logging

**Environment Variables:**
```bash
# Enable all debug logs
DEBUG=* npx prisma migrate dev

# Prisma-specific debug logs
DEBUG=prisma:* npx prisma generate

# Query debugging
DEBUG=prisma:query npx prisma studio

# Engine debugging
DEBUG=prisma:engine npx prisma generate
```

**In Application Code:**
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Or more detailed:
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

---

### Common Issues & Solutions

#### ❌ "Cannot find module '@prisma/client'"
```bash
# Solution:
npx prisma generate
npm install @prisma/client
```

#### ❌ "Migration failed" / "Database locked"
```bash
# Solution:
npx prisma migrate resolve --rolled-back "migration_name"
npx prisma migrate dev --name retry_migration
```

#### ❌ "Environment variable not found: DATABASE_URL"
```bash
# Solution:
# Make sure .env file exists with DATABASE_URL
# Or set it explicitly:
DATABASE_URL="postgresql://..." npx prisma generate
```

#### ❌ "Schema parsing error"
```bash
# Solution:
npx prisma validate  # Check for syntax errors
npx prisma format    # Auto-fix formatting
```

---

## 10. Advanced Commands

### `npx prisma migrate diff`

**What it does:** Shows SQL diff between two schema states.

**When to use:**
- ✅ Previewing migration SQL
- ✅ Comparing database states
- ✅ Generating SQL for review

**Example:**
```bash
# Diff from current schema to database
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script

# Diff from empty to current schema
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > create_tables.sql

# Diff between two databases
npx prisma migrate diff \
  --from-url "postgresql://user:pass@host:5432/db1" \
  --to-url "postgresql://user:pass@host:5432/db2" \
  --script
```

---

### Custom Database URL

**Override DATABASE_URL temporarily:**
```bash
# Use different database
DATABASE_URL="postgresql://other_db" npx prisma migrate dev

# Use direct connection for migration
DIRECT_URL="postgresql://direct" npx prisma migrate deploy
```

---

## 📋 Command Cheat Sheet

### Daily Development

```bash
# Make schema changes → Apply them
npx prisma migrate dev --name your_change_description

# View data
npx prisma studio
```

### After Pulling Code

```bash
# Install dependencies
npm install

# Apply any new migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### Fresh Start (Development Only)

```bash
# Nuclear option - reset everything
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Production Deployment

```bash
# 1. Generate client
npx prisma generate

# 2. Apply pending migrations
npx prisma migrate deploy

# 3. (Optional) Seed if needed
npx prisma db seed
```

### Debugging

```bash
# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# View database
npx prisma studio

# Enable debug logs
DEBUG=prisma:* npx prisma generate
```

---

## 🎯 Workflow Examples

### Scenario 1: Adding a New Field

```bash
# 1. Edit schema.prisma - add new field to model
# 2. Create and apply migration
npx prisma migrate dev --name add_user_phone_number

# 3. Prisma Client is automatically regenerated
# 4. Use new field in your code immediately
```

---

### Scenario 2: Starting a New Feature Branch

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Apply any new migrations
npx prisma migrate dev

# 4. Verify database state
npx prisma migrate status

# 5. Start working
npx prisma studio  # View data
```

---

### Scenario 3: Fixing a Broken Migration

```bash
# 1. Check status
npx prisma migrate status

# 2. Mark failed migration as rolled back
npx prisma migrate resolve --rolled-back "20251121221955_failed_migration"

# 3. Fix the schema
# Edit schema.prisma

# 4. Create new migration
npx prisma migrate dev --name fix_migration_issue

# 5. Verify
npx prisma migrate status
```

---

### Scenario 4: Production Deployment (CI/CD)

```bash
# In your deployment script or GitHub Actions:

# 1. Install dependencies
npm ci

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations (production)
npx prisma migrate deploy

# 4. (Optional) Seed if needed
# Only run this if you have production-safe seed data
# npx prisma db seed

# 5. Start application
npm start
```

---

### Scenario 5: Working with Supabase Pooler (Your Setup)

```bash
# Your .env configuration:
# DATABASE_URL="..." (pooler connection - port 6543)
# DIRECT_URL="..." (direct connection for migrations)

# Standard workflow works the same:
npx prisma migrate dev --name your_change

# Prisma automatically uses:
# - DATABASE_URL for app queries
# - DIRECT_URL for migrations
```

---

## 🔐 Environment Variables Reference

```bash
# Required
DATABASE_URL="postgresql://user:password@host:6543/db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:6543/db"

# Optional - for debugging
DEBUG="prisma:*"
DEBUG="prisma:query"  # SQL queries only

# Optional - custom schema location
PRISMA_SCHEMA_FILE="./custom/path/schema.prisma"
```

---

## 📚 Additional Resources

### Official Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

### Your Project
- Schema: `prisma/schema.prisma`
- Seed: `prisma/seed.ts`
- Migrations: `prisma/migrations/`
- Config: `prisma.config.ts`

### Package.json Scripts
```json
{
  "scripts": {
    "db:generate": "npx prisma generate",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio",
    "db:push": "npx prisma db push",
    "db:reset": "npx prisma migrate reset"
  }
}
```

Then use: `npm run db:migrate`, `npm run db:studio`, etc.

---

## ⚠️ Important Warnings

### 🔴 NEVER Do This in Production:
```bash
❌ npx prisma migrate reset
❌ npx prisma db push --accept-data-loss
❌ DROP TABLE manually
❌ Edit migration files after they're applied
```

### ✅ Always Do This:
```bash
✅ Test migrations in development first
✅ Review migration SQL before deploying
✅ Backup database before migrations
✅ Use `migrate deploy` in production
✅ Version control your migrations
```

---

## 💡 Pro Tips

1. **Always name migrations descriptively:**
   ```bash
   ✅ npx prisma migrate dev --name add_user_email_verification
   ❌ npx prisma migrate dev --name changes
   ```

2. **Use Prisma Studio for quick data inspection:**
   ```bash
   npx prisma studio
   ```

3. **Check migration status before deploying:**
   ```bash
   npx prisma migrate status
   ```

4. **Generate SQL for review:**
   ```bash
   npx prisma migrate dev --create-only --name big_change
   # Review prisma/migrations/[timestamp]_big_change/migration.sql
   # Then apply: npx prisma migrate dev
   ```

5. **Keep your Prisma Client updated:**
   ```bash
   npm install @prisma/client@latest prisma@latest
   npx prisma generate
   ```

---

## 🎓 Learning Path

### Beginner
1. `npx prisma generate` - Generate client
2. `npx prisma studio` - View data
3. `npx prisma migrate dev` - Make changes

### Intermediate
4. `npx prisma db seed` - Seed data
5. `npx prisma migrate status` - Check status
6. `npx prisma migrate deploy` - Production

### Advanced
7. `npx prisma migrate diff` - Compare schemas
8. `npx prisma migrate resolve` - Fix issues
9. `npx prisma db execute` - Custom SQL

---

**Need help?** Check the [Prisma Discord](https://pris.ly/discord) or [GitHub Discussions](https://github.com/prisma/prisma/discussions)

---

**Last Updated:** November 2024  
**Prisma Version:** 7.0.0  
**Project:** Skillfind Platform
