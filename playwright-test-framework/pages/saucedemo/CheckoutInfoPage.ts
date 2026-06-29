import { Page, Locator, expect } from '@playwright/test';
import { SauceBasePage } from './SauceBasePage';

/**
 * SauceDemo checkout step one — "Your Information" (checkout-step-one.html).
 */
export class CheckoutInfoPage extends SauceBasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  /**
   * Fill the form. Pass `null` for any field that should be left blank
   * (used to exercise the per-field validation errors).
   */
  async fillInfo(first: string | null, last: string | null, postal: string | null): Promise<void> {
    if (first !== null) await this.firstName.fill(first);
    if (last !== null) await this.lastName.fill(last);
    if (postal !== null) await this.postalCode.fill(postal);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
