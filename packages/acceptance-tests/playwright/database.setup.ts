import { copyFile, rm } from 'node:fs/promises';
/**
 * Creates copies of seeded databases, replacing potentially updated DB with its initial copy after the test is done.
 * This ensure each test is run in isolation.
 */
import { test as setup } from '@playwright/test';

setup('create new database', async () => {
  console.log('creating new database...');

  setup.beforeAll(async () => {
    console.log('make a copy of the seeded database');
    await copyFile(
      process.env.DB_CONNECTION!,
      `copy_${process.env.DB_CONNECTION}`,
    );
  });

  setup.afterEach(async () => {
    console.log('replace working DB with a copy');
    await rm(process.env.DB_CONNECTION!);
    await copyFile(
      `copy_${process.env.DB_CONNECTION}`,
      process.env.DB_CONNECTION!,
    );
  });
});
