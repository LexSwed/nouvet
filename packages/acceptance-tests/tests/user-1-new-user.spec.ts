import { expect, test } from '../fixtures/users';

test.describe('User 1 is a new user', () => {
  test('can create pets', async ({ userOnePage: page }) => {
    page.goto('/app');
    console.log('Has initial pet creation form expanded');
    await expect(page.getByLabel('Add your pet')).toBeVisible();
  });

  test('can create family invites', async ({ userOnePage: page, context }) => {
    page.goto('/app');
    console.log('Has family invitation message');
    await expect(
      page
        .getByRole('button')
        .getByText('Have your partner already registered? Join them!'),
    ).toBeVisible();

    console.log('Opens family invite dialog on QR scan page');
    await page
      .getByRole('button')
      .getByText('Have your partner already registered? Join them!')
      .click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1000 });
    await expect(
      page
        .getByRole('dialog')
        .getByText(
          'Scan the QR-code, created by your partner in their NouVet app.',
        ),
    ).toBeVisible();
    page.getByRole('dialog').getByLabel('Close dialog').click();

    console.log('Has default family invite window.');
    await page.getByRole('button').getByLabel('My Family').click();
    await expect(
      page.getByRole('dialog').getByText('Sharing is caring'),
    ).toBeVisible();
    await page.getByRole('dialog').getByText('Invite').click();
    await expect(page.getByRole('dialog')).toBeFocused();
    await expect(
      page.getByRole('dialog').getByRole('button').getByText('Create QR code'),
    ).toBeVisible();

    console.log('Can create invites and share them');
    page
      .getByRole('dialog')
      .getByRole('button')
      .getByText('Create QR code')
      .click();
    await expect(
      page.getByText(/The invitation expires in [\d]+ minutes/),
    ).toBeVisible();

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const clipboardText = await page.evaluate('navigator.clipboard.readText()');
    expect(clipboardText).toContain("Hello, I'm TEXT 1");
  });
});
