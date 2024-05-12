'use server';

import { json, redirect } from '@solidjs/router';
import { object, parse, string, toTrimmed, ValiError } from 'valibot';

import { getUserFamily } from '~/server/api/user';
import { getRequestUser } from '~/server/auth/request-user';
import { familyCancelJoin } from '~/server/db/queries/familyCancelJoin';
import { familyDelete } from '~/server/db/queries/familyDelete';
import { familyMembers } from '~/server/db/queries/familyMembers';
import { familyUpdate } from '~/server/db/queries/familyUpdate';
import { translateErrorTokens, type ErrorKeys } from '~/server/utils';

export async function getFamilyMembersServer() {
  try {
    const user = await getRequestUser();
    const members = await familyMembers(user.userId);

    return members;
  } catch (error) {
    console.error(error);

    throw error;
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

export async function cancelFamilyJoinServer() {
  try {
    const user = await getRequestUser();
    await familyCancelJoin(user.userId);
    return redirect('/app', { revalidate: [getUserFamily.key] });
  } catch (error) {
    console.error(error);
    return json(
      { error: 'Something went wrong' },
      { status: 500, revalidate: [] },
    );
  }
}
