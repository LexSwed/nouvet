import { test as base, type Page } from '@playwright/test';

import { getAuthFilePath } from '../setup/utils';

export * from '@playwright/test';

class UserOnePage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

type UserAuthFixtures = {
  userOnePage: Page;
};

export const test = base.extend<UserAuthFixtures>({
  userOnePage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: getAuthFilePath(1),
    });
    const userOnePage = new UserOnePage(await context.newPage());
    await use(userOnePage.page);
    await context.close();
  },
});
