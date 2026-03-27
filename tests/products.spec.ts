import { test, expect } from '../fixtures';
import products from '../test-data/products.json';

/**
 * products.spec.ts — Product Catalog tests
 *
 * Covers: product listing, all four sort options, product detail navigation,
 * add-to-cart, and cart badge updates.
 */

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ authenticatedPage, productsPage }) => {
    // authenticatedPage fixture handles login; navigate to products page.
    await productsPage.goto();
  });

  // ── Product listing ─────────────────────────────────────────────────────────

  test('products page displays correct title', async ({ productsPage }) => {
    await productsPage.assertOnProductsPage();
  });

  test('all 6 products are listed by default', async ({ productsPage }) => {
    await productsPage.assertProductCountEquals(6);
  });

  test('each product has a name, price, and image', async ({ page }) => {
    const items = page.locator('[data-test="inventory-item"]');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      await expect(item.locator('[data-test="inventory-item-name"]')).toBeVisible();
      await expect(item.locator('[data-test="inventory-item-price"]')).toBeVisible();
      await expect(item.locator('img')).toBeVisible();
    }
  });

  // ── Sorting ─────────────────────────────────────────────────────────────────

  test('sort by Name (A-Z) orders products alphabetically ascending', async ({
    productsPage,
  }) => {
    await productsPage.sortBy('az');
    await productsPage.assertSortedNamesMatch(products.expectedSortedNamesAZ);
  });

  test('sort by Name (Z-A) orders products alphabetically descending', async ({
    productsPage,
  }) => {
    await productsPage.sortBy('za');
    await productsPage.assertSortedNamesMatch(products.expectedSortedNamesZA);
  });

  test('sort by Price (Low to High) orders by price ascending', async ({
    productsPage,
  }) => {
    await productsPage.sortBy('lohi');
    await productsPage.assertPricesSortedAscending();
    const prices = await productsPage.getAllProductPrices();
    expect(prices[0]).toBe(products.expectedSortedPricesLowHigh[0]);
  });

  test('sort by Price (High to Low) orders by price descending', async ({
    productsPage,
  }) => {
    await productsPage.sortBy('hilo');
    await productsPage.assertPricesSortedDescending();
    const prices = await productsPage.getAllProductPrices();
    expect(prices[0]).toBe(products.expectedSortedPricesHighLow[0]);
  });

  // ── Product detail navigation ───────────────────────────────────────────────

  test('clicking a product name navigates to its detail page', async ({
    productsPage,
    productDetailPage,
  }) => {
    const targetName = products.products[0].name;
    await productsPage.clickProductByName(targetName);
    await productDetailPage.assertOnDetailPage();
    await productDetailPage.assertProductName(targetName);
  });

  test('product detail page shows name, price, description, and image', async ({
    productsPage,
    productDetailPage,
  }) => {
    await productsPage.clickProductByName(products.products[0].name);
    await productDetailPage.assertOnDetailPage();
  });

  test('back button on detail page returns to products list', async ({
    productsPage,
    productDetailPage,
  }) => {
    await productsPage.clickProductByName(products.products[0].name);
    await productDetailPage.goBack();
    await productsPage.assertOnProductsPage();
  });

  test('price on detail page matches price on listing', async ({
    productsPage,
    productDetailPage,
    page,
  }) => {
    const targetProduct = products.products[0];
    // Get price from listing.
    const listingPrices = await productsPage.getAllProductPrices();
    const listingPrice  = listingPrices[0]; // Sauce Labs Backpack is first by default A-Z

    await productsPage.clickProductByName(targetProduct.name);
    const detailPrice = await productDetailPage.getProductPrice();
    expect(detailPrice).toBeCloseTo(listingPrice, 2);
  });

  // ── Add to cart ─────────────────────────────────────────────────────────────

  test('adding a single product updates cart badge to 1', async ({
    productsPage,
  }) => {
    await productsPage.addProductToCart(products.products[0].addToCartTestId);
    await productsPage.assertCartBadgeCount(1);
  });

  test('adding multiple products increments badge correctly', async ({
    productsPage,
  }) => {
    const ids = products.products.slice(0, 3).map(p => p.addToCartTestId);
    await productsPage.addMultipleProductsToCart(ids);
    await productsPage.assertCartBadgeCount(3);
  });

  test('add-to-cart button toggles to Remove after clicking', async ({
    productsPage,
    page,
  }) => {
    const productId = products.products[0].addToCartTestId;
    await productsPage.addProductToCart(productId);
    const isInCart = await productsPage.isProductInCart(products.products[0].removeTestId.replace('remove-', ''));
    expect(isInCart).toBe(true);
  });

  test('adding product from detail page updates cart badge', async ({
    productsPage,
    productDetailPage,
  }) => {
    await productsPage.clickProductByName(products.products[0].name);
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartBadge).toHaveText('1');
  });
});
