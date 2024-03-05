import { action } from '@solidjs/router';

import { loginDevServer } from './dev-login.server';

export const loginDev = action(async (formData: FormData) => {
  'use server';
  return loginDevServer(formData);
}, 'dev-login');
