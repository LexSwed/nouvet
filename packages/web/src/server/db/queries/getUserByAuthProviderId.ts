import { and, eq } from 'drizzle-orm';
import { useDb } from '..';
import {
  type SupportedAuthProvider,
  authAccount,
  userProfileTable,
} from '../schema';

export const getUserByAuthProviderId = async (
  provider: SupportedAuthProvider,
  providerUserId: string,
) => {
  const user = await useDb()
    .select({
      id: authAccount.userId,
      locale: userProfileTable.locale,
      measurementSystem: userProfileTable.measurementSystem,
    })
    .from(authAccount)
    .leftJoin(userProfileTable, eq(authAccount.userId, userProfileTable.userId))
    .where(
      and(
        eq(authAccount.provider, provider),
        eq(authAccount.providerUserId, providerUserId),
      ),
    )
    .get();

  return user;
};
