import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import {
  CheckoutStepOnePage,
  CheckoutStepTwoPage,
  CheckoutCompletePage,
} from '../pages/CheckoutPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import users from '../test-data/users.json';

// ── Page-object fixture type ──────────────────────────────────────────────────

export type PageObjects = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
  productDetailPage: ProductDetailPage;
};

// ── Extended fixture type ─────────────────────────────────────────────────────

export type CustomFixtures = PageObjects & {
  /** Page already authenticated as standard_user. */
  authenticatedPage: Page;
  /** Page authenticated as standard_user with two items already in the cart. */
  cartWithItemsPage: Page;
};

// ── Fixture implementation ────────────────────────────────────────────────────

export const test = base.extend<CustomFixtures>({
  // ── Page-object fixtures ──────────────────────────────────────────────────
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },
  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  // ── Authenticated page fixture ────────────────────────────────────────────
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
    await use(page);
    // Teardown: reset app state so subsequent tests start clean.
    try {
      const productsPage = new ProductsPage(page);
      await productsPage.resetAppState();
    } catch {
      // Ignore teardown errors — page may already be closed or navigated away.
    }
  },

  // ── Cart-with-items fixture ───────────────────────────────────────────────
  cartWithItemsPage: async ({ page }, use) => {
    const loginPage    = new LoginPage(page);
    const productsPage = new ProductsPage(page);

    await loginPage.goto();
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });

    // Add two products to cart for a realistic starting state.
    await productsPage.addProductToCart('add-to-cart-sauce-labs-backpack');
    await productsPage.addProductToCart('add-to-cart-sauce-labs-bike-light');

    await use(page);

    // Teardown: reset app state.
    try {
      await productsPage.resetAppState();
    } catch {
      // Ignore teardown errors.
    }
  },
});

export { expect } from '@playwright/test';
