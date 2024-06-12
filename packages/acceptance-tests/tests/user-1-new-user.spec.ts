import { expect, test } from '../fixtures/users';

test.describe('User 1 is a new user', () => {
  test('can create pets', async ({ userOnePage: page }) => {
    page.goto('/app');
    console.log('Has initial pet creation form expanded');
    await expect(page.getByLabel('Add your pet')).toBeVisible();
  });

  test('can create family invites', async ({ userOnePage: page }) => {
    page.goto('/app');
    await page.waitForEvent('load');

    console.log('Has family invitation message');
    const newPetFamilyInvitationCta = page.getByRole('button', {
      name: 'Have your partner already registered? Join them!',
    });
    await expect(newPetFamilyInvitationCta).toBeVisible();

    console.log('Opens family invite dialog on QR scan page');
    await newPetFamilyInvitationCta.click();
    await expect(
      page.getByRole('dialog', { name: 'Join another user' }),
    ).toBeVisible();
    await page
      .getByRole('dialog', { name: 'Join another user' })
      .getByLabel('Close dialog')
      .click();

    console.log('Has default family invite window.');
    await page.getByRole('button', { name: 'My Family' }).click();
    await expect(
      page
        .getByRole('dialog', { name: 'Family invitation' })
        .getByText('Sharing is caring'),
    ).toBeVisible();
    await page
      .getByRole('dialog', { name: 'Family invitation' })
      .getByText('Invite')
      .click();
    await expect(
      page.getByRole('dialog', { name: 'Create invite' }),
    ).toBeFocused();
    await expect(
      page
        .getByRole('dialog', { name: 'Create invite' })
        .getByRole('button')
        .getByText('Create QR code'),
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
  });
});
