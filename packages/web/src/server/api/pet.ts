import { action, cache, json } from '@solidjs/router';
import {
  coerce,
  integer,
  maxValue,
  minValue,
  nullish,
  number,
  object,
  optional,
  parse,
  string,
  toTrimmed,
  ValiError,
} from 'valibot';

import { getRequestUser } from '~/server/auth/request-user';
import { petCreate } from '~/server/db/queries/petCreate';
import { petUpdate } from '~/server/db/queries/petUpdate';
import { userPets } from '~/server/db/queries/userPets';
import { getDictionary } from '~/server/i18n/dict';
import { translateErrorTokens, type ErrorKeys } from '~/server/utils';

export const getUserPets = cache(async () => {
  'use server';
  const currentUser = await getRequestUser();
  const pets = await userPets(currentUser.userId);
  return pets;
}, 'user-pets');

export const createPetAction = action(async (formData: FormData) => {
  'use server';
  const currentUser = await getRequestUser();
  try {
    const result = await petCreate(
      {
        name: formData.get('name'),
        type: formData.get('type'),
        gender: formData.get('gender'),
      },
      currentUser.userId,
    );
    return json(
      result,
      result.pet ? { revalidate: [getUserPets.key] } : undefined,
    );
  } catch (error) {
    console.error(error);
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
}, 'create-pet');

const PetUpdateSchema = object({
  petId: coerce(number([integer()]), Number),
  breed: optional(string([toTrimmed()])),
  weight: optional(coerce(number(), Number)),
  birthDate: optional(
    object({
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
    }),
  ),
});

export const updatePetBirthDate = action(async (formData: FormData) => {
  'use server';
  try {
    const { petId, birthDate } = parse(PetUpdateSchema, {
      petId: formData.get('petId'),
      birthDate: {
        bday: formData.get('bday'),
        bmonth: formData.get('bmonth'),
        byear: formData.get('byear'),
      },
    });
    const dateOfBirth = new Date(
      Date.UTC(birthDate!.byear, birthDate!.bmonth, birthDate!.bday),
    );
    if (
      dateOfBirth.getDate() !== birthDate!.bday ||
      dateOfBirth.getMonth() !== birthDate!.bmonth
    ) {
      const dict = await getDictionary('errors');
      return {
        errors: {
          bday: dict['bday'],
        },
      };
    }
    const currentUser = await getRequestUser();
    const result = await petUpdate(
      {
        dateOfBirth,
      },
      petId,
      currentUser.userId,
    );
    return json(
      result,
      result.pet ? { revalidate: [getUserPets.key] } : undefined,
    );
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    }
    console.error(error);
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
}, 'update-pet-birth-date');

export const updatePetWeight = action(async (formData: FormData) => {
  'use server';
  try {
    const { weight } = parse(PetUpdateSchema, {
      weight: formData.get('weight'),
    });
    const petId = Number(formData.get('petId'));
    if (Number.isNaN(petId)) {
      throw new Error('petId is not provided');
    }
    const currentUser = await getRequestUser();
    const result = await petUpdate(
      {
        weight,
      },
      petId,
      currentUser.userId,
    );
    return json(
      result,
      result.pet ? { revalidate: [getUserPets.key] } : undefined,
    );
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    }
    console.error(error);
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
}, 'update-pet-weight');

export const updatePetBreed = action(async (formData: FormData) => {
  'use server';
  try {
    const { petId, breed } = parse(PetUpdateSchema, {
      petId: formData.get('petId'),
      breed: formData.get('breed'),
    });
    const currentUser = await getRequestUser();
    const result = await petUpdate(
      {
        breed,
      },
      petId,
      currentUser.userId,
    );
    return json(
      result,
      result.pet ? { revalidate: [getUserPets.key] } : undefined,
    );
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    }
    console.error(error);
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
}, 'update-pet-breed');
