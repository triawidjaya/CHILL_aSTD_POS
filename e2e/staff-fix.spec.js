/**
 * staff-fix.spec.js (Updated for Firebase Architecture)
 * 
 * Verifies staff management buttons work correctly with Firebase mock.
 */

import { test, expect } from '@playwright/test';
import { injectFirebaseMock } from './firebase-mock.js';

test.describe('Staff Management Button Fix Verification', () => {

    test.beforeEach(async ({ page }) => {
        await injectFirebaseMock(page, {
            outletId: 'staff-fix-outlet',
            initialData: {
                staff: [
                    { id: 'sf_1', name: 'Receptionist', role: 'Manager', status: 'Active', pin: '0000' },
                    { id: 'sf_2', name: 'Staff A', role: 'Staff', status: 'Active', pin: '1111' }
                ],
                // Seed one transaction so shift is active (prevents startShiftModal blocking)
                transactions: [
                    { id: 'trx_s', datetime: new Date().toLocaleString(), type: 'income', category: 'START BALANCE', description: 'Float', amount: 100000, method: 'Cash', extra: '-', staff: 'Receptionist' }
                ]
            }
        });
        await page.addInitScript(() => localStorage.setItem('pos_user_role', 'admin'));
        await page.goto('/staff.html');
        await page.waitForLoadState('networkidle');
    });

    test('Should render staff cards from Firestore', async ({ page }) => {
        const staffCards = page.locator('#staffCardContainer .card');
        await expect(staffCards).toHaveCount(2, { timeout: 8000 });
        await expect(page.locator('#staffCardContainer')).toContainText('Receptionist');
        await expect(page.locator('#staffCardContainer')).toContainText('Staff A');
    });

    test('Should open edit modal with correct data when clicking edit button', async ({ page }) => {
        const firstCard = page.locator('#staffCardContainer .card').first();
        await expect(firstCard).toBeVisible({ timeout: 8000 });

        await firstCard.locator('button[data-action="edit"]').click();

        const modal = page.locator('#staffModal');
        await expect(modal).toBeVisible();

        // The first card is "Receptionist" (alphabetical / insertion order)
        await expect(page.locator('#staffNameInput')).toHaveValue('Receptionist');
    });

    test('Should show confirmation modal when clicking delete button', async ({ page }) => {
        const firstCard = page.locator('#staffCardContainer .card').first();
        await expect(firstCard).toBeVisible({ timeout: 8000 });

        await firstCard.locator('button[data-action="delete"]').click();

        const confirmModal = page.locator('#actionConfirmModal');
        await expect(confirmModal).toBeVisible();
        await expect(confirmModal).toContainText('Remove Staff?');
    });

    test('Should successfully save edited staff name via Firestore and update card', async ({ page }) => {
        const firstCard = page.locator('#staffCardContainer .card').first();
        await expect(firstCard).toBeVisible({ timeout: 8000 });

        await firstCard.locator('button[data-action="edit"]').click();
        await expect(page.locator('#staffModal')).toBeVisible();

        await page.fill('#staffNameInput', 'Receptionist Edited');
        await page.locator('button[onclick="saveStaffEntry()"]').click();

        // Modal should close
        await expect(page.locator('#staffModal')).not.toBeVisible({ timeout: 8000 });

        // Card should update via onSnapshot
        await expect(page.locator('#staffCardContainer')).toContainText('Receptionist Edited', { timeout: 8000 });
    });

    test('Should remove staff card after confirming delete via Firestore', async ({ page }) => {
        await expect(page.locator('#staffCardContainer .card')).toHaveCount(2, { timeout: 8000 });

        const firstCard = page.locator('#staffCardContainer .card').first();
        await firstCard.locator('button[data-action="delete"]').click();

        // Confirm deletion
        await page.locator('button[onclick="handleActionConfirm()"]').click();

        // After deleteDoc fires and onSnapshot updates, only 1 card remains
        await expect(page.locator('#staffCardContainer .card')).toHaveCount(1, { timeout: 8000 });
    });

});
