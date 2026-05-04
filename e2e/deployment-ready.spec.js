/**
 * deployment-ready.spec.js (Updated for Firebase Architecture)
 *
 * Smoke tests verifying that the core operational flow works correctly
 * with the Firebase mock backend.
 */

import { test, expect } from '@playwright/test';
import { injectFirebaseMock } from './firebase-mock.js';

const INDEX_URL = '/index.html';

test.describe('Firebase Deployment Readiness (Smoke Test)', () => {

    // Generate a unique outlet ID per test-run to prevent state bleed
    // from real Firestore data or previous test sessions.
    let uniqueOutletId;

    test.beforeEach(async ({ page }) => {
        uniqueOutletId = `smoke-outlet-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

        await injectFirebaseMock(page, {
            outletId: uniqueOutletId,
            initialData: {
                // Seed a Manager so PIN/role logic doesn't block
                staff: [
                    { id: 'owner_1', name: 'Owner', role: 'Manager', status: 'Active', pin: '0000' }
                ]
                // No transactions seeded → shift must be INACTIVE on load
            }
        });

        await page.goto(INDEX_URL);
        // Wait for the app to finish its async boot sequence
        await page.waitForFunction(() => window.appReady === true, { timeout: 10000 });
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('Complete Operational Flow: Start Shift → Add Transaction → Check Balances', async ({ page }) => {
        // 1. No transactions seeded → start shift modal must be visible
        //    Use toBeVisible() — more robust than toHaveClass(/active/)
        await expect(page.locator('#startShiftModal')).toBeVisible({ timeout: 8000 });

        // 2. Enter initial balance (Rp 500.000) and start shift
        await page.locator('#initialCashInput').fill('500000');
        await page.locator('#startShiftModal .btn-purple').click();

        // Modal should close after addDoc fires and onSnapshot updates isShiftActive
        await expect(page.locator('#startShiftModal')).not.toBeVisible({ timeout: 8000 });

        // 3. Add a new income transaction
        await page.locator('[data-i18n="btn_new_transaction"]').click();
        await expect(page.locator('#newTransactionModal')).toBeVisible();

        await page.locator('#transactionAmountInput').fill('150000');
        await page.locator('#newTransactionModal input[type="text"]').nth(1).fill('Penjualan Kopi');
        await page.locator('#newTransactionModal .btn-purple').click();

        // 4. Balance: 500k + 150k = 650k
        await expect(
            page.locator('.stat-card:has([data-i18n="stat_cash_balance"]) .stat-amount')
        ).toContainText('650.000', { timeout: 8000 });

        // 5. Transaction row should appear in table
        const firstRow = page.locator('table tbody tr').first();
        await expect(firstRow).toContainText('Penjualan Kopi');
        await expect(firstRow).toContainText('150.000');
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('Security & Role Switching Flow', async ({ page }) => {
        // Start shift first — modal must be visible (no transactions seeded)
        await expect(page.locator('#startShiftModal')).toBeVisible({ timeout: 8000 });
        await page.locator('#initialCashInput').fill('100000');
        await page.locator('#startShiftModal .btn-purple').click();
        await expect(page.locator('#startShiftModal')).not.toBeVisible({ timeout: 8000 });

        // 1. Default role = staff → new transaction visible, staff link hidden
        await expect(page.locator('[data-i18n="btn_new_transaction"]')).toBeVisible();
        await expect(page.locator('.sidebar a[href="staff.html"]')).not.toBeVisible();

        // 2. Switch to Admin (auto-select Owner since only 1 Manager)
        await page.locator('button[onclick="toggleDropdown(event)"]').click();
        await page.locator('#roleText').click();

        // Single Manager → goes directly to PIN numpad
        await expect(page.locator('#pinNumpadView')).toBeVisible({ timeout: 5000 });

        for (const digit of '0000') {
            await page.locator(`.numpad-btn:has-text("${digit}")`).first().click();
        }

        // PIN modal should close
        await expect(page.locator('#pinModal')).not.toBeVisible({ timeout: 5000 });

        // 3. Admin mode: new transaction hidden, staff link visible
        await expect(page.locator('[data-i18n="btn_new_transaction"]')).not.toBeVisible();
        await expect(page.locator('.sidebar a[href="staff.html"]')).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    test('Navigation Integrity - All pages load without errors', async ({ page }) => {
        const pages = ['index.html', 'history.html', 'staff.html', 'config.html'];

        for (const p of pages) {
            const navOutletId = `nav-outlet-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
            await injectFirebaseMock(page, { outletId: navOutletId });
            await page.goto(`/${p}`);
            await page.waitForLoadState('networkidle');

            await expect(page.locator('body')).toBeVisible();
            await expect(page.locator('.sidebar .sidebar-logo-icon')).toBeVisible({ timeout: 8000 });
            await expect(page.locator('.sidebar-header')).toBeVisible();
        }
    });

});
