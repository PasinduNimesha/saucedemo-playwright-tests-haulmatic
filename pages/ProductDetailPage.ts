import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ProductDetailPage encapsulates the individual product detail view.
 */
export class ProductDetailPage extends BasePage {
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productName        = page.locator('[data-test="inventory-item-name"]');
    this.productDescription = page.locator('[data-test="inventory-item-desc"]');
    this.productPrice       = page.locator('[data-test="inventory-item-price"]');
    this.productImage       = page.locator('img.inventory_details_img');
    this.addToCartButton    = page.locator('[data-test^="add-to-cart"]');
    this.removeButton       = page.locator('[data-test^="remove"]');
    this.backButton         = page.locator('[data-test="back-to-products"]');
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) ?? '';
  }

  async getProductPrice(): Promise<number> {
    const text = (await this.productPrice.textContent()) ?? '$0';
    return parseFloat(text.replace('$', ''));
  }

  async assertOnDetailPage(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    await expect(this.productName).toBeVisible();
    await expect(this.productPrice).toBeVisible();
    await expect(this.productImage).toBeVisible();
  }

  async assertProductName(name: string): Promise<void> {
    await expect(this.productName).toHaveText(name);
  }

  async assertAddToCartVisible(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible();
  }

  async assertRemoveVisible(): Promise<void> {
    await expect(this.removeButton).toBeVisible();
  }
}
