import { Page, Locator, expect } from '@playwright/test';
import { SauceBasePage } from './SauceBasePage';

/**
 * SauceDemo checkout complete page (checkout-complete.html).
 */
export class CheckoutCompletePage extends SauceBasePage {
  readonly header: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
