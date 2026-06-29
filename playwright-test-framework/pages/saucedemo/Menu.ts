import { Page, Locator, expect } from '@playwright/test';

/**
 * SauceDemo hamburger side menu (shared across authenticated pages).
 * Items are present in the DOM but only interactive once the menu is opened.
 */
export class Menu {
  readonly page: Page;
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openButton = page.locator('#react-burger-menu-btn');
    this.closeButton = page.locator('#react-burger-cross-btn');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.aboutLink = page.locator('#about_sidebar_link');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetLink = page.locator('#reset_sidebar_link');
  }

  /** Open the menu and wait for the items to become visible. */
  async open(): Promise<void> {
    await this.openButton.click();
    await expect(this.allItemsLink).toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.open();
    await this.resetLink.click();
  }

  async goToAllItems(): Promise<void> {
    await this.open();
    await this.allItemsLink.click();
  }
}
