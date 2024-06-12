import { existsSync } from 'node:fs';
import { expect, test as setup } from '@playwright/test';

import { getAuthFilePath } from './utils';

/**
 * Sets up new database before all tests are run.
 * The steps are run in sequence to ensure that user auth sessions are stored
 * in the same DB that was seeded.
 *
 * UPD: seeding was removed as this step is run every time an update to test is made.
 * To reduce friction, DB is now initialized once. If the developer sees failing tests
 * due to them being not isolated, they can re-initialize the database manually.
 */
setup('Set up tests', async ({ page }) => {
  // await setup.step('Set up the database', async () => {
  //   console.time('database');

  //   console.log(`Re-seeding the database`);
  //   try {
  //     execSync('npm run db:seed -w @nou/acceptance-tests', { stdio: 'pipe' });
  //     process.env.TEST_RUN_ID = randomUUID();
  //   } catch (error) {
  //     console.error(error);
  //     process.exit(1);
  //   }

  //   console.log(`The database is set up!`);
  //   console.timeEnd('database');
  // });

  await setup.step('authenticate user-1', async () => {
    console.log('authenticate user-1');
    const authFilePath = getAuthFilePath(1);
    if (existsSync(authFilePath)) {
      return;
    }
    console.log('Going through authentication');
    await page.goto('http://localhost:3000/app/login');

    await page.getByTitle('Developer login').click();

    await page.getByLabel('Dev login').getByRole('textbox').fill('1');
    await page
      .getByLabel('Dev login')
      .getByText('Login', { exact: true })
      .click();

    await page.waitForURL('http://localhost:3000/app');

    expect(page.getByLabel('User menu')).toBeVisible();
    console.log('Authenticated!');

    await page.context().storageState({ path: authFilePath });
  });
});
