'use server';

import { json } from '@solidjs/router';
import { object, parse, string, toTrimmed, ValiError } from 'valibot';

import { getRequestUser } from '~/server/auth/request-user';
import { familyUpdate } from '~/server/db/queries/familyUpdate';

import { translateErrorTokens, type ErrorKeys } from '../utils';

import { getUserFamily } from './user';

const FamilyUpdateSchema = object({
  name: string('family.name' satisfies ErrorKeys, [toTrimmed()]),
});
export async function updateFamilyServer(formData: FormData) {
  try {
    const user = await getRequestUser();
    const { name } = parse(FamilyUpdateSchema, {
      name: formData.get('family-name'),
    });
    const family = await familyUpdate({ familyOwnerId: user.userId, name });

    return json(
      {
        family,
        errors: null,
      },
      {
        revalidate: [getUserFamily.key],
      },
    );
  } catch (error) {
    if (error instanceof ValiError) {
      return json(
        { failed: true, errors: await translateErrorTokens(error) },
        { status: 500, revalidate: [] },
      );
    }
    console.error(error);
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
}
