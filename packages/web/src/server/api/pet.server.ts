import { json } from '@solidjs/router';
import * as v from 'valibot';

import { getRequestUser } from '~/server/auth/request-user';
import { petCreate } from '~/server/db/queries/petCreate';
import { petUpdate } from '~/server/db/queries/petUpdate';
import { userPets } from '~/server/db/queries/userPets';
import { getDictionary } from '~/server/i18n/dict';
import { translateErrorTokens, type ErrorKeys } from '~/server/utils';

import { getUserPets } from './pet';

export const getUserPetsServer = async () => {
  'use server';
  const currentUser = await getRequestUser();
  const pets = await userPets(currentUser.userId);
  return pets;
};

export const createPetServer = async (formData: FormData) => {
  'use server';
  const currentUser = await getRequestUser();
  try {
    const pet = await petCreate(
      {
        name: formData.get('name'),
        type: formData.get('type'),
        gender: formData.get('gender'),
      },
      currentUser.userId,
    );
    return json(pet, { revalidate: [getUserPets.key] });
  } catch (error) {
    if (error instanceof v.ValiError) {
      return json(
        { failed: true, errors: await translateErrorTokens(error) },
        { status: 500, revalidate: [] },
      );
    } else {
      console.error(error);
      return json(
        { failed: true, errors: null },
        { status: 500, revalidate: [] },
      );
    }
  }
};

const PetUpdateSchema = v.object({
  petId: v.coerce(v.number([v.integer()]), Number),
  breed: v.optional(v.string([v.toTrimmed()])),
  weight: v.optional(v.coerce(v.number(), Number)),
  birthDate: v.optional(
    v.object({
      bday: v.nullish(
        v.coerce(
          v.number('bday' satisfies ErrorKeys, [v.minValue(1), v.maxValue(31)]),
          Number,
        ),
        1,
      ),
      bmonth: v.nullish(
        v.coerce(
          v.number('bmonth' satisfies ErrorKeys, [
            v.minValue(0),
            v.maxValue(11),
          ]),
          Number,
        ),
        0,
      ),
      byear: v.coerce(
        v.number('byear' satisfies ErrorKeys, [
          v.minValue(1980),
          v.maxValue(new Date().getFullYear()),
        ]),
        Number,
      ),
    }),
  ),
});

export const updatePetBirthDateServer = async (formData: FormData) => {
  'use server';
  try {
    const { petId, birthDate } = v.parse(PetUpdateSchema, {
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
    if (error instanceof v.ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    } else {
      console.error(error);
    }
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
};

export const updatePetWeightServer = async (formData: FormData) => {
  'use server';
  try {
    const { weight } = v.parse(PetUpdateSchema, {
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
    if (error instanceof v.ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    } else {
      console.error(error);
    }
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
};

export const updatePetBreedServer = async (formData: FormData) => {
  'use server';
  try {
    const { petId, breed } = v.parse(PetUpdateSchema, {
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
    if (error instanceof v.ValiError) {
      return {
        errors: await translateErrorTokens(error),
      };
    } else {
      console.error(error);
    }
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
};
