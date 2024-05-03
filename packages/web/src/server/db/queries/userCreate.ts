'use server';

import {
  maxLength,
  minLength,
  object,
  parse,
  picklist,
  string,
  ValiError,
  type Input,
} from 'valibot';

import { useDb } from '~/server/db';
import { authAccount, userTable } from '~/server/db/schema';

const CreateUserSchema = object({
  provider: picklist(['facebook']),
  name: string('Name cannot be empty', [minLength(2), maxLength(200)]),
  accountProviderId: string('Auth Provider ID cannot be empty', [
    minLength(1),
    maxLength(200),
  ]),
  locale: string(),
  measurementSystem: picklist(['imperial', 'metrical']),
});

type CreateUserInput = Input<typeof CreateUserSchema>;

export const userCreate = async (newUser: {
  [K in keyof CreateUserInput]?: unknown;
}) => {
  try {
    const userInfo = parse(CreateUserSchema, newUser);
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
    if (error instanceof ValiError) {
      throw error;
    }
    throw error;
  }
};
