/**
 * firebase-sync.spec.js
 * 
 * Tests:
 * 1. Real-time sync – changes in one "browser tab" reflected immediately.
 * 2. Outlet isolation – Outlet A cannot see Outlet B's data.
 */

import { test, expect } from '@playwright/test';
import { injectFirebaseMock } from './firebase-mock.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Wait until app is ready (shift modal OR main dashboard visible). */
async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        return document.querySelector('#startShiftModal') !== null ||
               document.querySelector('.stat-card') !== null;
    }, { timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1: Real-Time Sync
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Real-Time Sync — Two Browser Contexts', () => {

    /**
     * Simulates two tabs of the same outlet.
     * Tab 1: adds a transaction via the mock's addDoc.
     * We then verify the onSnapshot fires and Tab 1's UI updates.
     * (True two-tab sync requires a shared Firebase backend; here we verify
     * the onSnapshot wiring works correctly when data changes programmatically.)
     */
    test('Adding a transaction triggers onSnapshot and updates the UI', async ({ browser }) => {
        // Open the first context (Tab 1)
        const ctx1 = await browser.newContext();
        const tab1 = await ctx1.newPage();

        // Seed: shift already active (one start-balance transaction)
        await injectFirebaseMock(tab1, {
            outletId: 'outlet-sync-test',
            initialData: {
                transactions: [
                    {
                        id: 'trx_start',
                        datetime: new Date().toLocaleString(),
                        type: 'income',
                        category: 'START BALANCE',
                        description: 'Initial drawer float',
                        amount: 500000,
                        method: 'Cash',
                        extra: 'Manual Entry',
                        staff: 'Owner'
                    }
                ]
            }
        });

        await tab1.goto('/index.html');
        await waitForAppReady(tab1);

        // Verify initial balance Rp 500.000
        const cashBalanceEl = tab1.locator('.stat-card:has([data-i18n="stat_cash_balance"]) .stat-amount');
        await expect(cashBalanceEl).toContainText('500.000', { timeout: 8000 });

        // ── Simulate real-time push: inject a new transaction via the mock ──
        await tab1.evaluate(() => {
            const { db, collection, addDoc } = window.fb;
            const outletId = localStorage.getItem('pos_outlet_id');
            addDoc(collection(db, 'outlets', outletId, 'transactions'), {
                id: Date.now(),
                datetime: new Date().toLocaleString(),
                type: 'income',
                category: 'F&B Sales',
                description: 'Kopi Susu',
                amount: 35000,
                method: 'Cash',
                extra: '-',
                staff: 'Owner'
            });
        });

        // onSnapshot should fire and UI should update to 535.000
        await expect(cashBalanceEl).toContainText('535.000', { timeout: 8000 });

        // New row should appear in the transactions table
        const tbody = tab1.locator('table tbody');
        await expect(tbody).toContainText('Kopi Susu', { timeout: 5000 });

        await ctx1.close();
    });

    test('Closing a shift removes transactions and shows Start Shift modal', async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();

        await injectFirebaseMock(page, {
            outletId: 'outlet-close-test',
            initialData: {
                transactions: [
                    {
                        id: 'trx_1',
                        datetime: new Date().toLocaleString(),
                        type: 'income',
                        category: 'START BALANCE',
                        description: 'Initial drawer float',
                        amount: 100000,
                        method: 'Cash',
                        extra: 'Manual Entry',
                        staff: 'Owner'
                    }
                ]
            }
        });

        await page.goto('/index.html');
        await waitForAppReady(page);

        // Shift should be active – Start modal should be hidden
        await expect(page.locator('#startShiftModal')).not.toHaveClass(/active/);

        // Open close-shift modal and confirm
        await page.locator('button[onclick="openCloseShiftModal()"]').click();
        await expect(page.locator('#closeShiftModal')).toHaveClass(/active/, { timeout: 5000 });
        await page.locator('button[onclick="confirmCloseShift()"]').click();

        // After closing, transactions collection should be empty → shift inactive
        await expect(page.locator('#startShiftModal')).toHaveClass(/active/, { timeout: 8000 });

        await ctx.close();
    });

    test('Settings change via Firestore onSnapshot updates sidebar name in real-time', async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();

        await injectFirebaseMock(page, {
            outletId: 'outlet-settings-test',
            initialData: {
                settings: { name: 'Old Name', logo: '' }
            }
        });

        await page.goto('/index.html');
        await waitForAppReady(page);

        // Sidebar should show old name initially
        const sidebarName = page.locator('.sidebar-header span');
        await expect(sidebarName).toHaveText('Old Name', { timeout: 8000 });

        // Simulate a Firestore onSnapshot push (another user changes name)
        await page.evaluate(() => {
            const { db, doc, setDoc } = window.fb;
            const outletId = localStorage.getItem('pos_outlet_id');
            setDoc(doc(db, 'outlets', outletId), {
                settings: { name: 'New Outlet Name', logo: '' },
                categories: ['Accommodation', 'F&B Sales', 'Supplies', 'Maintenance'],
                roles: ['Receptionist', 'Manager', 'Staff', 'Security'],
                createdAt: new Date().toISOString()
            });
        });

        // onSnapshot listener should update sidebar
        await expect(sidebarName).toHaveText('New Outlet Name', { timeout: 8000 });

        await ctx.close();
    });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2: Outlet Isolation
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Outlet Isolation — Outlet A vs Outlet B', () => {

    /**
     * Each browser context gets its own outletId and its own in-memory store.
     * We verify that:
     *   - Outlet A's transactions do NOT appear in Outlet B's view.
     *   - Outlet A's staff do NOT appear in Outlet B's staff page.
     *   - Outlet A's business name does NOT appear in Outlet B's sidebar.
     */
    test('Outlet A transactions are NOT visible to Outlet B', async ({ browser }) => {
        // ── Outlet A ──
        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await injectFirebaseMock(pageA, {
            outletId: 'outlet-A',
            initialData: {
                transactions: [
                    {
                        id: 'trxA_1',
                        datetime: new Date().toLocaleString(),
                        type: 'income',
                        category: 'START BALANCE',
                        description: 'Outlet A Float',
                        amount: 999000,
                        method: 'Cash',
                        extra: '-',
                        staff: 'OwnerA'
                    }
                ]
            }
        });
        await pageA.goto('/index.html');
        await waitForAppReady(pageA);

        // Outlet A should see "Outlet A Float"
        await expect(pageA.locator('table tbody')).toContainText('Outlet A Float', { timeout: 8000 });

        // ── Outlet B ──
        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await injectFirebaseMock(pageB, {
            outletId: 'outlet-B',
            initialData: {
                transactions: [
                    {
                        id: 'trxB_1',
                        datetime: new Date().toLocaleString(),
                        type: 'income',
                        category: 'START BALANCE',
                        description: 'Outlet B Float',
                        amount: 200000,
                        method: 'Cash',
                        extra: '-',
                        staff: 'OwnerB'
                    }
                ]
            }
        });
        await pageB.goto('/index.html');
        await waitForAppReady(pageB);

        // Outlet B should see "Outlet B Float" but NOT "Outlet A Float"
        await expect(pageB.locator('table tbody')).toContainText('Outlet B Float', { timeout: 8000 });
        await expect(pageB.locator('table tbody')).not.toContainText('Outlet A Float');

        // Outlet A should also NOT see "Outlet B Float"
        await expect(pageA.locator('table tbody')).not.toContainText('Outlet B Float');

        await ctxA.close();
        await ctxB.close();
    });

    test('Outlet A staff are NOT visible in Outlet B staff page', async ({ browser }) => {
        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await injectFirebaseMock(pageA, {
            outletId: 'outlet-staff-A',
            initialData: {
                staff: [
                    { id: 'sA1', name: 'Siti Kasir', role: 'Staff', status: 'Active', pin: '1111' },
                    { id: 'sA2', name: 'Budi Manager', role: 'Manager', status: 'Active', pin: '0000' }
                ]
            }
        });
        // Set admin role so staff page is accessible
        await pageA.addInitScript(() => localStorage.setItem('pos_user_role', 'admin'));
        await pageA.goto('/staff.html');
        await pageA.waitForLoadState('networkidle');
        await expect(pageA.locator('#staffCardContainer')).toContainText('Siti Kasir', { timeout: 8000 });

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await injectFirebaseMock(pageB, {
            outletId: 'outlet-staff-B',
            initialData: {
                staff: [
                    { id: 'sB1', name: 'Rina Receptionist', role: 'Receptionist', status: 'Active', pin: '2222' },
                    { id: 'sB2', name: 'Dono Admin', role: 'Manager', status: 'Active', pin: '3333' }
                ]
            }
        });
        await pageB.addInitScript(() => localStorage.setItem('pos_user_role', 'admin'));
        await pageB.goto('/staff.html');
        await pageB.waitForLoadState('networkidle');

        // Outlet B should have Outlet B's staff only
        await expect(pageB.locator('#staffCardContainer')).toContainText('Rina Receptionist', { timeout: 8000 });
        await expect(pageB.locator('#staffCardContainer')).not.toContainText('Siti Kasir');

        // Outlet A should also not see Outlet B's staff
        await expect(pageA.locator('#staffCardContainer')).not.toContainText('Rina Receptionist');

        await ctxA.close();
        await ctxB.close();
    });

    test('Outlet A business name does NOT appear in Outlet B sidebar', async ({ browser }) => {
        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await injectFirebaseMock(pageA, {
            outletId: 'outlet-name-A',
            initialData: { settings: { name: 'Toko Maju Jaya', logo: '' } }
        });
        await pageA.goto('/index.html');
        await waitForAppReady(pageA);
        await expect(pageA.locator('.sidebar-header span')).toHaveText('Toko Maju Jaya', { timeout: 8000 });

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await injectFirebaseMock(pageB, {
            outletId: 'outlet-name-B',
            initialData: { settings: { name: 'Warung Sederhana', logo: '' } }
        });
        await pageB.goto('/index.html');
        await waitForAppReady(pageB);

        // Each outlet shows its own name
        await expect(pageB.locator('.sidebar-header span')).toHaveText('Warung Sederhana', { timeout: 8000 });
        await expect(pageB.locator('.sidebar-header span')).not.toHaveText('Toko Maju Jaya');
        await expect(pageA.locator('.sidebar-header span')).not.toHaveText('Warung Sederhana');

        await ctxA.close();
        await ctxB.close();
    });

});
