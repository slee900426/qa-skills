import { Page, Locator, expect } from '@playwright/test';
import { SauceBasePage } from './SauceBasePage';

/**
 * SauceDemo product detail page (inventory-item.html?id=...).
 */
export class ProductDetailPage extends SauceBasePage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.locator('[data-test="inventory-item-name"]');
    this.description = page.locator('[data-test="inventory-item-desc"]');
    this.price = page.locator('[data-test="inventory-item-price"]');
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.removeButton = page.getByRole('button', { name: /^remove$/i });
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html/);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
