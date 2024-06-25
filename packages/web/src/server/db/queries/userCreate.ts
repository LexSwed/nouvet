'use server';

import * as v from 'valibot';

import { useDb } from '~/server/db';
import { authAccount, userTable } from '~/server/db/schema';

const CreateUserSchema = v.object({
  provider: v.picklist(['facebook']),
  name: v.pipe(
    v.string('Name cannot be empty'),
    v.minLength(1),
    v.maxLength(200),
  ),
  accountProviderId: v.pipe(
    v.string('Auth Provider ID cannot be empty'),
    v.minLength(1),
    v.maxLength(200),
  ),
  locale: v.string(),
  measurementSystem: v.picklist(['imperial', 'metrical']),
});

type CreateUserInput = v.InferInput<typeof CreateUserSchema>;

export const userCreate = async (newUser: {
  [K in keyof CreateUserInput]?: unknown;
}) => {
  try {
    const userInfo = v.parse(CreateUserSchema, newUser);
    const db = useDb();
    const user = db
      .insert(userTable)
      .values({
        name: userInfo.name,
        measurementSystem: userInfo.measurementSystem,
        locale: userInfo.locale,
      })
      .returning({ id: userTable.id })
      .get();

    await db.insert(authAccount).values({
      userId: user.id,
      provider: userInfo.provider,
      providerUserId: userInfo.accountProviderId,
    });

    return user;
  } catch (error) {
    console.error(error);
    if (v.isValiError(error)) {
      throw error;
    }
    throw error;
  }
};
