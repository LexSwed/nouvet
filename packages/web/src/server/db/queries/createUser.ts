import { createId } from '@paralleldrive/cuid2';
import {
  maxLength,
  minLength,
  object,
  parse,
  picklist,
  string,
  ValiError,
  type Output,
} from 'valibot';

import { useDb } from '~/server/db';
import { authAccount, userProfileTable, userTable } from '~/server/db/schema';

const createUserSchema = object({
  provider: picklist(['facebook']),
  name: string('Name cannot be empty', [minLength(2), maxLength(200)]),
  accountProviderId: string('Auth Provider ID cannot be empty', [
    minLength(1),
    maxLength(200),
  ]),
  locale: string(),
  measurementSystem: picklist(['imperial', 'metrical']),
});

export const createUser = async (newUser: Output<typeof createUserSchema>) => {
  try {
    const userId = createId();
    const userInfo = parse(createUserSchema, newUser);
    const db = useDb();
    const user = await db.transaction(async (tx) => {
      const user = await tx
        .insert(userTable)
        .values({ id: userId })
        .returning({ id: userTable.id })
        .get();
      await tx.insert(authAccount).values({
        userId: user.id,
        provider: userInfo.provider,
        providerUserId: userInfo.accountProviderId,
      });
      await tx.insert(userProfileTable).values({
        userId: user.id,
        name: userInfo.name,
        measurementSystem: userInfo.measurementSystem,
        locale: userInfo.locale,
      });
      return user;
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
