import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('Has a link to navigate to /app', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('NouVet for pets wellbeing');

    await page.getByRole('link', { name: 'Start' }).click();

    await expect(page).toHaveURL('/app/login');
    await expect(page).toHaveTitle('NouVet | Sign In');
  });
});
