
import { test, expect } from '@playwright/test';

// Professional ID from DB query
const PRO_ID = 'cmip3ysfz0001tgktjqjpzmw2';

test.describe('Visual Regression Testing', () => {
    // 1. Home Page
    test('Home Page - Scaling Check', async ({ page }) => {
        // English
        await page.goto('/en');
        await expect(page).toHaveScreenshot('home-en.png', { fullPage: true });

        // French
        await page.goto('/fr');
        await expect(page).toHaveScreenshot('home-fr.png', { fullPage: true });
    });

    // 2. Search Page
    test('Search Page - Scaling Check', async ({ page }) => {
        // English
        await page.goto('/en/search');
        await page.waitForTimeout(1000); // Allow results to load
        await expect(page).toHaveScreenshot('search-en.png', { fullPage: true });

        // French
        await page.goto('/fr/search');
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot('search-fr.png', { fullPage: true });
    });

    // 3. Public Profile
    test('Public Profile - Scaling Check', async ({ page }) => {
        // English
        await page.goto(`/en/professionals/${PRO_ID}`);
        await expect(page).toHaveScreenshot('profile-en.png', { fullPage: true });

        // French
        await page.goto(`/fr/professionals/${PRO_ID}`);
        await expect(page).toHaveScreenshot('profile-fr.png', { fullPage: true });
    });
});
