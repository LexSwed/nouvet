import { test as base, type Page } from '@playwright/test';

export * from '@playwright/test';

// Page Object Model for the "admin" page.
// Here you can add locators and helper methods specific to the admin page.
class UserOnePage {
  // Page signed in as "admin".
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

// Declare the types of your fixtures.
type MyFixtures = {
  userOnePage: Page;
};

export const test = base.extend<MyFixtures>({
  userOnePage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user-1.json',
    });
    const userOnePage = new UserOnePage(await context.newPage());
    await use(userOnePage.page);
    await context.close();
  },
});
