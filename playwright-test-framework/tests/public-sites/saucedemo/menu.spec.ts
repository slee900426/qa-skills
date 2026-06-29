import { test, expect, SAUCE_USERS } from '../../../fixtures/saucedemo-fixtures';

/**
 * SauceDemo hamburger menu coverage (5 cases).
 */
test.describe('SauceDemo — menu', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(SAUCE_USERS.standard);
  });

  test('opening the menu reveals all items', async ({ menu }) => {
    await menu.open();
    await expect(menu.allItemsLink).toBeVisible();
    await expect(menu.aboutLink).toBeVisible();
    await expect(menu.logoutLink).toBeVisible();
    await expect(menu.resetLink).toBeVisible();
  });

  test('About links to saucelabs.com', async ({ menu }) => {
    await menu.open();
    await expect(menu.aboutLink).toHaveAttribute('href', /saucelabs\.com/);
  });

  test('Logout returns to the login page', async ({ menu, loginPage }) => {
    await menu.logout();
    await expect(loginPage.page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('Reset App State empties the cart', async ({ menu, inventoryPage }) => {
    await inventoryPage.addItemByIndex(0);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await menu.resetAppState();
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });

  test('All Items navigates back to the inventory', async ({ menu, inventoryPage, productDetailPage }) => {
    await inventoryPage.openItemByIndex(0);
    await productDetailPage.expectLoaded();
    await menu.goToAllItems();
    await inventoryPage.expectLoaded();
  });
});
