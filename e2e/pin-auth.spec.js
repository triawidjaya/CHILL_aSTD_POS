/**
 * pin-auth.spec.js (Updated for Firebase Architecture)
 * 
 * Tests PIN authentication and staff switching.
 * Staff data is seeded via Firebase mock instead of localStorage.
 */

import { test, expect } from '@playwright/test';
import { injectFirebaseMock } from './firebase-mock.js';

const INDEX_URL = '/index.html';

const STAFF_ROSTER = [
    { id: 's1', name: 'Owner', role: 'Manager', status: 'Active', pin: '0000' },
    { id: 's2', name: 'Receptionist', role: 'Receptionist', status: 'Active', pin: '1234' },
    { id: 's3', name: 'Staff A', role: 'Staff', status: 'Active', pin: '1111' },
    { id: 's4', name: 'Staff B', role: 'Staff', status: 'Active', pin: '2222' }
];

/** Setup: inject Firebase mock with a pre-active shift and the test roster. */
async function setupTestState(page, role = 'staff') {
    await injectFirebaseMock(page, {
        outletId: 'pin-test-outlet',
        initialData: {
            staff: STAFF_ROSTER,
            // Seed one transaction so the shift is "active" (onSnapshot sets isShiftActive = true)
            transactions: [
                {
                    id: 'trx_start',
                    datetime: new Date().toLocaleString(),
                    type: 'income',
                    category: 'START BALANCE',
                    description: 'Initial drawer float',
                    amount: 300000,
                    method: 'Cash',
                    extra: 'Manual Entry',
                    staff: 'Receptionist'
                }
            ]
        }
    });
    // Set role before page loads (runs AFTER firebase-mock's addInitScript clears localStorage)
    await page.addInitScript((r) => {
        localStorage.setItem('pos_user_role', r);
        localStorage.setItem('pos_duty_staff', 'Receptionist');
    }, role);
    await page.goto(INDEX_URL);
    // Wait for the app to finish its async boot sequence
    await page.waitForFunction(() => window.appReady === true, { timeout: 10000 });
    // Wait for the UI to settle (duty-staff-pill only shows when shift active & role=staff)
    await page.waitForSelector('.duty-staff-pill', { state: 'visible', timeout: 10000 });
}

async function enterPin(page, pin) {
    for (const digit of pin) {
        await page.locator(`.numpad-btn:has-text("${digit}")`).first().click();
    }
}

