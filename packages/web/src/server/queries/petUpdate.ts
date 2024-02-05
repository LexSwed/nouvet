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

import { useDb } from '~/server/db';
import {
  petTable,
  type DatabasePet,
  type DatabaseUser,
} from '~/server/db/schema';
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
      minValue(new Date(2000, 0, 1), 'birthdate.range' satisfies ErrorKeys),
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
  userId: DatabaseUser['id'],
) {
  try {
    const { name, type, gender, breed, color, dateOfBirth, weight } = parse(
      UpdatePetSchema,
      petData,
    );
    const db = useDb();
    const pet = await db
      .update(petTable)
      .set({
        weight,
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
        weight: petTable.weight,
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
