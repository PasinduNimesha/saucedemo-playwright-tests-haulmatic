import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CartPage encapsulates interactions with the shopping cart (/cart.html).
 */
export class CartPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────────────────────
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle              = page.locator('[data-test="title"]');
    this.cartItems              = page.locator('.cart_item');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton         = page.locator('[data-test="checkout"]');
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.navigateTo('/cart.html');
    await expect(this.pageTitle).toBeVisible();
  }

  // ── Cart item helpers ──────────────────────────────────────────────────────

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.cartItems
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  async getCartItemPrices(): Promise<number[]> {
    const texts = await this.cartItems
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return texts.map(p => parseFloat(p.replace('$', '')));
  }

  /** Returns the quantity displayed for every cart item (in order). */
  async getCartItemQuantities(): Promise<number[]> {
    const texts = await this.cartItems
      .locator('[data-test="item-quantity"]')
      .allTextContents();
    return texts.map(q => parseInt(q, 10));
  }

  async isItemInCart(itemName: string): Promise<boolean> {
    const names = await this.getCartItemNames();
    return names.includes(itemName);
  }

  // ── Remove items ───────────────────────────────────────────────────────────

  async removeItem(productTestId: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${productTestId}"]`).click();
  }

  async removeAllItems(): Promise<void> {
    // Remove buttons are re-rendered on each removal; collect testIds first.
    while ((await this.cartItems.count()) > 0) {
      const removeBtn = this.cartItems.first().locator('button[data-test^="remove"]');
      await removeBtn.click();
    }
  }

  // ── Navigation actions ─────────────────────────────────────────────────────

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  async assertCartIsEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  async assertItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async assertItemInCart(itemName: string): Promise<void> {
    await expect(
      this.cartItems.locator('[data-test="inventory-item-name"]', { hasText: itemName })
    ).toBeVisible();
  }

  async assertItemNotInCart(itemName: string): Promise<void> {
    const names = await this.getCartItemNames();
    expect(names).not.toContain(itemName);
  }

  async assertCartBadgeAbsent(): Promise<void> {
    await expect(this.cartBadge).toBeHidden();
  }
}
