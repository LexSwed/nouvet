'use server';

import { cache } from '@solidjs/router';

import { userPets } from '~/server/queries/userPets';
import { userFamily } from '../server/queries/userFamily';

export const getUserFamily = cache(userFamily, 'user-family');

export const getUserPets = cache(userPets, 'user-pets');
