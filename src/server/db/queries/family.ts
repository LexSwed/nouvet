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
import { useDb } from '..';
import {
  authAccount,
  userProfileTable,
  userTable,
  type SupportedAuthProvider,
  familyTable,
  petTable,
  type DatabaseUser,
} from '../schema';

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
    console.error(error);
    if (error instanceof ValiError) {
      throw error;
    }
    throw error;
  }
};

export const getDbUserFamilyAndPets = async (userId: DatabaseUser['id']) => {
  const db = useDb();
  return await db
    .select({
      userId: userTable.id,
      familyId: userTable.familyId,
      familyName: familyTable.name,
      petId: petTable.id,
      petName: petTable.name,
    })
    .from(userTable)
    .leftJoin(familyTable, eq(userTable.familyId, familyTable.id))
    .leftJoin(petTable, eq(petTable.familyId, familyTable.id))
    .where(eq(userTable.id, userId))
    .all();
};
