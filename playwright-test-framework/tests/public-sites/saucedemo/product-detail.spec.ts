import { test, expect, SAUCE_USERS } from '../../../fixtures/saucedemo-fixtures';

/**
 * SauceDemo product detail coverage (4 cases).
 */
test.describe('SauceDemo — product detail', () => {
  test.beforeEach(async ({ loginAs, inventoryPage }) => {
    await loginAs(SAUCE_USERS.standard);
    await inventoryPage.openItemByIndex(0);
  });

  test('shows name, description and price', async ({ productDetailPage }) => {
    await productDetailPage.expectLoaded();
    await expect(productDetailPage.name).toBeVisible();
    await expect(productDetailPage.name).toHaveText(/\S/);
    await expect(productDetailPage.description).toBeVisible();
    await expect(productDetailPage.description).toHaveText(/\S/);
    await expect(productDetailPage.price).toBeVisible();
    await expect(productDetailPage.price).toContainText('$');
  });

  test('add to cart updates the badge', async ({ productDetailPage }) => {
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartBadge).toHaveText('1');
    await expect(productDetailPage.removeButton).toBeVisible();
  });

  test('remove from cart clears the badge', async ({ productDetailPage }) => {
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartBadge).toHaveText('1');
    await productDetailPage.removeFromCart();
    await expect(productDetailPage.cartBadge).toHaveCount(0);
  });

  test('Back to products returns to the inventory', async ({ productDetailPage, inventoryPage }) => {
    await productDetailPage.backToProducts();
    await inventoryPage.expectLoaded();
  });
});
