import { test, expect, SAUCE_USERS } from '../../../fixtures/saucedemo-fixtures';

/**
 * SauceDemo cart coverage (5 cases).
 * Each test starts with one item already in the cart.
 */
test.describe('SauceDemo — cart', () => {
  test.beforeEach(async ({ loginAs, inventoryPage }) => {
    await loginAs(SAUCE_USERS.standard);
    await inventoryPage.addItemByIndex(0);
    await inventoryPage.goToCart();
  });

  test('shows the added item', async ({ cartPage }) => {
    await cartPage.expectLoaded();
    expect(await cartPage.itemCount()).toBe(1);
  });

  test('item quantity is 1', async ({ cartPage }) => {
    await expect(cartPage.quantities.first()).toHaveText('1');
  });

  test('Continue Shopping returns to the inventory', async ({ cartPage, inventoryPage }) => {
    await cartPage.continueShopping();
    await inventoryPage.expectLoaded();
  });

  test('Checkout proceeds to the information step', async ({ cartPage, checkoutInfoPage }) => {
    await cartPage.checkout();
    await checkoutInfoPage.expectLoaded();
  });

  test('removing the item empties the cart', async ({ cartPage }) => {
    await cartPage.removeItemByIndex(0);
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });
});
