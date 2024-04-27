'use server';

import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';

import { useDb } from '~/server/db';
import {
  petTable,
  type DatabasePet,
  type DatabaseUser,
} from '~/server/db/schema';
import { type ErrorKeys } from '~/server/utils';

const UpdatePetSchema = v.object({
  name: v.optional(
    v.string('createPet.name.required' satisfies ErrorKeys, [
      v.toTrimmed(),
      v.minLength(1, 'createPet.name.required' satisfies ErrorKeys),
      v.maxLength(200, 'createPet.name.length' satisfies ErrorKeys),
    ]),
  ),
  type: v.optional(
    v.picklist(
      ['dog', 'cat', 'bird', 'rabbit', 'rodent', 'horse'],
      'createPet.type' satisfies ErrorKeys,
    ),
  ),
  gender: v.optional(
    v.picklist(['male', 'female'], 'createPet.gender' satisfies ErrorKeys),
  ),
  breed: v.optional(
    v.string([
      v.toTrimmed(),
      v.minLength(2, 'createPet.breed' satisfies ErrorKeys),
      v.maxLength(200, 'createPet.breed' satisfies ErrorKeys),
    ]),
  ),
  color: v.optional(
    v.string([
      v.toTrimmed(),
      v.minLength(2, 'createPet.color' satisfies ErrorKeys),
      v.maxLength(200, 'createPet.color' satisfies ErrorKeys),
    ]),
  ),
  dateOfBirth: v.optional(
    v.date([
      v.minValue(new Date(2000, 0, 1), 'birthdate.range' satisfies ErrorKeys),
      v.maxValue(new Date(), 'birthdate.range' satisfies ErrorKeys),
    ]),
  ),
  weight: v.optional(v.number([v.minValue(0.1), v.maxValue(999)])),
});

type UpdatePetInput = v.Input<typeof UpdatePetSchema>;

export async function petUpdate(
  petData: {
    [K in keyof UpdatePetInput]?: NonNullable<unknown>;
  },
  petId: DatabasePet['id'],
  userId: DatabaseUser['id'],
) {
  const { name, type, gender, breed, color, dateOfBirth, weight } = v.parse(
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

  return pet;
}
