import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * LoginPage encapsulates all interactions with the SauceDemo login screen.
 */
export class LoginPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────────────────────
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  readonly loginLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput   = page.locator('[data-test="username"]');
    this.passwordInput   = page.locator('[data-test="password"]');
    this.loginButton     = page.locator('[data-test="login-button"]');
    this.errorMessage    = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error"] button');
    this.loginLogo       = page.locator('.login_logo');
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.navigateTo('/');
    await expect(this.loginButton).toBeVisible();
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Performs a full login and waits for navigation to the inventory page.
   * Use this for happy-path scenarios.
   */
  async login({ username, password }: LoginCredentials): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
    await this.page.waitForURL('**/inventory.html');
  }

  /**
   * Attempts a login that is expected to fail (invalid credentials / locked
   * user). Does NOT assert a redirect to inventory.
   */
  async attemptLogin({ username, password }: LoginCredentials): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  async closeErrorMessage(): Promise<void> {
    await this.errorCloseButton.click();
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async assertErrorText(text: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }

  async assertErrorHidden(): Promise<void> {
    await expect(this.errorMessage).toBeHidden();
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL('/');
    await expect(this.loginButton).toBeVisible();
  }

  async assertLogoVisible(): Promise<void> {
    await expect(this.loginLogo).toBeVisible();
  }

  /** Asserts that an input field has the Playwright error class. */
  async assertInputHasError(field: 'username' | 'password'): Promise<void> {
    const locator = field === 'username' ? this.usernameInput : this.passwordInput;
    await expect(locator).toHaveClass(/error/);
  }
}
