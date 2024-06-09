import { test as base } from '@playwright/test';

export const test = base.extend<{ setupDatabase: void }>({
  setupDatabase: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      console.log('BEFORE EACH HOOK FROM FIXTURE');
      // Any code here will be run as a before each hook

      await use();

      console.log('AFTER EACH HOOK FROM FIXTURE');
      // Put any code you want run automatically after each test here
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
