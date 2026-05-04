# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saas-pos.spec.js >> CHILL aSTD POS SaaS E2E Flow >> should complete a full shift cycle with seeding
- Location: e2e\saas-pos.spec.js:5:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForEvent: Test timeout of 60000ms exceeded.
=========================== logs ===========================
waiting for event "dialog"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "CHILL aSTD POS" [level=1] [ref=e6]
    - paragraph [ref=e7]: Point of Sale System
  - generic [ref=e8]: "Auth error: Failed to fetch"
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]:
        - /placeholder: your@email.com
    - generic [ref=e13]:
      - generic [ref=e14]: Password
      - textbox "Password" [ref=e15]:
        - /placeholder: ••••••••
    - button "Login" [ref=e16] [cursor=pointer]
    - generic [ref=e17]:
      - button "Create New Outlet" [ref=e18] [cursor=pointer]
      - button "(Dev) Seed Test User" [active] [ref=e19] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import fs from 'fs';
  3  | 
  4  | test.describe('CHILL aSTD POS SaaS E2E Flow', () => {
  5  |   test('should complete a full shift cycle with seeding', async ({ page }) => {
  6  |     // Capture silent browser errors and console logs
  7  |     page.on('console', msg => console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text()));
  8  |     page.on('pageerror', err => console.log(`BROWSER ERROR:`, err.message));
  9  | 
  10 |     // 1. Navigate to login
  11 |     await page.goto('/login');
  12 |     await expect(page).toHaveTitle(/CHILL aSTD POS/);
  13 | 
  14 |     // Dump DOM for debugging
  15 |     const html = await page.content();
  16 |     fs.writeFileSync('e2e-debug-dom.html', html);
  17 | 
  18 |     // 2. Seed test user
  19 |     const seedButton = page.locator('text=(Dev) Seed Test User');
  20 |     await expect(seedButton).toBeVisible();
  21 |     
  22 |     // Set up the promise BEFORE clicking
> 23 |     const dialogPromise = page.waitForEvent('dialog');
     |                                ^ Error: page.waitForEvent: Test timeout of 60000ms exceeded.
  24 |     
  25 |     await seedButton.click();
  26 | 
  27 |     // Await the dialog to ensure seeding is totally finished
  28 |     const dialog = await dialogPromise;
  29 |     expect(dialog.message()).toContain('Test user seeded');
  30 |     await dialog.accept();
  31 | 
  32 |     // 3. Login
  33 |     await page.fill('input[name="email"]', 'manager@test.com');
  34 |     await page.fill('input[name="password"]', 'Password123!');
  35 |     await page.click('button[type="submit"]');
  36 | 
  37 |     // 4. Verify Dashboard
  38 |     await expect(page.locator('h2')).toContainText('Ongoing Shift Dashboard');
  39 | 
  40 |     // 5. Open Shift
  41 |     const openShiftCard = page.locator('.start-shift-card');
  42 |     if (await openShiftCard.isVisible()) {
  43 |       await page.fill('input[type="number"]', '500000');
  44 |       await page.click('button:has-text("Open New Shift")');
  45 |     }
  46 | 
  47 |     // 6. Add Transaction
  48 |     await page.click('button:has-text("+ New Transaction")');
  49 |     
  50 |     // Select Staff
  51 |     await page.selectOption('select[required]', { index: 1 }); // Select first staff
  52 |     
  53 |     // Amount
  54 |     await page.fill('input[placeholder="0"]', '150000');
  55 |     
  56 |     // Category (Income by default)
  57 |     await page.selectOption('select:near(label:has-text("Category"))', { index: 1 });
  58 |     
  59 |     // Save
  60 |     await page.click('button:has-text("Save Transaction")');
  61 | 
  62 |     // 7. Verify in list
  63 |     await expect(page.locator('.transaction-list-card')).toContainText('150.000');
  64 | 
  65 |     // 8. Close Shift
  66 |     await page.click('button:has-text("Close Shift")');
  67 |     
  68 |     // Handle confirmation dialog
  69 |     page.once('dialog', dialog => dialog.accept());
  70 |     await page.click('button:has-text("Close Shift")'); // Click again if modal or just confirmation
  71 | 
  72 |     // 9. Check History
  73 |     await page.click('a[href="/history"]');
  74 |     await expect(page.locator('.history-card')).toContainText('CLOSED');
  75 |   });
  76 | });
  77 | 
```