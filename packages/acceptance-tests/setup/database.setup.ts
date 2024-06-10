import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { test as setup } from '@playwright/test';

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
