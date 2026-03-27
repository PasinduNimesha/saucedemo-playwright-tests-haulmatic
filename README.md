# SauceDemo Playwright Automation Framework

A production-grade end-to-end test automation framework for [SauceDemo](https://www.saucedemo.com), built with **Playwright** and **TypeScript**. Covers authentication, product catalog, shopping cart, checkout, cross-browser, and mobile viewport scenarios.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Test Execution](#test-execution)
- [Test Reports](#test-reports)
- [Project Structure](#project-structure)
- [Test Coverage](#test-coverage)
- [Issues Found](#issues-found)
- [Future Improvements](#future-improvements)

---

## Overview

### Testing Approach

The framework is built around three core principles:

1. **Page Object Model (POM)** - Every page has a dedicated class that encapsulates locators and actions, keeping tests clean and maintenance-friendly.
2. **Data-Driven Testing** - Users, products, and checkout information live in `test-data/*.json` files. Tests consume this data directly, making it trivial to extend coverage by editing JSON rather than touching test code.
3. **Custom Fixtures** - An `authenticatedPage` fixture handles login setup/teardown automatically. A `cartWithItemsPage` fixture pre-populates the cart, so cart and checkout tests can focus on their own concerns.

All locators prefer `data-test` attributes (already present on SauceDemo) for stability, falling back to semantic selectors where needed.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |
| Chromium / Firefox / WebKit | Installed via Playwright (see below) |
| OS | macOS, Linux, or Windows |

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/saucedemo-playwright-tests.git
cd saucedemo-playwright-tests

# 2. Install Node dependencies
npm install

# 3. Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install --with-deps
```

---

## Test Execution

### Run all tests (all browsers in parallel)

```bash
npm test
```

### Run a specific browser only

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run mobile viewports

```bash
npm run test:mobile   # Pixel 5 (Chrome) + iPhone 12 (Safari)
```

### Run a specific test suite

```bash
npm run test:auth
npm run test:products
npm run test:cart
npm run test:checkout
npm run test:cross-browser
```

### Run in headed mode (watch the browser)

```bash
npm run test:headed
```

### Run in debug mode (step through with Playwright Inspector)

```bash
npm run test:debug
```

### Open the interactive Playwright UI

```bash
npm run test:ui
```

### Run a single test file manually

```bash
npx playwright test tests/auth.spec.ts --project=chromium
```

### Run with a specific test title filter

```bash
npx playwright test --grep "valid login"
```

---

## Test Reports

### HTML Report

After any test run the HTML report is generated automatically at `playwright-report/`.

```bash
# Open the report in your browser
npm run report
```

### Traces, Screenshots & Videos

Failed tests automatically capture:

| Artifact | Location | Trigger |
|----------|----------|---------|
| Screenshot | `test-results/` | On failure |
| Video | `test-results/` | On first retry |
| Trace | `test-results/` | On first retry |

To view a trace:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

### JUnit XML (for CI)

A JUnit XML report is written to `test-results/junit.xml` on every run. This is consumed automatically by GitHub Actions.

---

## Project Structure

```
saucedemo-playwright-tests/
│
├── .github/
│   └── workflows/
│       └── playwright.yml        # CI/CD — runs all suites in parallel
│
├── fixtures/
│   └── index.ts                  # Custom fixtures: authenticatedPage, cartWithItemsPage, page objects
│
├── pages/
│   ├── BasePage.ts               # Shared helpers: menu, cart badge, navigation
│   ├── LoginPage.ts              # Login form interactions & assertions
│   ├── ProductsPage.ts           # Inventory listing, sorting, add-to-cart
│   ├── ProductDetailPage.ts      # Individual product detail view
│   ├── CartPage.ts               # Cart view: items, remove, continue shopping
│   └── CheckoutPage.ts           # Three checkout steps in one file
│
├── test-data/
│   ├── users.json                # Valid/invalid/locked users + checkout info
│   └── products.json             # Product catalogue, prices, sort expectations
│
├── tests/
│   ├── auth.spec.ts              # Authentication test suite
│   ├── products.spec.ts          # Product catalog test suite
│   ├── cart.spec.ts              # Shopping cart test suite
│   ├── checkout.spec.ts          # Checkout flow test suite
│   └── cross-browser.spec.ts     # Cross-browser & device coverage suite
│
├── utils/
│   └── helpers.ts                # Shared utilities: sorting, pricing, network mocking
│
├── .eslintrc.json
├── .gitignore
├── package.json
├── playwright.config.ts          # Browser projects, reporting, artifact retention
├── README.md
└── tsconfig.json
```

---

## Test Coverage

### `auth.spec.ts` - Authentication

| # | Scenario | Type |
|---|----------|------|
| 1 | Valid login with `standard_user` → inventory page | Happy path |
| 2 | Valid login for each valid user type (parameterised) | Happy path |
| 3 | Invalid username + password → error banner | Negative |
| 4 | Valid username + wrong password → error banner | Negative |
| 5 | Invalid username + valid password → error banner | Negative |
| 6 | `locked_out_user` → locked account error | Negative |
| 7 | Empty form submission → username required | Edge case |
| 8 | Only username provided → password required | Edge case |
| 9 | Only password provided → username required | Edge case |
| 10 | Error banner can be dismissed | Edge case |
| 11 | Logout → lands on login page | Happy path |
| 12 | Post-logout, protected page redirects to login | Security |

### `products.spec.ts` - Product Catalog

| # | Scenario | Type |
|---|----------|------|
| 1 | Products page title is "Products" | Sanity |
| 2 | 6 products listed by default | Happy path |
| 3 | Each item has name, price, image | Happy path |
| 4 | Sort A→Z matches expected order | Happy path |
| 5 | Sort Z→A matches expected order | Happy path |
| 6 | Sort price low→high is ascending | Happy path |
| 7 | Sort price high→low is descending | Happy path |
| 8 | Click product name → detail page | Happy path |
| 9 | Detail page shows name, price, description, image | Happy path |
| 10 | Back button returns to listing | Happy path |
| 11 | Price on detail matches listing | Data integrity |
| 12 | Add one product → badge shows 1 | Happy path |
| 13 | Add three products → badge shows 3 | Happy path |
| 14 | Add-to-cart button becomes Remove | Happy path |
| 15 | Add from detail page → badge updates | Happy path |

### `cart.spec.ts` - Shopping Cart

| # | Scenario | Type |
|---|----------|------|
| 1 | Multiple items in cart reflect all added products | Happy path |
| 2 | Each cart item quantity displays as 1 | Happy path |
| 3 | Removing one item decrements cart | Happy path |
| 4 | Removing item updates badge | Happy path |
| 5 | Remove all items → empty cart | Happy path |
| 6 | Cart badge disappears on empty cart | Edge case |
| 7 | Continue Shopping → products page | Happy path |
| 8 | Items persist after Continue Shopping | Edge case |
| 9 | Checkout button → step one | Happy path |
| 10 | Cart item prices match product listing | Data integrity |

### `checkout.spec.ts` - Checkout Flow

| # | Scenario | Type |
|---|----------|------|
| 1 | Full E2E checkout completes | Happy path |
| 2 | Missing first name → error | Negative |
| 3 | Missing last name → error | Negative |
| 4 | Missing postal code → error | Negative |
| 5 | Empty form → first name required | Negative |
| 6 | Overview lists correct items | Happy path |
| 7 | Total = subtotal + tax | Data integrity |
| 8 | Subtotal matches sum of item prices | Data integrity |
| 9 | Confirmation page shows thank-you | Happy path |
| 10 | Back Home → products page | Happy path |
| 11 | Cancel step one → cart | Happy path |
| 12 | Cancel step two → products page | Happy path |
| 13 | Cart items preserved after step one cancel | Edge case |

### `cross-browser.spec.ts` - Cross-Browser & Device

| # | Scenario | Browsers |
|---|----------|---------|
| 1 | Login renders and succeeds | All 5 projects |
| 2 | Error on bad credentials | All 5 projects |
| 3 | 6 products load | All 5 projects |
| 4 | Add-to-cart updates badge | All 5 projects |
| 5 | Price sort ascending | All 5 projects |
| 6 | Full checkout flow | All 5 projects |
| 7 | Login page usable on mobile viewport | mobile-chrome, mobile-safari |
| 8 | Products page scrollable on mobile | mobile-chrome, mobile-safari |
| 9 | Cart accessible on mobile | mobile-chrome, mobile-safari |
| 10 | Hamburger menu opens on mobile | mobile-chrome, mobile-safari |
| 11 | Login + add-to-cart at 4 viewport sizes | All 5 projects |

### Browser & Viewport Matrix

| Project | Device | Viewport |
|---------|--------|----------|
| `chromium` | Desktop Chrome | 1280×720 |
| `firefox` | Desktop Firefox | 1280×720 |
| `webkit` | Desktop Safari | 1280×720 |
| `mobile-chrome` | Pixel 5 | 393×851 |
| `mobile-safari` | iPhone 12 | 390×844 |

---

## Issues Found

The following bugs and quirks were observed on SauceDemo during framework development:

### 1. `problem_user` - Broken product images
All product images on the inventory page display the same wrong image (a dog picture) instead of the correct product photo. The detail page also shows the wrong image. This appears intentional as a test scenario but is documented here for completeness.

### 2. `problem_user` - Add-to-cart broken for some products
For `problem_user`, clicking "Add to Cart" on several products does not add the item to the cart and does not update the badge. The button state changes but the cart remains unaffected.

### 3. `problem_user` - Sort does not work
Selecting any sort option for `problem_user` does not reorder the product list. The sort dropdown changes value but the order stays the same.

### 4. `performance_glitch_user` - Slow login
Login with `performance_glitch_user` can take 3–5 seconds longer than normal, occasionally hitting default timeout thresholds on slow CI machines. Tests that use this user explicitly have been written to accommodate this with the global `navigationTimeout` setting.

### 5. Checkout step two "Cancel" returns to products, not cart
Clicking Cancel on the checkout overview (`/checkout-step-two.html`) navigates to `/inventory.html` rather than `/cart.html`. This may be unexpected from a user perspective since the cart items are still populated. This behavior has been asserted as-is.

### 6. No stock / inventory limit enforcement
The application allows adding unlimited quantities of any item without enforcing stock limits, which is expected for a demo app but worth noting.

### 7. Tax rate is fixed at 8%
The tax is always computed as 8% of the subtotal. This is consistent across all test runs and is validated in the checkout tests.

---

## Future Improvements

- **Visual regression testing** - Integrate `@playwright/experimental-ct-react` or Percy/Applitools for screenshot diffing, particularly useful for catching `problem_user` image regressions.
- **Accessibility checks** - Add `axe-core` via `@axe-core/playwright` to audit each page for WCAG violations.
- **API-level test setup** - SauceDemo doesn't expose a REST API, but if it did, bypassing the UI for authentication and cart setup via API calls would dramatically speed up test runs.
- **Parallel shard execution** - Split the test suite across multiple CI machines using `--shard=1/4` etc. to reduce total wall-clock time.
- **Docker image** - Provide a `Dockerfile` with Node + Playwright browsers pre-installed for fully reproducible local and CI runs.
- **Allure reporting** - Replace or supplement the HTML reporter with Allure for richer test history, trend graphs, and flakiness tracking.
- **Environment configuration** - Use a `.env` file (with `dotenv`) for `BASE_URL` and credentials, making it easy to point the suite at staging vs. production.
- **Performance timing assertions** - Add `page.metrics()` checks for `performance_glitch_user` to assert that login latency stays within an acceptable upper bound.
