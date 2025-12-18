# Supabase + Prisma Connection Guide

## Common Issues & Solutions

### Issue 1: `prisma db push` Hangs or Times Out

**Symptom:** Command hangs at "Datasource db: PostgreSQL database..."

**Cause:** Using the **pooled connection** (port 6543) which doesn't support DDL operations.

**Solution:** Use **Session mode** connection (port 5432 via pooler):
```
postgresql://postgres.PROJECT-REF:PASSWORD@aws-1-eu-west-3.pooler.supabase.com:5432/postgres
```

### Issue 2: Invalid Port Number Error (P1013)

**Symptom:** `Error: P1013: invalid port number in database URL`

**Cause:** Special characters in password (like `#`, `@`, `%`) break URL parsing.

**Solution:** URL-encode special characters:
| Character | Encoded |
|-----------|---------|
| `#` | `%23` |
| `@` | `%40` |
| `%` | `%25` |
| `/` | `%2F` |

Example: `pass#word` → `pass%23word`

### Issue 3: Can't Reach Database (P1001)

**Symptom:** `Error: P1001: Can't reach database server at db.xxx.supabase.co:5432`

**Cause:** Direct connection (port 5432) blocked. Supabase free tier restricts direct access.

**Solution:** Use Session pooler format:
```
postgresql://postgres.PROJECT-REF:PASSWORD@aws-1-eu-west-3.pooler.supabase.com:5432/postgres
```

Note the difference:
- Host: `pooler.supabase.com` (not `db.supabase.com`)
- Username: `postgres.PROJECT-REF` (with dot, not @)
- Port: `5432` (Session mode)

---

## Connection String Formats

### For App Runtime (queries)
```env
DATABASE_URL="postgresql://postgres.PROJECT-REF:PASSWORD@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### For Migrations/DB Push
```powershell
$env:DATABASE_URL='postgresql://postgres.PROJECT-REF:PASSWORD@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'
npx prisma db push
```

---

## PowerShell Tips

Use **single quotes** to avoid variable interpolation:
```powershell
# Correct
$env:DATABASE_URL='postgresql://...'

# Wrong (PowerShell interprets special chars)
$env:DATABASE_URL="postgresql://..."
```
