import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test.use({
    ignoreHTTPSErrors: true,
    storageState: { cookies: [], origins: [] },
  });

  test('Unauthorized user', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('NouVet for pets wellbeing');

    await page.getByRole('link', { name: 'Start' }).click();

    await expect(page).toHaveURL('/app/login');
    await expect(page).toHaveTitle('NouVet | Sign In');

    console.log('Redirects to login page when unauthorized');
    await page.goto('/app');
    await page.waitForURL('/app/login');

    expect(page.url()).toMatch('/app/login');
  });
});
