'use server';

import { and, eq } from 'drizzle-orm';
import {
  date,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  parse,
  picklist,
  string,
  toTrimmed,
  ValiError,
  type Input,
  type Output,
} from 'valibot';

import { type UserSession } from '~/server/auth/user-session';
import { useDb } from '~/server/db';
import { petTable, type DatabasePet } from '~/server/db/schema';
import { translateErrorTokens, type ErrorKeys } from '~/server/utils';

const UpdatePetSchema = object({
  name: optional(
    string('createPet.name.required' satisfies ErrorKeys, [
      toTrimmed(),
      minLength(1, 'createPet.name.required' satisfies ErrorKeys),
      maxLength(200, 'createPet.name.length' satisfies ErrorKeys),
    ]),
  ),
  type: optional(
    picklist(
      ['dog', 'cat', 'bird', 'rabbit', 'rodent', 'horse'],
      'createPet.type' satisfies ErrorKeys,
    ),
  ),
  gender: optional(
    picklist(['male', 'female'], 'createPet.gender' satisfies ErrorKeys),
  ),
  breed: optional(
    string([
      toTrimmed(),
      minLength(2, 'createPet.breed' satisfies ErrorKeys),
      maxLength(200, 'createPet.breed' satisfies ErrorKeys),
    ]),
  ),
  color: optional(
    string([
      toTrimmed(),
      minLength(2, 'createPet.color' satisfies ErrorKeys),
      maxLength(200, 'createPet.color' satisfies ErrorKeys),
    ]),
  ),
  dateOfBirth: optional(
    date([
      minValue(new Date(1980, 0, 1), 'birthdate.range' satisfies ErrorKeys),
      maxValue(new Date(), 'birthdate.range' satisfies ErrorKeys),
    ]),
  ),
  weight: optional(number([minValue(0.1), maxValue(999)])),
});

type UpdatePetInput = Input<typeof UpdatePetSchema>;
type UpdatePetOutput = Output<typeof UpdatePetSchema>;

export async function petUpdate(
  petData: {
    [K in keyof UpdatePetInput]?: NonNullable<unknown>;
  },
  petId: DatabasePet['id'],
  userId: UserSession['userId'],
) {
  try {
    const { name, type, gender, breed, color, dateOfBirth } = parse(
      UpdatePetSchema,
      petData,
    );
    const db = useDb();
    const pet = await db
      .update(petTable)
      .set({
        name,
        type,
        gender,
        breed,
        color,
        dateOfBirth: dateOfBirth?.toUTCString(),
      })
      .where(and(eq(petTable.id, petId), eq(petTable.ownerId, userId)))
      .returning({
        id: petTable.id,
        name: petTable.name,
        type: petTable.type,
        gender: petTable.gender,
        breed: petTable.breed,
        color: petTable.color,
        dateOfBirth: petTable.dateOfBirth,
      })
      .get();

    return { errors: null, pet };
  } catch (error) {
    if (error instanceof ValiError) {
      const errors = await translateErrorTokens<UpdatePetOutput>(error);
      return {
        errors,
      };
    }
    throw error;
  }
}
