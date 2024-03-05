import { action, json, redirect } from '@solidjs/router';

import { loginDevServer } from './dev-login.server';

export const loginDev = action(async (formData: FormData) => {
  'use server';
  const name = formData.get('name')?.toString().trim();
  if (!name) {
    return json(
      { errors: { name: 'Cannot be empty ' } },
      { status: 500, revalidate: [] },
    );
  }
  try {
    const { redirectUrl } = await loginDevServer(name);
    return redirect(redirectUrl);
  } catch (error) {
    return json({ failed: true }, { status: 500, revalidate: [] });
  }
}, 'dev-login');
