import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Self-contained demo app (served locally by playwright.config.ts webServer).
 * Valid credentials: admin / admin123.
 */
test.describe('Demo app — login', () => {
  test('valid credentials show a welcome message', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('admin', 'admin123');

    await expect(loginPage.welcomeMessage).toBeVisible();
    await expect(loginPage.welcomeMessage).toContainText(/welcome/i);
    await expect(loginPage.welcomeMessage).toContainText('admin');
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('invalid credentials show an error message', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('admin', 'wrong-password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid/i);
    await expect(loginPage.welcomeMessage).toBeHidden();
    // Form remains available for another attempt.
    await expect(loginPage.form).toBeVisible();
  });
});
