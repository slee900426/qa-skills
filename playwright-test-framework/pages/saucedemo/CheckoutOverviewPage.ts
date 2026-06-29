import { Page, Locator, expect } from '@playwright/test';
import { SauceBasePage } from './SauceBasePage';
import { parsePrice } from '../../utils/helpers';

/**
 * SauceDemo checkout step two — order overview (checkout-step-two.html).
 * Exposes the price summary so tests can verify subtotal + tax = total.
 */
export class CheckoutOverviewPage extends SauceBasePage {
  readonly items: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.cart_item');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  /** Item subtotal (before tax), e.g. parsed from "Item total: $29.99". */
  async subtotal(): Promise<number> {
    return parsePrice(await this.subtotalLabel.textContent());
  }

  /** Tax amount, e.g. parsed from "Tax: $2.40". */
  async tax(): Promise<number> {
    return parsePrice(await this.taxLabel.textContent());
  }

  /** Grand total, e.g. parsed from "Total: $32.39". */
  async total(): Promise<number> {
    return parsePrice(await this.totalLabel.textContent());
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
