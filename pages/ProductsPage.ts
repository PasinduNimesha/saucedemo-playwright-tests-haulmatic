import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export interface ProductInfo {
  name: string;
  price: number;
  description: string;
}

/**
 * ProductsPage (Inventory) encapsulates interactions with the product listing,
 * sorting, add-to-cart actions, and navigation to product details.
 */
export class ProductsPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────────────────────
  readonly pageTitle: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle      = page.locator('[data-test="title"]');
    this.inventoryList  = page.locator('[data-test="inventory-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown   = page.locator('[data-test="product-sort-container"]');
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.navigateTo('/inventory.html');
    await expect(this.inventoryList).toBeVisible();
  }

  // ── Sorting ────────────────────────────────────────────────────────────────

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  // ── Product names & prices ─────────────────────────────────────────────────

  async getAllProductNames(): Promise<string[]> {
    return this.inventoryItems
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  async getAllProductPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItems
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async getProductCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  // ── Add / remove from cart ────────────────────────────────────────────────

  /** Adds a product to the cart by its data-test ID, e.g. 'add-to-cart-sauce-labs-backpack'. */
  async addProductToCart(productTestId: string): Promise<void> {
    await this.page.locator(`[data-test="${productTestId}"]`).click();
  }

  async removeProductFromCart(productTestId: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${productTestId}"]`).click();
  }

  async addMultipleProductsToCart(productTestIds: string[]): Promise<void> {
    for (const id of productTestIds) {
      await this.addProductToCart(id);
    }
  }

  /** Returns true if the "Remove" button is visible (product is in cart). */
  async isProductInCart(productTestId: string): Promise<boolean> {
    return this.page
      .locator(`[data-test="remove-${productTestId}"]`)
      .isVisible();
  }

  // ── Product detail navigation ──────────────────────────────────────────────

  async clickProductByName(name: string): Promise<void> {
    await this.inventoryItems
      .locator('[data-test="inventory-item-name"]', { hasText: name })
      .click();
  }

  async clickFirstProductImage(): Promise<void> {
    await this.inventoryItems.first().locator('img').click();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertOnProductsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.pageTitle).toHaveText('Products');
  }

  async assertProductCountEquals(count: number): Promise<void> {
    await expect(this.inventoryItems).toHaveCount(count);
  }

  async assertSortedNamesMatch(expected: string[]): Promise<void> {
    const actual = await this.getAllProductNames();
    expect(actual).toEqual(expected);
  }

  async assertPricesSortedAscending(): Promise<void> {
    const prices = await this.getAllProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  }

  async assertPricesSortedDescending(): Promise<void> {
    const prices = await this.getAllProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  }

  async assertCartBadgeCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }
}
