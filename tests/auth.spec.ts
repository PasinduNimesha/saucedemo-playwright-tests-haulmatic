import { test, expect } from '../fixtures';
import users from '../test-data/users.json';

/**
 * auth.spec.ts — Authentication tests
 *
 * Covers: valid login, invalid credentials, locked user, empty field validation,
 * and the logout flow.
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ── Valid login ─────────────────────────────────────────────────────────────

  test('valid login with standard_user redirects to products page', async ({
    loginPage,
    productsPage,
  }) => {
    await loginPage.login({
      username: users.validUsers[0].username,
      password: users.validUsers[0].password,
    });
    await productsPage.assertOnProductsPage();
  });

  // ── Parameterised valid-user tests ─────────────────────────────────────────
  for (const user of users.validUsers) {
    test(`valid login succeeds for user: ${user.username}`, async ({ loginPage, page }) => {
      await loginPage.login({ username: user.username, password: user.password });
      await expect(page).toHaveURL(/inventory\.html/);
    });
  }

  // ── Invalid credentials ─────────────────────────────────────────────────────

  for (const cred of users.invalidCredentials) {
    test(`shows error for ${cred.description}`, async ({ loginPage }) => {
      await loginPage.attemptLogin({
        username: cred.username,
        password: cred.password,
      });
      await loginPage.assertErrorVisible();
      await loginPage.assertErrorText(/Epic sadface/);
      await loginPage.assertOnLoginPage();
    });
  }

  test('error message contains descriptive text for wrong password', async ({
    loginPage,
  }) => {
    await loginPage.attemptLogin({
      username: users.validUsers[0].username,
      password: 'wrong_password',
    });
    await loginPage.assertErrorText('Username and password do not match');
  });

  // ── Locked user ─────────────────────────────────────────────────────────────

  test('locked_out_user sees locked account error', async ({ loginPage }) => {
    await loginPage.attemptLogin({
      username: users.lockedUser.username,
      password: users.lockedUser.password,
    });
    await loginPage.assertErrorVisible();
    await loginPage.assertErrorText('Sorry, this user has been locked out');
    await loginPage.assertOnLoginPage();
  });

  // ── Empty field validation ──────────────────────────────────────────────────

  test('submitting empty form shows username required error', async ({ loginPage }) => {
    await loginPage.clickLogin();
    await loginPage.assertErrorVisible();
    await loginPage.assertErrorText('Username is required');
  });

  test('submitting with only username shows password required error', async ({
    loginPage,
  }) => {
    await loginPage.fillUsername(users.validUsers[0].username);
    await loginPage.clickLogin();
    await loginPage.assertErrorVisible();
    await loginPage.assertErrorText('Password is required');
  });

  test('submitting with only password shows username required error', async ({
    loginPage,
  }) => {
    await loginPage.fillPassword(users.validUsers[0].password);
    await loginPage.clickLogin();
    await loginPage.assertErrorVisible();
    await loginPage.assertErrorText('Username is required');
  });

  test('error banner can be dismissed', async ({ loginPage }) => {
    await loginPage.clickLogin(); // triggers empty-field error
    await loginPage.assertErrorVisible();
    await loginPage.closeErrorMessage();
    await loginPage.assertErrorHidden();
  });

  // ── Logout flow ─────────────────────────────────────────────────────────────

  test('logged-in user can log out and lands on login page', async ({
    loginPage,
    authenticatedPage,
  }) => {
    const lp = loginPage;
    // Re-use the already-authenticated page via the fixture.
    await lp.page.goto('/inventory.html'); // ensure we're on inventory
    await lp.logout();
    await lp.assertOnLoginPage();
    await lp.assertLogoVisible();
  });

  test('after logout, navigating back to inventory redirects to login', async ({
    loginPage,
    authenticatedPage,
  }) => {
    await loginPage.page.goto('/inventory.html');
    await loginPage.logout();
    // Try to access a protected page directly.
    await loginPage.page.goto('/inventory.html');
    await loginPage.assertOnLoginPage();
  });
});
