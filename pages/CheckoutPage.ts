import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

// ── Step One: Customer information ─────────────────────────────────────────────

/**
 * CheckoutStepOnePage handles the customer information form at
 * /checkout-step-one.html.
 */
export class CheckoutStepOnePage extends BasePage {
  readonly pageTitle: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle       = page.locator('[data-test="title"]');
    this.firstNameInput  = page.locator('[data-test="firstName"]');
    this.lastNameInput   = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton  = page.locator('[data-test="continue"]');
    this.cancelButton    = page.locator('[data-test="cancel"]');
    this.errorMessage    = page.locator('[data-test="error"]');
  }

  async fillCheckoutInfo({ firstName, lastName, postalCode }: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async submitCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await this.fillCheckoutInfo(info);
    await this.clickContinue();
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Your Information');
  }

  async assertErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async assertErrorText(text: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }

  async assertInputHasError(field: 'firstName' | 'lastName' | 'postalCode'): Promise<void> {
    const locatorMap = {
      firstName: this.firstNameInput,
      lastName: this.lastNameInput,
      postalCode: this.postalCodeInput,
    };
    await expect(locatorMap[field]).toHaveClass(/error/);
  }
}

// ── Step Two: Order summary ────────────────────────────────────────────────────

/**
 * CheckoutStepTwoPage handles the order overview at /checkout-step-two.html.
 */
export class CheckoutStepTwoPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle    = page.locator('[data-test="title"]');
    this.cartItems    = page.locator('.cart_item');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel     = page.locator('[data-test="tax-label"]');
    this.totalLabel   = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async clickFinish(): Promise<void> {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async getSubtotal(): Promise<number> {
    const text = (await this.subtotalLabel.textContent()) ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTax(): Promise<number> {
    const text = (await this.taxLabel.textContent()) ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getTotal(): Promise<number> {
    const text = (await this.totalLabel.textContent()) ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getOrderedItemNames(): Promise<string[]> {
    return this.cartItems
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Overview');
  }

  async assertItemCount(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }

  async assertItemInOverview(name: string): Promise<void> {
    await expect(
      this.cartItems.locator('[data-test="inventory-item-name"]', { hasText: name })
    ).toBeVisible();
  }

  /**
   * Validates that total = subtotal + tax (within floating-point tolerance).
   */
  async assertTotalMatchesSubtotalPlusTax(): Promise<void> {
    const subtotal = await this.getSubtotal();
    const tax      = await this.getTax();
    const total    = await this.getTotal();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  }
}

// ── Step Three: Order complete ────────────────────────────────────────────────

/**
 * CheckoutCompletePage handles the order confirmation at /checkout-complete.html.
 */
export class CheckoutCompletePage extends BasePage {
  readonly pageTitle: Locator;
  readonly confirmationHeader: Locator;
  readonly confirmationText: Locator;
  readonly confirmationImage: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle           = page.locator('[data-test="title"]');
    this.confirmationHeader  = page.locator('[data-test="complete-header"]');
    this.confirmationText    = page.locator('[data-test="complete-text"]');
    this.confirmationImage   = page.locator('[data-test="pony-express"]');
    this.backHomeButton      = page.locator('[data-test="back-to-products"]');
  }

  async clickBackHome(): Promise<void> {
    await this.backHomeButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.pageTitle).toHaveText('Checkout: Complete!');
  }

  async assertOrderConfirmed(): Promise<void> {
    await expect(this.confirmationHeader).toHaveText('Thank you for your order!');
    await expect(this.confirmationText).toBeVisible();
    await expect(this.confirmationImage).toBeVisible();
  }

  async assertBackHomeVisible(): Promise<void> {
    await expect(this.backHomeButton).toBeVisible();
  }
}
