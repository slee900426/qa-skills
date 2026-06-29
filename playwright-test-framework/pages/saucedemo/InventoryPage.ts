import { Page, Locator, expect } from '@playwright/test';
import { SauceBasePage } from './SauceBasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/**
 * SauceDemo inventory (products) page — the landing page after a successful login.
 */
export class InventoryPage extends SauceBasePage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
  }

  /** Assert the inventory page is loaded. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.items.first()).toBeVisible();
  }

  async itemCount(): Promise<number> {
    return this.items.count();
  }

  /** All product names, in DOM order, trimmed. */
  async names(): Promise<string[]> {
    return (await this.itemNames.allTextContents()).map((s) => s.trim());
  }

  /** All product prices, in DOM order, as numbers. */
  async prices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((t) => Number(t.replace(/[^0-9.]/g, '')));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  /** Add the Nth product to the cart via its in-card button. */
  async addItemByIndex(index: number): Promise<void> {
    await this.items.nth(index).getByRole('button', { name: /add to cart/i }).click();
  }

  /** Remove the Nth product (button toggles to "Remove" once added). */
  async removeItemByIndex(index: number): Promise<void> {
    await this.items.nth(index).getByRole('button', { name: /^remove$/i }).click();
  }

  /** Open the product detail page for the Nth product; returns its name. */
  async openItemByIndex(index: number): Promise<string> {
    const name = (await this.itemNames.nth(index).textContent())?.trim() ?? '';
    await this.itemNames.nth(index).click();
    return name;
  }

  // data-test slugs are derived from the product name, e.g. "sauce-labs-backpack".
  addToCartButton(slug: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${slug}"]`);
  }

  removeButton(slug: string): Locator {
    return this.page.locator(`[data-test="remove-${slug}"]`);
  }
}
