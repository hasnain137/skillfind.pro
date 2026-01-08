# Restoration Plan: Target `3a5f81d`

**Goal**: Restore feature parity with build `3a5f81d` in controlled phases.

## Analysis
- **Target Build**: `3a5f81d`
- **Current State**: Restored `b303dc1` features (Admin tools) + i18n fixes.
- **Gap Analysis**: [Pending `git diff` results]

## Phased Approach

### Phase 1: Foundation & Schema (High Priority)
*Goal: Ensure database and core types support all incoming features.*
- [ ] **Schema**: Review and apply changes to `prisma/schema.prisma` (carefully, avoiding destructive resets).
- [ ] **Types**: Update `src/types/global.d.ts` and generated Prisma client.
- [ ] **Scripts**: Restore `scripts/seed-categories.js` and migration tools.

### Phase 2: Admin Category Management (Low Risk)
*Goal: Restore the enhanced category management UI.*
- [ ] Restore `src/app/[locale]/admin/categories/*`.
- [ ] Restore API routes: `src/app/api/admin/categories` and `subcategories`.

### Phase 3: Public Search & Filters (Medium Risk)
*Goal: Restore the advanced search page and filtering logic.*
- [ ] Restore `src/app/[locale]/search/` (Filters, Results, Mobile Drawer).
- [ ] Restore `src/components/landing/SearchCard.tsx` and `MobileFilterDrawer.tsx`.

### Phase 4: Client Dashboard Enhancements (Medium Risk)
*Goal: Bring back the enhanced request view and job management.*
- [ ] Restore `src/app/[locale]/client/requests/[id]/page_enhanced.tsx`.
- [ ] Restore `src/app/[locale]/client/jobs/` pages.
- [ ] **Adaptation**: Ensure `Navbar` usage uses our new `NavbarContent` fix.

### Phase 5: Professional Dashboard & Wallet (High Risk)
*Goal: Restore wallet features and profile management.*
- [ ] Restore `src/app/[locale]/pro/wallet/` and `src/app/api/wallet/route.ts`.
- [ ] Restore `src/components/dashboard/EarningsChart.tsx`.
- [ ] **Adaptation**: Verify `admin-wallet.ts` logic remains secure.

## Verification
- Build check after every phase.
- Manual verification of restored features.
