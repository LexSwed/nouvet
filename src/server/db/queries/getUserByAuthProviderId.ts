import { and, eq } from 'drizzle-orm';
import { useDb } from '..';
import { type SupportedAuthProvider, authAccount } from '../schema';

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
