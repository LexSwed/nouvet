'use server';

import { and, eq } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  authAccount,
  userTable,
  type SupportedAuthProvider,
} from '~/server/db/schema';

export const getUserByAuthProviderId = async (
  provider: SupportedAuthProvider,
  providerUserId: string,
) => {
  const user = await useDb()
    .select({
      id: authAccount.userId,
      locale: userTable.locale,
      measurementSystem: userTable.measurementSystem,
    })
    .from(authAccount)
    .leftJoin(userTable, eq(authAccount.userId, userTable.id))
    .where(
      and(
        eq(authAccount.provider, provider),
        eq(authAccount.providerUserId, providerUserId),
      ),
    )
    .get();

  return user;
};
