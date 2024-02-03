import { action, cache, revalidate } from '@solidjs/router';
import {
  coerce,
  maxValue,
  minValue,
  nullish,
  number,
  object,
  parse,
  string,
  ValiError,
} from 'valibot';

import { getRequestUserSafe } from '~/server/auth/session-safe';
import { getDictionary } from '~/server/i18n';
import { petCreate } from '~/server/queries/petCreate';
import { petUpdate } from '~/server/queries/petUpdate';
import { userPets } from '~/server/queries/userPets';
import { translateErrorTokens, type ErrorKeys } from '~/server/utils';

export const createPetAction = action(async (formData: FormData) => {
  'use server';
  const currentUser = await getRequestUserSafe();
  return petCreate(
    {
      name: formData.get('name'),
      type: formData.get('type'),
      gender: formData.get('gender'),
    },
    currentUser.userId,
  );
}, 'create-pet');

export const getUserPets = cache(async () => {
  const currentUser = await getRequestUserSafe();
  return userPets(currentUser.userId);
}, 'user-pets');

const BirthDateSchema = object({
  bday: nullish(
    coerce(
      number('bday' satisfies ErrorKeys, [minValue(1), maxValue(31)]),
      Number,
    ),
    1,
  ),
  bmonth: nullish(
    coerce(
      number('bmonth' satisfies ErrorKeys, [minValue(0), maxValue(11)]),
      Number,
    ),
    0,
  ),
  byear: coerce(
    number('byear' satisfies ErrorKeys, [
      minValue(1980),
      maxValue(new Date().getFullYear()),
    ]),
    Number,
  ),
});

export const updatePetBirthDate = action(async (formData: FormData) => {
  'use server';
  try {
    const { bday, bmonth, byear } = parse(BirthDateSchema, {
      bday: formData.get('bday') || 1,
      bmonth: formData.get('bmonth') || 0,
      byear: formData.get('byear'),
    });
    const dateOfBirth = new Date(Date.UTC(byear, bmonth, bday));
    if (dateOfBirth.getDate() !== bday || dateOfBirth.getMonth() !== bmonth) {
      const dict = await getDictionary('errors');
      return {
        errors: {
          bday: dict['errors.bday'],
        },
      };
    }
    const petId = Number(formData.get('petId'));
    if (Number.isNaN(petId)) {
      throw new Error('petId is not provided');
    }
    const currentUser = await getRequestUserSafe();
    const result = await petUpdate(
      {
        dateOfBirth,
      },
      petId,
      currentUser.userId,
    );
    if (result.pet) {
      await revalidate(getUserPets.key);
    }
    return result;
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    }
    console.error(error);
    return { failure: true, errors: null };
  }
}, 'update-pet-birth-date');

export const updatePetWeight = action(async (formData: FormData) => {
  'use server';
  try {
    const { weight } = parse(
      object({
        weight: coerce(number(), Number),
      }),
      { weight: formData.get('weight') },
    );
    const petId = Number(formData.get('petId'));
    if (Number.isNaN(petId)) {
      throw new Error('petId is not provided');
    }
    const currentUser = await getRequestUserSafe();
    const result = await petUpdate(
      {
        weight,
      },
      petId,
      currentUser.userId,
    );
    if (result.pet) {
      await revalidate(getUserPets.key);
    }
    return result;
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    }
    console.error(error);
    return { failure: true, errors: null };
  }
}, 'update-pet-weight');

export const updatePetBreed = action(async (formData: FormData) => {
  'use server';
  try {
    const { breed } = parse(
      object({
        breed: string(),
      }),
      { breed: formData.get('breed') },
    );
    const petId = Number(formData.get('petId'));
    if (Number.isNaN(petId)) {
      throw new Error('petId is not provided');
    }
    const currentUser = await getRequestUserSafe();
    const result = await petUpdate(
      {
        breed,
      },
      petId,
      currentUser.userId,
    );
    if (result.pet) {
      await revalidate(getUserPets.key);
    }
    console.log(result);
    return result;
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    }
    console.error(error);
    return { failure: true, errors: null };
  }
}, 'update-pet-weight');
