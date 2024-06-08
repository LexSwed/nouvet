import { expect, test } from '@playwright/test';

test.describe('pet-create', () => {
  test.use({ ignoreHTTPSErrors: true });

  test('tests pet-create', async ({ page }) => {
    await page.goto('/app/login');

    await page.getByTitle('Developer login').click();

    await page.getByLabel('Dev login').getByRole('textbox').fill('1');
    await page.getByLabel('Dev login').getByRole('textbox').press('Enter');

    await page.waitForURL('/app');

    expect(page.url()).toMatch('/app');
  });
});
