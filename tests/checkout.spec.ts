import { test, expect } from '../fixtures';
import users from '../test-data/users.json';
import products from '../test-data/products.json';

/**
 * checkout.spec.ts — Checkout Flow tests
 *
 * Covers: full E2E checkout, required-field validation on checkout step one,
 * order summary verification, order confirmation, and cancellation at each step.
 */

test.describe('Checkout Flow', () => {
  // ── Full end-to-end checkout ─────────────────────────────────────────────────

  test('completes a full end-to-end checkout successfully', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    const info = users.checkoutInfo.valid;

    // Step 1: Navigate from cart to checkout form.
    await cartPage.goto();
    await cartPage.proceedToCheckout();

    // Step 2: Fill in customer information.
    await checkoutStepOnePage.assertOnPage();
    await checkoutStepOnePage.submitCheckoutInfo(info);

    // Step 3: Verify overview and finish.
    await checkoutStepTwoPage.assertOnPage();
    await checkoutStepTwoPage.assertTotalMatchesSubtotalPlusTax();
    await checkoutStepTwoPage.clickFinish();

    // Step 4: Confirm order completion.
    await checkoutCompletePage.assertOnPage();
    await checkoutCompletePage.assertOrderConfirmed();
  });

  // ── Required field validation (Step One) ──────────────────────────────────

  test('missing first name shows validation error', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();

    await checkoutStepOnePage.submitCheckoutInfo(users.checkoutInfo.invalidMissingFirstName).catch(() => {});
    await checkoutStepOnePage.fillCheckoutInfo(users.checkoutInfo.invalidMissingFirstName);
    await checkoutStepOnePage.clickContinue();

    await checkoutStepOnePage.assertErrorVisible();
    await checkoutStepOnePage.assertErrorText('First Name is required');
  });

  test('missing last name shows validation error', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();

    await checkoutStepOnePage.fillCheckoutInfo(users.checkoutInfo.invalidMissingLastName);
    await checkoutStepOnePage.clickContinue();

    await checkoutStepOnePage.assertErrorVisible();
    await checkoutStepOnePage.assertErrorText('Last Name is required');
  });

  test('missing postal code shows validation error', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();

    await checkoutStepOnePage.fillCheckoutInfo(users.checkoutInfo.invalidMissingPostalCode);
    await checkoutStepOnePage.clickContinue();

    await checkoutStepOnePage.assertErrorVisible();
    await checkoutStepOnePage.assertErrorText('Postal Code is required');
  });

  test('submitting empty checkout form shows first-name required error', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.clickContinue();

    await checkoutStepOnePage.assertErrorVisible();
    await checkoutStepOnePage.assertErrorText('First Name is required');
  });

  // ── Checkout overview (Step Two) ───────────────────────────────────────────

  test('checkout overview lists the correct items', async ({
    authenticatedPage,
    productsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await productsPage.goto();
    await productsPage.addProductToCart(products.products[0].addToCartTestId);
    await productsPage.addProductToCart(products.products[1].addToCartTestId);
    await productsPage.clickCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(users.checkoutInfo.valid);

    await checkoutStepTwoPage.assertItemCount(2);
    await checkoutStepTwoPage.assertItemInOverview(products.products[0].name);
    await checkoutStepTwoPage.assertItemInOverview(products.products[1].name);
  });

  test('checkout overview total equals subtotal plus tax', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(users.checkoutInfo.valid);

    await checkoutStepTwoPage.assertTotalMatchesSubtotalPlusTax();
  });

  test('checkout overview subtotal matches sum of item prices', async ({
    authenticatedPage,
    productsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await productsPage.goto();
    // Add Backpack ($29.99) and Bike Light ($9.99) — known prices.
    await productsPage.addProductToCart(products.products[0].addToCartTestId);
    await productsPage.addProductToCart(products.products[1].addToCartTestId);
    await productsPage.clickCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(users.checkoutInfo.valid);

    const subtotal = await checkoutStepTwoPage.getSubtotal();
    const expectedSubtotal = products.products[0].price + products.products[1].price;
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
  });

  // ── Order confirmation ─────────────────────────────────────────────────────

  test('order confirmation page shows thank-you message', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(users.checkoutInfo.valid);
    await checkoutStepTwoPage.clickFinish();

    await checkoutCompletePage.assertOrderConfirmed();
    await checkoutCompletePage.assertBackHomeVisible();
  });

  test('Back Home button on confirmation returns to products page', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
    productsPage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(users.checkoutInfo.valid);
    await checkoutStepTwoPage.clickFinish();

    await checkoutCompletePage.clickBackHome();
    await productsPage.assertOnProductsPage();
  });

  // ── Cancellation behavior ──────────────────────────────────────────────────

  test('Cancel on checkout step one returns to cart', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.clickCancel();
    await cartPage.assertOnCartPage();
  });

  test('Cancel on checkout step two returns to products page', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    productsPage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.submitCheckoutInfo(users.checkoutInfo.valid);
    await checkoutStepTwoPage.clickCancel();
    await productsPage.assertOnProductsPage();
  });

  test('cart items are preserved after cancelling checkout at step one', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.goto();
    const itemsBefore = await cartPage.getCartItemCount();

    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.clickCancel();
    await cartPage.assertOnCartPage();

    const itemsAfter = await cartPage.getCartItemCount();
    expect(itemsAfter).toBe(itemsBefore);
  });
});