async function clickSwitchToAdmin(page) {
    await page.locator('button[onclick="toggleDropdown(event)"]').click();
    // Wait for dropdown to actually open (toggle adds 'show' class)
    await expect(page.locator('#headerDropdown')).toHaveClass(/show/, { timeout: 5000 });
    await page.locator('#roleText').click();
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('PIN Authentication & Staff Switching', () => {

    test('Clicking Duty Staff pill should open PIN grid when multiple staff exist', async ({ page }) => {
        await setupTestState(page, 'staff');

        await page.locator('.duty-staff-pill').click();

        // PIN modal uses opacity+visibility — toBeVisible() is the correct check
        await expect(page.locator('#pinModal')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#pinStaffView')).toBeVisible();

        // 4 active staff in roster → 4 cards
        const cards = page.locator('#pinStaffGrid .pin-staff-card');
        await expect(cards).toHaveCount(4, { timeout: 8000 });
    });

    test('Should auto-select single Manager and go directly to PIN input for Admin mode', async ({ page }) => {
        await setupTestState(page, 'staff');

        await clickSwitchToAdmin(page);

        // Only 1 Manager (Owner) → should jump directly to numpad
        await expect(page.locator('#pinNumpadView')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#pinModalTitle')).toContainText('Owner');

        await enterPin(page, '0000');

        // PIN modal closes after correct PIN
        await expect(page.locator('#pinModal')).not.toBeVisible({ timeout: 5000 });
        // Admin mode: new transaction hidden, staff link visible
        await expect(page.locator('[data-i18n="btn_new_transaction"]')).not.toBeVisible();
        await expect(page.locator('.sidebar a[href="staff.html"]')).toBeVisible();
    });

    test('Admin mode selection should only show Manager/Admin roles', async ({ page }) => {
        // Two managers → grid should appear, with only 2 cards
        await injectFirebaseMock(page, {
            outletId: 'pin-multi-manager',
            initialData: {
                staff: [
                    { id: 'm1', name: 'Owner', role: 'Manager', status: 'Active', pin: '0000' },
                    { id: 'm2', name: 'Admin 2', role: 'Admin', status: 'Active', pin: '9999' },
                    { id: 'm3', name: 'Staff A', role: 'Staff', status: 'Active', pin: '1111' }
                ],
                transactions: [{ id: 'trx_s', datetime: new Date().toLocaleString(), type: 'income', category: 'START BALANCE', description: 'Float', amount: 100000, method: 'Cash', extra: '-', staff: 'Owner' }]
            }
        });
        await page.goto(INDEX_URL);
        await page.waitForFunction(() => window.appReady === true, { timeout: 10000 });
        await page.waitForSelector('.duty-staff-pill', { state: 'visible', timeout: 10000 });

        await clickSwitchToAdmin(page);

        await expect(page.locator('#pinStaffView')).toBeVisible({ timeout: 5000 });
        const cards = page.locator('#pinStaffGrid .pin-staff-card');
        await expect(cards).toHaveCount(2, { timeout: 8000 });
        await expect(page.locator('#pinStaffGrid')).not.toContainText('Staff A');
    });

    test('Should switch duty staff via grid when multiple options available', async ({ page }) => {
        await setupTestState(page, 'staff');

        await page.locator('.duty-staff-pill').click();
        await expect(page.locator('#pinModal')).toBeVisible({ timeout: 5000 });
        await page.locator('#pinStaffGrid .pin-staff-card').filter({ hasText: 'Staff A' }).click();
        await enterPin(page, '1111');

        await expect(page.locator('#pinModal')).not.toBeVisible({ timeout: 5000 });
        await expect(page.locator('#currentDutyStaffName')).toHaveText('Staff A');
    });

    test('Back button should return to staff selection screen', async ({ page }) => {
        await setupTestState(page, 'staff');

        await page.locator('.duty-staff-pill').click();
        await expect(page.locator('#pinModal')).toBeVisible({ timeout: 5000 });
        await page.locator('#pinStaffGrid .pin-staff-card').first().click();
        await expect(page.locator('#pinNumpadView')).toBeVisible();

        await page.locator('.btn-back-pin').click();
        await expect(page.locator('#pinStaffView')).toBeVisible();
    });

    test('Should auto-select if only one active staff member exists', async ({ page }) => {
        await injectFirebaseMock(page, {
            outletId: 'pin-single-staff',
            initialData: {
                staff: [
                    { id: 'u1', name: 'OnlyMe', role: 'Manager', status: 'Active', pin: '7777' },
                    { id: 'u2', name: 'Ghost', role: 'Staff', status: 'Inactive', pin: '0000' }
                ],
                transactions: [{ id: 'trx_s', datetime: new Date().toLocaleString(), type: 'income', category: 'START BALANCE', description: 'Float', amount: 100000, method: 'Cash', extra: '-', staff: 'OnlyMe' }]
            }
        });
        await page.goto(INDEX_URL);
        await page.waitForFunction(() => window.appReady === true, { timeout: 10000 });
        await page.waitForSelector('.duty-staff-pill', { state: 'visible', timeout: 10000 });

        await page.locator('.duty-staff-pill').click();

        // Only 1 active → auto-selected → numpad shown directly
        await expect(page.locator('#pinNumpadView')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#pinModalTitle')).toContainText('OnlyMe');
    });

});
