'use server';
import { eq } from 'drizzle-orm';
import {
  parse,
  type Output,
  object,
  string,
  minLength,
  maxLength,
  ValiError,
} from 'valibot';
import { useDb } from '../../db/db';
import { userTable } from '../../db/schema';

export const getUserByFacebookId = async (facebookId: string) => {
  const user = await useDb()
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.facebookId, facebookId))
    .get();

  return user;
};

const insertUserSchema = object({
  name: string('Name cannot be empty', [minLength(1), maxLength(200)]),
  facebookId: string('Auth Provider ID cannot be empty', [
    minLength(1),
    maxLength(200),
  ]),
});

export const createUser = async (user: Output<typeof insertUserSchema>) => {
  try {
    const userInfo = parse(insertUserSchema, user);
    const db = useDb();
    return await db
      .insert(userTable)
      .values(userInfo)
      .returning({ id: userTable.id, name: userTable.name })
      .get();
  } catch (error) {
    if (error instanceof ValiError) {
      throw error;
    }
    console.error(error);
    throw error;
  }
};
