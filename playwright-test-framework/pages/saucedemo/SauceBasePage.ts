import { Page, Locator } from '@playwright/test';

/** Base URL for SauceDemo (overridable via SAUCEDEMO_BASE_URL). */
export const SAUCEDEMO_BASE_URL = process.env.SAUCEDEMO_BASE_URL ?? 'https://www.saucedemo.com';

/**
 * Base page for every authenticated SauceDemo screen.
 * Provides the shared header (title, cart link/badge, burger menu) and footer locators.
 */
export abstract class SauceBasePage {
  readonly page: Page;

  // Header
  readonly pageTitle: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly burgerButton: Locator;

  // Footer
  readonly footerCopy: Locator;
  readonly socialTwitter: Locator;
  readonly socialFacebook: Locator;
  readonly socialLinkedin: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerButton = page.locator('#react-burger-menu-btn');

    this.footerCopy = page.locator('[data-test="footer-copy"]');
    this.socialTwitter = page.locator('[data-test="social-twitter"]');
    this.socialFacebook = page.locator('[data-test="social-facebook"]');
    this.socialLinkedin = page.locator('[data-test="social-linkedin"]');
  }

  /** Click the cart icon in the header. */
  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  /**
   * Current cart badge count. Returns 0 when the badge is absent
   * (SauceDemo only renders the badge once the cart is non-empty).
   */
  async cartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    const text = await this.cartBadge.textContent();
    return Number((text ?? '0').trim());
  }
}
