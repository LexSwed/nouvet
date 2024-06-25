'use server';

import { eq } from 'drizzle-orm';
import * as v from 'valibot';

import { useDb } from '~/server/db';
import { userTable, type DatabaseUser } from '~/server/db/schema';
import { acceptedLocaleLanguageTag } from '~/server/i18n/shared';
import type { ErrorKeys } from '~/server/utils';

const UpdateUserSchema = v.object({
  name: v.pipe(
    v.string('user.name-min' satisfies ErrorKeys),
    v.minLength(1, 'user.name-min' satisfies ErrorKeys),
    v.maxLength(200, 'user.name-max' satisfies ErrorKeys),
  ),
  locale: v.picklist(
    acceptedLocaleLanguageTag,
    'user.locale' satisfies ErrorKeys,
  ),
  measurementSystem: v.picklist(
    ['imperial', 'metrical'],
    'user.measurementsSystem' satisfies ErrorKeys,
  ),
});

export type UpdateUserSchema = typeof UpdateUserSchema;

type UpdateUserInput = v.InferInput<UpdateUserSchema>;

export const userUpdate = async (
  userId: DatabaseUser['id'],
  userUpdate: {
    [K in keyof UpdateUserInput]?: unknown;
  },
) => {
  const userInfo = v.parse(UpdateUserSchema, userUpdate);
  const db = useDb();
  const user = await db
    .update(userTable)
    .set({
      name: userInfo.name,
      measurementSystem: userInfo.measurementSystem,
      locale: userInfo.locale,
    })
    .where(eq(userTable.id, userId))
    .returning({
      id: userTable.id,
      locale: userTable.locale,
      measurementSystem: userTable.measurementSystem,
    })
    .get();

  return user;
};
