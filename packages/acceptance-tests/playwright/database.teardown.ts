import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { test as teardown } from '@playwright/test';

teardown('delete database', async () => {
  if (existsSync(process.env.DB_CONNECTION!)) {
    await rm(process.env.DB_CONNECTION!);
  }
  if (existsSync(`copy_${process.env.DB_CONNECTION}`)) {
    await rm(`copy_${process.env.DB_CONNECTION}`);
  }
});
