import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Fixtures for the self-contained demo app.
 * Each test receives ready-to-use page objects.
 */
type DemoFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<DemoFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
