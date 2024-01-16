import {
  isoDate,
  maxLength,
  minLength,
  object,
  optional,
  parse,
  picklist,
  string,
  ValiError,
  type Output,
} from 'valibot';

import type { UserSession } from '~/server/auth/user-session';
import { useDb } from '~/server/db';
import { flatten } from '~/server/utils';
import { petTable } from '../schema';

const CreatePetSchema = object({
  name: string([minLength(1), maxLength(200)]),
  type: string([minLength(2), maxLength(200)]),
  gender: optional(picklist(['male', 'female'])),
  breed: optional(string([minLength(2), maxLength(200)])),
  color: optional(string([minLength(2), maxLength(200)])),
  dateOfBirth: optional(string([isoDate()])),
});

export async function createPet(
  petInput: Output<typeof CreatePetSchema>,
  userId: UserSession['userId'],
) {
  try {
    const petInfo = parse(CreatePetSchema, petInput);
    const db = useDb();
    const pet = await db
      .insert(petTable)
      .values({ ...petInfo, ownerId: userId })
      .returning({ id: petTable.id, name: petTable.name, type: petTable.type });
    return { errors: null, pet };
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: flatten(error),
      };
    }
    throw error;
  }
}
