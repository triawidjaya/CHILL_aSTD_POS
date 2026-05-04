/**
 * pos.spec.js (Updated for Firebase Architecture)
 * 
 * Core POS operational tests using the Firebase mock backend.
 */

import { test, expect } from '@playwright/test';
import { injectFirebaseMock } from './firebase-mock.js';

test.describe('POS Application End-to-End Tests', () => {

    test.beforeEach(async ({ page }) => {
        await injectFirebaseMock(page, {
            outletId: 'pos-e2e-outlet',
            initialData: {
                staff: [
                    { id: 'owner_1', name: 'Owner', role: 'Manager', status: 'Active', pin: '0000' },
                    { id: 'staff_1', name: 'Receptionist', role: 'Receptionist', status: 'Active', pin: '1234' }
                ]
            }
        });
        await page.goto('/index.html');
    });

    test('Lengkap: Buka Shift, Transaksi, dan Tutup Shift', async ({ page }) => {
        // 1. Start Shift modal should be visible (no transactions → shift inactive)
        const startShiftModal = page.locator('#startShiftModal');
        await expect(startShiftModal).toBeVisible({ timeout: 8000 });

        // 2. Start shift
        await page.fill('#initialCashInput', '500000');
        await page.locator('#startShiftModal .btn-purple').click();
        await expect(startShiftModal).not.toBeVisible({ timeout: 8000 });

        // Balance should show 500.000
        await expect(
            page.locator('.stat-card:has([data-i18n="stat_cash_balance"]) .stat-amount')
        ).toContainText('500.000', { timeout: 8000 });

        // 3. Add income transaction
        await page.locator('[data-i18n="btn_new_transaction"]').click();
        const newTrxModal = page.locator('#newTransactionModal');
        await expect(newTrxModal).toBeVisible();

        await page.locator('#transactionAmountInput').fill('100000');
        await page.locator('#newTransactionModal input[type="text"]').nth(1).fill('Test Income');
        await page.locator('#newTransactionModal .btn-purple').click();

        // Balance: 500k + 100k = 600k
        await expect(newTrxModal).not.toBeVisible();
        await expect(
            page.locator('.stat-card:has([data-i18n="stat_cash_balance"]) .stat-amount')
        ).toContainText('600.000', { timeout: 8000 });

        await expect(page.locator('table tbody')).toContainText('Test Income');

        // 4. Close shift
        await page.locator('button[onclick="openCloseShiftModal()"]').click();
        const closeModal = page.locator('#closeShiftModal');
        await expect(closeModal).toBeVisible({ timeout: 5000 });

        await page.locator('button[onclick="confirmCloseShift()"]').click();

        // Should return to Start Shift modal
        await expect(startShiftModal).toBeVisible({ timeout: 8000 });
    });

    test('Navigasi dan Manajemen Konfigurasi/Staff', async ({ page }) => {
        // Skip initial shift modal
        await expect(page.locator('#startShiftModal')).toBeVisible({ timeout: 8000 });
        await page.fill('#initialCashInput', '0');
        await page.locator('#startShiftModal .btn-purple').click();
        await expect(page.locator('#startShiftModal')).not.toBeVisible({ timeout: 8000 });

        // Go to config page as admin
        await page.evaluate(() => localStorage.setItem('pos_user_role', 'admin'));
        await injectFirebaseMock(page, { outletId: 'pos-e2e-outlet' });
        await page.goto('/config.html');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h1')).toContainText('System Configuration', { timeout: 8000 });

        // Update business name via Firestore (saveBusinessSettings now uses updateDoc)
        await page.fill('#businessNameInput', 'Toko Otomatis E2E');
        await page.locator('button[onclick="saveBusinessSettings()"]').click();

        // Sidebar should update (applySettings triggered by onSnapshot)
        await expect(page.locator('.sidebar-header span')).toHaveText('Toko Otomatis E2E', { timeout: 8000 });
    });

    test('Manajemen Staff via Firebase', async ({ page }) => {
        // Start shift so menu is accessible
        await expect(page.locator('#startShiftModal')).toBeVisible({ timeout: 8000 });
        await page.fill('#initialCashInput', '0');
        await page.locator('#startShiftModal .btn-purple').click();
        await expect(page.locator('#startShiftModal')).not.toBeVisible({ timeout: 8000 });

        await page.evaluate(() => localStorage.setItem('pos_user_role', 'admin'));
        await injectFirebaseMock(page, {
            outletId: 'pos-e2e-outlet',
            initialData: {
                staff: [
                    { id: 'owner_1', name: 'Owner', role: 'Manager', status: 'Active', pin: '0000' }
                ]
            }
        });
        await page.goto('/staff.html');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1')).toContainText('Staff Management', { timeout: 8000 });

        // Add new staff
        await page.locator('button[onclick="openStaffModal()"]').click();
        const staffModal = page.locator('#staffModal');
        await expect(staffModal).toBeVisible();

        await page.fill('#staffNameInput', 'Budi Kasir');
        await page.selectOption('#staffRoleSelect', 'Staff');
        await page.fill('#staffPinInput', '9876');
        await page.locator('button[onclick="saveStaffEntry()"]').click({ force: true });

        // Modal should close and new staff card should appear
        await expect(staffModal).not.toBeVisible({ timeout: 8000 });
        await expect(page.locator('#staffCardContainer')).toContainText('Budi Kasir', { timeout: 8000 });
    });

    test('Manajemen History dari Firestore', async ({ page }) => {
        // Seed history data directly in the mock
        await injectFirebaseMock(page, {
            outletId: 'pos-history-outlet',
            initialData: {
                staff: [
                    { id: 'owner_1', name: 'Owner', role: 'Manager', status: 'Active', pin: '0000' }
                ],
                history: {
                    'shift_001': {
                        id: 'shift_001',
                        date: '1/5/2026',
                        closedAt: '1/5/2026, 18:00:00',
                        transactions: [
                            { id: 'ht1', datetime: '1/5/2026, 08:00:00', type: 'income', category: 'START BALANCE', description: 'Float', amount: 100000, method: 'Cash', extra: '-', staff: 'Owner' },
                            { id: 'ht2', datetime: '1/5/2026, 12:00:00', type: 'income', category: 'F&B Sales', description: 'Kopi', amount: 25000, method: 'Cash', extra: '-', staff: 'Owner' }
                        ]
                    }
                }
            }
        });

        await page.evaluate(() => localStorage.setItem('pos_user_role', 'admin'));
        await page.goto('/history.html');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h1')).toContainText('Shift History', { timeout: 8000 });

        // History table should show the seeded shift
        const historyRow = page.locator('table').first().locator('tbody tr');
        await expect(historyRow).toHaveCount(1, { timeout: 8000 });

        // Click view shift details
        const viewBtn = page.locator('button[onclick^="viewShiftDetails"]').first();
        await expect(viewBtn).toBeVisible();
        await viewBtn.click();

        await expect(page.locator('#shiftDetailsModal')).toBeVisible({ timeout: 5000 });
    });

});
