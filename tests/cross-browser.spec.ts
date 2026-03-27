import { test as base, expect, devices } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage, CheckoutStepTwoPage, CheckoutCompletePage } from '../pages/CheckoutPage';
import users from '../test-data/users.json';
import products from '../test-data/products.json';

/**
 * cross-browser.spec.ts — Cross-Browser & Device Coverage
 *
 * These tests run across all browser projects defined in playwright.config.ts
 * (Chromium, Firefox, WebKit, mobile-chrome, mobile-safari).
 *
 * They focus on critical user flows rather than exhaustive feature coverage,
 * ensuring the core journey works across environments and viewport sizes.
 */

// Re-use a lean local test object (no custom fixtures) so each browser project
// can run independently without depending on fixture setup.
const test = base;

// ── Critical flow: Login ────────────────────────────────────────────────────

test.describe('Cross-Browser: Login', () => {
  test('login page renders and login succeeds', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.assertLogoVisible();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('error message is visible on wrong credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.attemptLogin({ username: 'bad_user', password: 'bad_pass' });
    await loginPage.assertErrorVisible();
  });
});

// ── Critical flow: Product listing ─────────────────────────────────────────

test.describe('Cross-Browser: Products', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
  });

  test('products page loads with all 6 items', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.assertProductCountEquals(6);
  });

  test('add-to-cart updates badge count', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.addProductToCart(products.products[0].addToCartTestId);
    await productsPage.assertCartBadgeCount(1);
  });

  test('price sort (low to high) produces ascending order', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.sortBy('lohi');
    await productsPage.assertPricesSortedAscending();
  });
});

// ── Critical flow: End-to-end checkout ─────────────────────────────────────

test.describe('Cross-Browser: Full Checkout Flow', () => {
  test('full checkout completes successfully', async ({ page }) => {
    const loginPage          = new LoginPage(page);
    const productsPage       = new ProductsPage(page);
    const cartPage           = new CartPage(page);
    const stepOnePage        = new CheckoutStepOnePage(page);
    const stepTwoPage        = new CheckoutStepTwoPage(page);
    const completePage       = new CheckoutCompletePage(page);

    // Login.
    await loginPage.goto();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });

    // Add a product.
    await productsPage.goto();
    await productsPage.addProductToCart(products.products[0].addToCartTestId);

    // Go to cart.
    await productsPage.clickCart();
    await cartPage.assertItemCount(1);

    // Checkout.
    await cartPage.proceedToCheckout();
    await stepOnePage.submitCheckoutInfo(users.checkoutInfo.valid);
    await stepTwoPage.assertTotalMatchesSubtotalPlusTax();
    await stepTwoPage.clickFinish();

    // Confirm.
    await completePage.assertOrderConfirmed();
  });
});

// ── Mobile-specific viewport tests ──────────────────────────────────────────

test.describe('Mobile: Viewport Rendering', () => {
  /**
   * NOTE: These tests are targeted at mobile viewport sizes via the
   * mobile-chrome and mobile-safari projects defined in playwright.config.ts.
   * On desktop browsers this suite still runs but the viewport simply differs.
   */

  test('login page is usable on a mobile viewport', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Form inputs and button should all be visible & interactable.
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('products page is scrollable and items are visible on mobile', async ({ page }) => {
    const loginPage    = new LoginPage(page);
    const productsPage = new ProductsPage(page);

    await loginPage.goto();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
    await productsPage.goto();

    // Scroll to the bottom and verify the last item is reachable.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const lastItem = productsPage.inventoryItems.last();
    await expect(lastItem).toBeVisible();
  });

  test('cart icon is accessible on mobile after adding a product', async ({ page }) => {
    const loginPage    = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage     = new CartPage(page);

    await loginPage.goto();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
    await productsPage.goto();
    await productsPage.addProductToCart(products.products[0].addToCartTestId);
    await productsPage.clickCart();
    await cartPage.assertOnCartPage();
    await cartPage.assertItemCount(1);
  });

  test('hamburger menu opens and logout link is visible on mobile', async ({ page }) => {
    const loginPage    = new LoginPage(page);
    const productsPage = new ProductsPage(page);

    await loginPage.goto();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
    await productsPage.goto();
    await productsPage.openMenu();

    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
  });
});

// ── Different viewport sizes ────────────────────────────────────────────────

test.describe('Viewport Sizes: Critical UI', () => {
  const viewports = [
    { width: 1920, height: 1080, label: 'Full HD desktop' },
    { width: 1280, height: 800,  label: 'Standard laptop' },
    { width: 768,  height: 1024, label: 'Tablet portrait' },
    { width: 390,  height: 844,  label: 'iPhone 14 portrait' },
  ];

  for (const vp of viewports) {
    test(`login and add-to-cart work at ${vp.label} (${vp.width}×${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const loginPage    = new LoginPage(page);
      const productsPage = new ProductsPage(page);

      await loginPage.goto();
      await loginPage.login({
        username: users.validUsers[0].username,
        password: users.validUsers[0].password,
      });
      await productsPage.goto();
      await productsPage.addProductToCart(products.products[0].addToCartTestId);
      await productsPage.assertCartBadgeCount(1);
    });
  }
});
