'use server';

import * as v from 'valibot';

import { useDb } from '~/server/db';
import { petTable, type DatabaseUser } from '~/server/db/schema';
import { type ErrorKeys } from '~/server/utils';

const CreatePetSchema = v.object({
  name: v.string('createPet.name.required' satisfies ErrorKeys, [
    v.toTrimmed(),
    v.minLength(1, 'createPet.name.required' satisfies ErrorKeys),
    v.maxLength(200, 'createPet.name.length' satisfies ErrorKeys),
  ]),
  type: v.picklist(
    ['dog', 'cat', 'bird', 'rabbit', 'rodent', 'horse'],
    'createPet.type' satisfies ErrorKeys,
  ),
  gender: v.nullish(
    v.picklist(['male', 'female'], 'createPet.gender' satisfies ErrorKeys),
  ),
  breed: v.nullish(
    v.string([
      v.toTrimmed(),
      v.minLength(2, 'createPet.breed' satisfies ErrorKeys),
      v.maxLength(200, 'createPet.breed' satisfies ErrorKeys),
    ]),
  ),
  color: v.nullish(
    v.string([
      v.toTrimmed(),
      v.minLength(2, 'createPet.color' satisfies ErrorKeys),
      v.maxLength(200, 'createPet.color' satisfies ErrorKeys),
    ]),
  ),
  dateOfBirth: v.nullish(v.string([v.isoDate()])),
});

type CreatePetInput = v.Input<typeof CreatePetSchema>;

export async function petCreate(
  input: {
    [K in keyof CreatePetInput]?: unknown;
  },
  userId: DatabaseUser['id'],
) {
  const petInfo = v.parse(CreatePetSchema, input);
  const db = useDb();
  const pet = await db
    .insert(petTable)
    .values({ ...petInfo, ownerId: userId })
    .returning({ id: petTable.id, name: petTable.name, type: petTable.type })
    .get();
  return pet;
}
