import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import {
  parse,
  type Output,
  object,
  string,
  minLength,
  maxLength,
  ValiError,
  picklist,
} from 'valibot';
import { useDb } from '../db';
import {
  authAccount,
  userProfileTable,
  userTable,
  type SupportedAuthProvider,
} from '../db/schema';

export const getUserByAuthProviderId = async (
  provider: SupportedAuthProvider,
  providerUserId: string,
) => {
  const user = await useDb()
    .select({ id: authAccount.userId })
    .from(authAccount)
    .where(
      and(
        eq(authAccount.provider, provider),
        eq(authAccount.providerUserId, providerUserId),
      ),
    )
    .get();

  return user;
};

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
    if (error instanceof ValiError) {
      throw error;
    }
    console.error(error);
    throw error;
  }
};
