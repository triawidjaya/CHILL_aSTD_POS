import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('CHILL aSTD POS SaaS E2E Flow', () => {
  test('should complete a full shift cycle with seeding', async ({ page }) => {
    // Capture silent browser errors and console logs
    page.on('console', msg => console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text()));
    page.on('pageerror', err => console.log(`BROWSER ERROR:`, err.message));

    // 1. Navigate to login
    await page.goto('/login');
    await expect(page).toHaveTitle(/CHILL aSTD POS/);

    // Dump DOM for debugging
    const html = await page.content();
    fs.writeFileSync('e2e-debug-dom.html', html);

    // 2. Seed test user
    const seedButton = page.locator('text=(Dev) Seed Test User');
    await expect(seedButton).toBeVisible();
    
    // Set up the promise BEFORE clicking
    const dialogPromise = page.waitForEvent('dialog');
    
    await seedButton.click();

    // Await the dialog to ensure seeding is totally finished
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Test user seeded');
    await dialog.accept();

    // 3. Login
    await page.fill('input[name="email"]', 'manager@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // 4. Verify Dashboard
    await expect(page.locator('h2')).toContainText('Ongoing Shift Dashboard');

    // 5. Open Shift
    const openShiftCard = page.locator('.start-shift-card');
    if (await openShiftCard.isVisible()) {
      await page.fill('input[type="number"]', '500000');
      await page.click('button:has-text("Open New Shift")');
    }

    // 6. Add Transaction
    await page.click('button:has-text("+ New Transaction")');
    
    // Select Staff
    await page.selectOption('select[required]', { index: 1 }); // Select first staff
    
    // Amount
    await page.fill('input[placeholder="0"]', '150000');
    
    // Category (Income by default)
    await page.selectOption('select:near(label:has-text("Category"))', { index: 1 });
    
    // Save
    await page.click('button:has-text("Save Transaction")');

    // 7. Verify in list
    await expect(page.locator('.transaction-list-card')).toContainText('150.000');

    // 8. Close Shift
    await page.click('button:has-text("Close Shift")');
    
    // Handle confirmation dialog
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Close Shift")'); // Click again if modal or just confirmation

    // 9. Check History
    await page.click('a[href="/history"]');
    await expect(page.locator('.history-card')).toContainText('CLOSED');
  });
});
