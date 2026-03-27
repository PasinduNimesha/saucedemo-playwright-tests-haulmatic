import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage provides shared navigation helpers, wait utilities, and common
 * assertions used across all page-object classes.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async navigateTo(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  // ── Menu helpers ───────────────────────────────────────────────────────────

  /** Opens the hamburger sidebar menu. */
  async openMenu(): Promise<void> {
    await this.page.locator('#react-burger-menu-btn').click();
    await this.page.locator('.bm-menu-wrap').waitFor({ state: 'visible' });
  }

  /** Logs the currently authenticated user out. */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.page.locator('#logout_sidebar_link').click();
    await expect(this.page).toHaveURL('/');
  }

  /** Resets the app state via the sidebar. */
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.page.locator('#reset_sidebar_link').click();
    await this.page.locator('#react-burger-cross-btn').click();
  }

  // ── Cart badge ─────────────────────────────────────────────────────────────

  get cartBadge(): Locator {
    return this.page.locator('.shopping_cart_badge');
  }

  async getCartCount(): Promise<number> {
    const badge = this.cartBadge;
    if (!(await badge.isVisible())) return 0;
    const text = await badge.textContent();
    return parseInt(text ?? '0', 10);
  }

  async clickCart(): Promise<void> {
    await this.page.locator('.shopping_cart_link').click();
  }

  // ── Generic wait helpers ───────────────────────────────────────────────────

  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
