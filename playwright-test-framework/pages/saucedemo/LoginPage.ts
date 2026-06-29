import { Page, Locator } from '@playwright/test';
import { SAUCEDEMO_BASE_URL } from './SauceBasePage';

/**
 * SauceDemo login page (https://www.saucedemo.com/).
 * All accounts use the password `secret_sauce`.
 */
export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /** Open the login page. */
  async goto(): Promise<void> {
    await this.page.goto(`${SAUCEDEMO_BASE_URL}/`);
  }

  /** Navigate directly to a path (used to test unauthenticated access guards). */
  async gotoPath(path: string): Promise<void> {
    await this.page.goto(`${SAUCEDEMO_BASE_URL}${path}`);
  }

  /** Fill credentials and submit. */
  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
