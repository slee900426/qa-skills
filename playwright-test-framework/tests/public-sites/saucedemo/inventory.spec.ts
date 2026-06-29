import { test, expect, SAUCE_USERS } from '../../../fixtures/saucedemo-fixtures';
import { sortedAsc, sortedDesc, numericAsc, numericDesc } from '../../../utils/helpers';

/**
 * SauceDemo inventory coverage (10 cases).
 * Sorting is verified by comparing against a re-sorted copy of the actual data.
 */
test.describe('SauceDemo — inventory', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(SAUCE_USERS.standard);
  });

  test('shows 6 products', async ({ inventoryPage }) => {
    expect(await inventoryPage.itemCount()).toBe(6);
  });

  test('default sort is name A→Z', async ({ inventoryPage }) => {
    const names = await inventoryPage.names();
    expect(names.length).toBe(6);
    expect(names).toEqual(sortedAsc(names));
  });

  test('sort by name Z→A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.names();
    expect(names).toEqual(sortedDesc(names));
  });

  test('sort by price low→high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual(numericAsc(prices));
  });

  test('sort by price high→low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual(numericDesc(prices));
  });

  test('adding one item shows badge count 1', async ({ inventoryPage }) => {
    await inventoryPage.addItemByIndex(0);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    expect(await inventoryPage.cartCount()).toBe(1);
  });

  test('adding two items shows badge count 2', async ({ inventoryPage }) => {
    await inventoryPage.addItemByIndex(0);
    await inventoryPage.addItemByIndex(1);
    await expect(inventoryPage.cartBadge).toHaveText('2');
  });

  test('removing an item clears the badge', async ({ inventoryPage }) => {
    await inventoryPage.addItemByIndex(0);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.removeItemByIndex(0);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });

  test('clicking a product name opens its detail page', async ({ inventoryPage, productDetailPage }) => {
    const name = await inventoryPage.openItemByIndex(0);
    await productDetailPage.expectLoaded();
    await expect(productDetailPage.name).toHaveText(name);
  });

  test('clicking the cart icon navigates to the cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goToCart();
    await cartPage.expectLoaded();
  });
});
