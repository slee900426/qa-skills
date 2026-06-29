import { test, expect, SAUCE_USERS } from '../../../fixtures/saucedemo-fixtures';
import { round2 } from '../../../utils/helpers';

/**
 * SauceDemo checkout coverage (8 cases).
 * Each test starts with two items in the cart, sitting on the cart page.
 */
test.describe('SauceDemo — checkout', () => {
  test.beforeEach(async ({ loginAs, inventoryPage }) => {
    await loginAs(SAUCE_USERS.standard);
    await inventoryPage.addItemByIndex(0);
    await inventoryPage.addItemByIndex(1);
    await inventoryPage.goToCart();
  });

  test('completes the full purchase flow', async ({
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await cartPage.checkout();
    await checkoutInfoPage.expectLoaded();
    await checkoutInfoPage.fillInfo('Jane', 'Doe', '12345');
    await checkoutInfoPage.continue();
    await checkoutOverviewPage.expectLoaded();
    await checkoutOverviewPage.finish();
    await checkoutCompletePage.expectLoaded();
  });

  test('order confirmation header is shown after finishing', async ({
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo('Jane', 'Doe', '12345');
    await checkoutInfoPage.continue();
    await checkoutOverviewPage.finish();
    await expect(checkoutCompletePage.header).toBeVisible();
    await expect(checkoutCompletePage.header).toContainText(/thank you for your order/i);
  });

  test('missing first name shows a validation error', async ({ cartPage, checkoutInfoPage }) => {
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo(null, 'Doe', '12345');
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText(/first name is required/i);
  });

  test('missing last name shows a validation error', async ({ cartPage, checkoutInfoPage }) => {
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo('Jane', null, '12345');
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText(/last name is required/i);
  });

  test('missing postal code shows a validation error', async ({ cartPage, checkoutInfoPage }) => {
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo('Jane', 'Doe', null);
    await checkoutInfoPage.continue();
    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText(/postal code is required/i);
  });

  test('Cancel on the information step returns to the cart', async ({ cartPage, checkoutInfoPage }) => {
    await cartPage.checkout();
    await checkoutInfoPage.expectLoaded();
    await checkoutInfoPage.cancel();
    await cartPage.expectLoaded();
  });

  test('price summary: subtotal + tax = total', async ({
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo('Jane', 'Doe', '12345');
    await checkoutInfoPage.continue();
    await checkoutOverviewPage.expectLoaded();

    const subtotal = await checkoutOverviewPage.subtotal();
    const tax = await checkoutOverviewPage.tax();
    const total = await checkoutOverviewPage.total();

    expect(subtotal).toBeGreaterThan(0);
    expect(tax).toBeGreaterThan(0);
    expect(round2(subtotal + tax)).toBeCloseTo(total, 2);
  });

  test('Back Home from the complete page returns to the inventory', async ({
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    inventoryPage,
  }) => {
    await cartPage.checkout();
    await checkoutInfoPage.fillInfo('Jane', 'Doe', '12345');
    await checkoutInfoPage.continue();
    await checkoutOverviewPage.finish();
    await checkoutCompletePage.expectLoaded();
    await checkoutCompletePage.backHome();
    await inventoryPage.expectLoaded();
  });
});
