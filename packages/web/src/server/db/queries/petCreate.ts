'use server';

import * as v from 'valibot';

import { useDb } from '~/server/db';
import { petTable, type UserID } from '~/server/db/schema';
import { type ErrorKeys } from '~/server/utils';

const CreatePetSchema = v.object({
  name: v.config(
    v.pipe(
      v.string('createPet.name.required'),
      v.trim(),
      v.minLength(1, 'createPet.name.required'),
      v.maxLength(200, 'createPet.name.length'),
    ),
    { message: 'createPet.name.required' satisfies ErrorKeys },
  ),
  species: v.picklist(
    ['dog', 'cat', 'bird', 'rabbit', 'rodent', 'horse'],
    'createPet.species' satisfies ErrorKeys,
  ),
  gender: v.nullish(
    v.picklist(['male', 'female'], 'createPet.gender' satisfies ErrorKeys),
  ),
  breed: v.nullish(
    v.config(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(200)), {
      message: 'createPet.breed' satisfies ErrorKeys,
    }),
  ),
  color: v.nullish(
    v.config(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(200)), {
      message: 'createPet.color' satisfies ErrorKeys,
    }),
  ),
  dateOfBirth: v.nullish(v.pipe(v.string(), v.isoDate())),
});

type CreatePetInput = v.InferInput<typeof CreatePetSchema>;

export async function petCreate(
  input: {
    [K in keyof CreatePetInput]?: unknown;
  },
  userId: UserID,
) {
  const petInfo = v.parse(CreatePetSchema, input);
  const db = useDb();
  const pet = await db
    .insert(petTable)
    .values({ ...petInfo, ownerId: userId })
    .returning({
      id: petTable.id,
      name: petTable.name,
      species: petTable.species,
    })
    .get();
  return pet;
}
