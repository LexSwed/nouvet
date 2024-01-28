'use server';

import { cache } from '@solidjs/router';

import { userFamily } from '../server/queries/userFamily';

export const getUserFamily = cache(userFamily, 'user-family');
