import { Page } from '@playwright/test';

/**
 * Minimal base page for the self-contained demo app.
 * Holds the Playwright `page` handle and a shared navigation helper.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a path relative to the configured baseURL (defaults to root). */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }
}
