# E2E Testing Guide

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Prerequisites

- Ensure you have the dependencies installed: `npm install`
- Install Playwright browsers: `npx playwright install`

## Running Tests

### Standard Mode
Run all tests in headless mode:
```bash
npm run e2e
```

### UI Mode
Open the Playwright UI for interactive debugging:
```bash
npx playwright test --ui
```

### Debugging specific tests
Run a specific test file:
```bash
npx playwright test e2e/saas-pos.spec.js
```

## Troubleshooting

### Server Connection
The tests expect the dev server to be running on `http://localhost:3000`. The configuration is set to automatically start the server using `npm run dev` if it's not already running.

### Seeding Data
The main SaaS test (`saas-pos.spec.js`) relies on the **(Dev) Seed Test User** button on the login page to initialize a test account (`manager@test.com` / `Password123!`).

### Visual Debugging
If tests fail, check the `playwright-report` directory for screenshots and traces, or use the `--ui` flag to step through the test execution visually.
