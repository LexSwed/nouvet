import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { expect, test as setup } from '@playwright/test';

/**
 * Sets up new database before all tests are run.
 */
setup('Set up new database', async () => {
  console.time('database');

  console.log(process.env.DB_CONNECTION);
  if (existsSync(process.env.DB_CONNECTION!)) {
    console.log('Clean up possibly modified database');
    await rm(process.env.DB_CONNECTION!);
  }
  console.log(`Running migrations and seeding the database`);
  try {
    execSync('npm run db:setup -w @nou/acceptance-tests', { stdio: 'pipe' });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`The database is set up!`);
  console.timeEnd('database');
});

const userOneFile = 'playwright/.auth/user-1.json';

setup('authenticate as user-1', async ({ page }) => {
  await page.goto('http://localhost:3000/app/login');

  await page.getByTitle('Developer login').click();

  await page.getByLabel('Dev login').getByRole('textbox').fill('1');
  await page
    .getByLabel('Dev login')
    .getByText('Login', { exact: true })
    .click();

  await page.waitForURL('http://localhost:3000/app');

  expect(page.getByLabel('User menu')).toBeVisible();

  await page.context().storageState({ path: userOneFile });
});
