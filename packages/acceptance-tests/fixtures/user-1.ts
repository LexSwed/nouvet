import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test as baseTest, expect } from '@playwright/test';

export * from '@playwright/test';
// eslint-disable-next-line @typescript-eslint/ban-types
export const testUserOne = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = baseTest.info().parallelIndex;

      const fileName = resolve(
        baseTest.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });
      await page.goto('http://localhost:3000/app/login');

      await page.getByTitle('Developer login').click();

      await page.getByLabel('Dev login').getByRole('textbox').fill('1');
      await page
        .getByLabel('Dev login')
        .getByText('Login', { exact: true })
        .click();

      await page.waitForURL('http://localhost:3000/app');

      await expect(page).toHaveTitle('NouVet | Welcome');

      expect(page.getByLabel('User menu')).toBeVisible();
      // End of authentication steps.

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});
