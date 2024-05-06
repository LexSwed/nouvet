'use server';

import { json } from '@solidjs/router';
import { object, parse, string, toTrimmed, ValiError } from 'valibot';

import { getRequestUser } from '~/server/auth/request-user';
import { familyUpdate } from '~/server/db/queries/familyUpdate';

import { familyDelete } from '../db/queries/familyDelete';
import { familyMembers } from '../db/queries/familyMembers';
import { translateErrorTokens, type ErrorKeys } from '../utils';

import { getUserFamily } from './user';

export async function getFamilyMembersServer() {
  try {
    const user = await getRequestUser();

    const members = await familyMembers(user.userId);

    return members;
  } catch (error) {
    console.error(error);
  }
}

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
    } else {
      console.error(error);
    }
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
}

export async function deleteFamilyServer() {
  try {
    const user = await getRequestUser();
    const family = await familyDelete(user.userId);
    return json(
      {
        family,
        errors: null,
      },
      {
        headers: new Headers([['Location', '302']]),
        revalidate: [getUserFamily.key],
      },
    );
  } catch (error) {
    console.error(error);
    return json(
      { failed: true, errors: null },
      { status: 500, revalidate: [] },
    );
  }
}
