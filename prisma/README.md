# Prisma Database Schema

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Supabase Storage (for document uploads)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Create Supabase Database

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy the connection string from Settings → Database
4. Update `DATABASE_URL` in `.env`

### 4. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed initial data
npx prisma db seed
```

### 5. Set up Supabase Storage

Create private bucket for verification documents:

```typescript
// Run this once in Supabase SQL Editor or via code
await supabase.storage.createBucket('verification-documents', {
  public: false,
  fileSizeLimit: 10485760, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
});
```

## Database Models

### Core Models (17 total)

1. **User** - Core user accounts (Clerk integration)
2. **Client** - Client profiles
3. **Professional** - Professional profiles with status gating
4. **ProfessionalProfile** - Detailed professional information
5. **ProfessionalService** - Services offered by professionals
6. **Category** - Main service categories
7. **Subcategory** - Specific services within categories
8. **Request** - Client service requests
9. **Offer** - Professional offers to clients
10. **ClickEvent** - Pay-per-click tracking (€0.10 per click)
11. **Job** - Active work between client and professional
12. **Review** - Client reviews with tags
13. **Wallet** - Professional wallet balances
14. **Transaction** - Wallet transaction history
15. **VerificationDocument** - Document verification workflow
16. **PlatformSettings** - Global platform configuration
17. **AdminAction** - Admin activity audit log

## Key Features

### ✅ Pay-Per-Click System
- Atomic transactions prevent double charging
- Daily click limits protect professionals
- IP-based fraud prevention
- Full audit trail

### ✅ Onboarding Status Gating
- INCOMPLETE → PENDING_REVIEW → ACTIVE
- 9 mandatory verification steps
- Only ACTIVE professionals appear in listings

### ✅ GDPR-Compliant Storage
- Private Supabase buckets
- Signed URLs (1 hour expiry)
- Encrypted at rest
- Admin-only access

### ✅ Atomic Counter Updates
- offerCount updated in transactions
- averageRating calculated atomically
- Prevents race conditions

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Push schema changes without migration (dev only)
npx prisma db push

# Generate Prisma Client after schema changes
npx prisma generate

# Seed database
npx prisma db seed

# Format schema file
npx prisma format
```

## Development Workflow

1. Make changes to `schema.prisma`
2. Run `npx prisma format` to format the file
3. Run `npx prisma migrate dev --name describe_change` to create migration
4. Prisma automatically runs seed after migration
5. Run `npx prisma generate` to update Prisma Client types

## Important Notes

### ⚠️ Critical Implementation Requirements

1. **Atomic Pay-Per-Click** - MUST use `prisma.$transaction()` for all billing operations
2. **Rate Limiting** - Check IP limits before charging (5/min, 10/hour)
3. **Daily Click Limit** - Check professional's `dailyClickLimit` before charging
4. **Counter Updates** - Update `offerCount`, `averageRating`, etc. atomically
5. **Private Storage** - Use private Supabase buckets with signed URLs for documents

### 🔒 Security Checklist

- [ ] Database connection uses SSL
- [ ] Environment variables are secure
- [ ] Supabase buckets are private
- [ ] Row-level security configured
- [ ] Admin actions are logged
- [ ] Rate limiting implemented
- [ ] Input validation on all fields

## Seeded Data

After running seed, you'll have:

- ✅ Default platform settings (€0.10 click fee, €2 minimum balance, 10 max offers)
- ✅ 5 Categories: Home Repair, Software & Tech, Tutoring, Creative, Wellness
- ✅ 15 Subcategories across all categories

## Support

For issues or questions:
- Check Prisma docs: https://www.prisma.io/docs
- Supabase docs: https://supabase.com/docs
- Project documentation: `/skillfind/docs/`
