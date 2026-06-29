import { Page, Locator, expect } from '@playwright/test';
import { SauceBasePage } from './SauceBasePage';

/**
 * SauceDemo cart page (cart.html).
 */
export class CartPage extends SauceBasePage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly quantities: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.cart_item');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.quantities = page.locator('[data-test="item-quantity"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async itemCount(): Promise<number> {
    return this.items.count();
  }

  async names(): Promise<string[]> {
    return (await this.itemNames.allTextContents()).map((s) => s.trim());
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  removeButton(slug: string): Locator {
    return this.page.locator(`[data-test="remove-${slug}"]`);
  }

  /** Remove the Nth cart item via its in-row "Remove" button. */
  async removeItemByIndex(index: number): Promise<void> {
    await this.items.nth(index).getByRole('button', { name: /^remove$/i }).click();
  }
}
