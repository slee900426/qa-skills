import { test, expect, SAUCE_USERS, SAUCE_PASSWORD } from '../../../fixtures/saucedemo-fixtures';

/**
 * SauceDemo login coverage (11 cases).
 * Assertions use regex partial matching so they stay robust to minor copy changes.
 */
test.describe('SauceDemo — login', () => {
  test('standard_user logs in successfully', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.standard, SAUCE_PASSWORD);
    await inventoryPage.expectLoaded();
    await expect(inventoryPage.pageTitle).toHaveText(/products/i);
  });

  test('locked_out_user is blocked with an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.lockedOut, SAUCE_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/locked out/i);
    await expect(loginPage.page).not.toHaveURL(/inventory\.html/);
  });

  test('wrong password shows an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.standard, 'definitely_wrong');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/do not match/i);
  });

  test('non-existent user shows an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('ghost_user', SAUCE_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/do not match/i);
  });

  test('empty username shows "Username is required"', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', SAUCE_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/username is required/i);
  });

  test('empty password shows "Password is required"', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.standard, '');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/password is required/i);
  });

  test('problem_user logs in successfully', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.problem, SAUCE_PASSWORD);
    await inventoryPage.expectLoaded();
  });

  test('performance_glitch_user logs in successfully (slow path)', async ({ loginPage, inventoryPage }) => {
    test.setTimeout(30_000);
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.performanceGlitch, SAUCE_PASSWORD);
    // This account intentionally delays the post-login navigation.
    await expect(loginPage.page).toHaveURL(/inventory\.html/, { timeout: 15_000 });
    await expect(inventoryPage.items.first()).toBeVisible({ timeout: 15_000 });
  });

  test('error_user logs in successfully', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.error, SAUCE_PASSWORD);
    await inventoryPage.expectLoaded();
  });

  test('visual_user logs in successfully', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(SAUCE_USERS.visual, SAUCE_PASSWORD);
    await inventoryPage.expectLoaded();
  });

  test('direct access to /inventory.html while logged out is blocked', async ({ loginPage }) => {
    await loginPage.gotoPath('/inventory.html');
    await expect(loginPage.page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/logged in/i);
  });
});
