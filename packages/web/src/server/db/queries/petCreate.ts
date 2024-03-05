'use server';

import {
  isoDate,
  maxLength,
  minLength,
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
import { petTable, type DatabaseUser } from '~/server/db/schema';
import { translateErrorTokens, type ErrorKeys } from '~/server/utils';

const CreatePetSchema = object({
  name: string('createPet.name.required' satisfies ErrorKeys, [
    toTrimmed(),
    minLength(1, 'createPet.name.required' satisfies ErrorKeys),
    maxLength(200, 'createPet.name.length' satisfies ErrorKeys),
  ]),
  type: picklist(
    ['dog', 'cat', 'bird', 'rabbit', 'rodent', 'horse'],
    'createPet.type' satisfies ErrorKeys,
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
  dateOfBirth: optional(string([isoDate()])),
});

type CreatePetInput = Input<typeof CreatePetSchema>;
type CreatePetOutput = Output<typeof CreatePetSchema>;

export async function petCreate(
  input: {
    [K in keyof CreatePetInput]?: unknown;
  },
  userId: DatabaseUser['id'],
) {
  try {
    const petInfo = parse(CreatePetSchema, input);
    const db = useDb();
    const pet = await db
      .insert(petTable)
      .values({ ...petInfo, ownerId: userId })
      .returning({ id: petTable.id, name: petTable.name, type: petTable.type });
    return { errors: null, pet };
  } catch (error) {
    if (error instanceof ValiError) {
      return {
        errors: await translateErrorTokens<CreatePetOutput>(error),
      };
    }
    throw error;
  }
}
