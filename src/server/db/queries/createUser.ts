import { createId } from '@paralleldrive/cuid2';
import {
  type Output,
  ValiError,
  maxLength,
  minLength,
  object,
  parse,
  picklist,
  string,
} from 'valibot';

import { useDb } from '..';
import { userTable, authAccount, userProfileTable } from '../schema';

const createUserSchema = object({
  provider: picklist(['facebook']),
  name: string('Name cannot be empty', [minLength(2), maxLength(200)]),
  accountProviderId: string('Auth Provider ID cannot be empty', [
    minLength(1),
    maxLength(200),
  ]),
});

export const createUser = async (newUser: Output<typeof createUserSchema>) => {
  try {
    const userId = createId();
    const userInfo = parse(createUserSchema, newUser);
    const db = useDb();
    return await db.transaction(async (tx) => {
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
      await tx
        .insert(userProfileTable)
        .values({ userId: user.id, name: userInfo.name });
      return user;
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ValiError) {
      throw error;
    }
    throw error;
  }
};
