import { test, expect, SAUCE_USERS } from '../../../fixtures/saucedemo-fixtures';

/**
 * SauceDemo footer coverage (2 cases).
 */
test.describe('SauceDemo — footer', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(SAUCE_USERS.standard);
  });

  test('social links point to the expected networks', async ({ inventoryPage }) => {
    await expect(inventoryPage.socialTwitter).toHaveAttribute('href', /twitter\.com|x\.com/);
    await expect(inventoryPage.socialFacebook).toHaveAttribute('href', /facebook\.com/);
    await expect(inventoryPage.socialLinkedin).toHaveAttribute('href', /linkedin\.com/);
  });

  test('copyright notice is present', async ({ inventoryPage }) => {
    await expect(inventoryPage.footerCopy).toBeVisible();
    await expect(inventoryPage.footerCopy).toContainText(/sauce labs/i);
    await expect(inventoryPage.footerCopy).toContainText(/all rights reserved/i);
  });
});
