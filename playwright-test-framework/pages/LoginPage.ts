import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the self-contained demo login form (demo-app/index.html).
 * Valid credentials: admin / admin123.
 */
export class LoginPage extends BasePage {
  readonly form: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly welcomeMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('[data-test="login-form"]');
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.welcomeMessage = page.locator('[data-test="welcome-message"]');
    this.errorMessage = page.locator('[data-test="error-message"]');
  }

  /** Open the demo app at the root path. */
  async open(): Promise<void> {
    await this.goto('/');
  }

  /** Fill the credentials and submit the form. */
  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
