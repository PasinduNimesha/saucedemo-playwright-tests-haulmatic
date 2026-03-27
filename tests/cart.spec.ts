import { test, expect } from '../fixtures';
import products from '../test-data/products.json';

/**
 * cart.spec.ts — Shopping Cart tests
 *
 * Covers: multiple items in cart, item removal, quantity display, empty cart
 * behavior, and Continue Shopping navigation.
 */

test.describe('Shopping Cart', () => {
  // ── Add multiple items & verify cart contents ───────────────────────────────

  test('multiple items added from products page appear in cart', async ({
    authenticatedPage,
    productsPage,
    cartPage,
  }) => {
    await productsPage.goto();
    const testIds = [
      products.products[0].addToCartTestId, // Backpack
      products.products[1].addToCartTestId, // Bike Light
      products.products[2].addToCartTestId, // Bolt T-Shirt
    ];
    await productsPage.addMultipleProductsToCart(testIds);
    await productsPage.clickCart();
    await cartPage.waitForUrl(/cart\.html/);
    await cartPage.waitForNetworkIdle();

    await cartPage.assertOnCartPage();
    await cartPage.assertItemCount(3);
    await cartPage.assertItemInCart(products.products[0].name);
    await cartPage.assertItemInCart(products.products[1].name);
    await cartPage.assertItemInCart(products.products[2].name);
  });

  test('cart item quantity is displayed as 1 per item', async ({
    cartWithItemsPage,
    cartPage,
  }) => {
    // cartWithItemsPage fixture adds 2 products.
    await cartPage.goto();
    const quantities = await cartPage.getCartItemQuantities();
    expect(quantities.every(q => q === 1)).toBe(true);
  });

  // ── Remove items ────────────────────────────────────────────────────────────

  test('removing one item decrements cart contents correctly', async ({
    cartWithItemsPage,
    cartPage,
    page,
  }) => {
    await cartPage.goto();
    const beforeCount = await cartPage.getCartItemCount();

    await cartPage.removeItem(products.products[0].removeTestId.replace('remove-', ''));

    await cartPage.assertItemCount(beforeCount - 1);
    await cartPage.assertItemNotInCart(products.products[0].name);
  });

  test('removing an item updates the cart badge', async ({
    cartWithItemsPage,
    cartPage,
    productsPage,
    page,
  }) => {
    await cartPage.goto();
    // Cart has 2 items (from fixture). Remove one.
    await cartPage.removeItem(products.products[0].removeTestId.replace('remove-', ''));
    // Badge should now read 1.
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  // ── Empty cart ──────────────────────────────────────────────────────────────

  test('removing all items leaves an empty cart', async ({
    cartWithItemsPage,
    cartPage,
  }) => {
    await cartPage.goto();
    await cartPage.removeAllItems();
    await cartPage.assertCartIsEmpty();
  });

  test('cart badge disappears when all items are removed', async ({
    cartWithItemsPage,
    cartPage,
    page,
  }) => {
    await cartPage.goto();
    await cartPage.removeAllItems();
    // Badge should be absent when cart is empty.
    await expect(page.locator('.shopping_cart_badge')).toBeHidden();
  });

  // ── Continue Shopping navigation ────────────────────────────────────────────

  test('Continue Shopping button navigates back to products page', async ({
    cartWithItemsPage,
    cartPage,
    productsPage,
  }) => {
    await cartPage.goto();
    await cartPage.continueShopping();
    await productsPage.assertOnProductsPage();
  });

  test('items remain in cart after using Continue Shopping', async ({
    cartWithItemsPage,
    cartPage,
    productsPage,
    page,
  }) => {
    await cartPage.goto();
    const beforeNames = await cartPage.getCartItemNames();
    await cartPage.continueShopping();

    // Navigate back to cart and verify items are still there.
    await productsPage.clickCart();
    await cartPage.assertOnCartPage();
    const afterNames = await cartPage.getCartItemNames();
    expect(afterNames).toEqual(beforeNames);
  });

  // ── Checkout navigation from cart ────────────────────────────────────────────

  test('Checkout button navigates to checkout step one', async ({
    cartWithItemsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.assertOnPage();
  });

  // ── Prices in cart match product listing ──────────────────────────────────

  test('item prices in cart match those on the product listing', async ({
    authenticatedPage,
    productsPage,
    cartPage,
  }) => {
    await productsPage.goto();
    // Add the backpack (known price: $29.99).
    const target = products.products[0];
    await productsPage.addProductToCart(target.addToCartTestId);
    await productsPage.clickCart();

    const cartPrices = await cartPage.getCartItemPrices();
    expect(cartPrices[0]).toBeCloseTo(target.price, 2);
  });
});
