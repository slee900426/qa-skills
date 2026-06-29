import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/saucedemo/LoginPage';
import { InventoryPage } from '../pages/saucedemo/InventoryPage';
import { ProductDetailPage } from '../pages/saucedemo/ProductDetailPage';
import { CartPage } from '../pages/saucedemo/CartPage';
import { CheckoutInfoPage } from '../pages/saucedemo/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/saucedemo/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/saucedemo/CheckoutCompletePage';
import { Menu } from '../pages/saucedemo/Menu';
import { SAUCE_PASSWORD, SAUCE_USERS } from '../utils/helpers';

/**
 * Full SauceDemo fixture set: every page object plus a `loginAs` helper that
 * authenticates and lands on the inventory page.
 */
type SauceFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  menu: Menu;
  /** Log in (defaults to the common password) and assert the inventory page loaded. */
  loginAs: (username: string, password?: string) => Promise<void>;
};

export const test = base.extend<SauceFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  menu: async ({ page }, use) => {
    await use(new Menu(page));
  },
  loginAs: async ({ loginPage, inventoryPage }, use) => {
    await use(async (username: string, password: string = SAUCE_PASSWORD) => {
      await loginPage.goto();
      await loginPage.login(username, password);
      await inventoryPage.expectLoaded();
    });
  },
});

export { expect, SAUCE_PASSWORD, SAUCE_USERS };
