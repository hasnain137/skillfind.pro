import { test, expect, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Setup Prisma
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PRO_EMAIL = 'test.pro@skillfind.pro';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

// Helper: Bypass Login using Clerk API
async function bypassLogin(page: Page, email: string) {
    if (!CLERK_SECRET_KEY) throw new Error("CLERK_SECRET_KEY missing");

    // 1. Get Clerk ID from DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.clerkId) throw new Error(`User ${email} not found or missing clerkId`);

    // 2. Generate Sign-in Token via Clerk API
    const response = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: user.clerkId,
            expires_in_seconds: 60
        })
    });

    // 4. Wait for dashboard or handle intermediate screens
    try {
        await page.waitForURL(/\/pro/, { timeout: 30000 });
    } catch (e) {
        console.log("Timed out waiting for /pro. Current URL:", page.url());

        // Handle "Sign in" button if instant redirect doesn't happen
        if (await page.getByText('Sign in', { exact: false }).isVisible()) {
            console.log("Found 'Sign in' text, attempting click...");
            const btn = page.getByRole('button', { name: 'Sign in' }).first();
            if (await btn.isVisible()) {
                await btn.click();
            }
        }

        await page.waitForURL(/\/pro/, { timeout: 15000 });
    }
}

test.describe('Professional Status Matrix', () => {

    test.beforeAll(async () => {
        // Ensure Pro is ACTIVE
        const proUser = await prisma.user.findUnique({ where: { email: PRO_EMAIL } });
        if (proUser) {
            await prisma.user.update({
                where: { id: proUser.id },
                data: { isBanned: false }
            });
            await prisma.professional.update({
                where: { userId: proUser.id },
                data: { status: 'ACTIVE' }
            });
        }
    });

    test.afterAll(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

    test('Scenario 1: Active Pro login (bypass) and check status', async ({ page }) => {
        await bypassLogin(page, PRO_EMAIL);

        // Go to Requests
        await page.goto('/pro/requests');

        // Expect NO Banned banner
        await expect(page.locator('text=Account Banned')).not.toBeVisible();
        await expect(page.locator('text=Account Suspended')).not.toBeVisible();
    });

    test('Scenario 2: Banned Pro sees restrictions', async ({ page }) => {
        // 1. Configure DB state: Banned
        const proUser = await prisma.user.findUnique({ where: { email: PRO_EMAIL } });
        await prisma.professional.update({
            where: { userId: proUser!.id },
            data: { status: 'BANNED' }
        });

        // 2. Login (reuse bypass)
        await bypassLogin(page, PRO_EMAIL);

        // 3. Verify Banned Banner on Dashboard
        await expect(page.locator('text=Account Banned')).toBeVisible();

        // 4. Verify Banned Banner on Requests
        await page.goto('/pro/requests');
        await expect(page.locator('text=Account Banned')).toBeVisible();

        // 5. Verify Send Offer disabled
        await expect(page.getByRole('button', { name: 'Send Offer' })).toBeDisabled();
    });
});
