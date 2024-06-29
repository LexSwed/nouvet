"use server";

import { and, eq } from "drizzle-orm";
import * as v from "valibot";

import { useDb } from "~/server/db";
import { type DatabasePet, type UserID, petTable } from "~/server/db/schema";
import type { ErrorKeys } from "~/server/utils";

const UpdatePetSchema = v.object({
	name: v.optional(
		v.pipe(
			v.string("createPet.name.required" satisfies ErrorKeys),
			v.trim(),
			v.minLength(1, "createPet.name.length" satisfies ErrorKeys),
			v.maxLength(200, "createPet.name.length" satisfies ErrorKeys),
		),
	),
	species: v.optional(
		v.picklist(
			["dog", "cat", "bird", "rabbit", "rodent", "horse"],
			"createPet.species" satisfies ErrorKeys,
		),
	),
	gender: v.optional(v.picklist(["male", "female"], "createPet.gender" satisfies ErrorKeys)),
	breed: v.optional(
		v.config(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(200)), {
			message: "createPet.breed" satisfies ErrorKeys,
		}),
	),
	color: v.optional(
		v.config(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(200)), {
			message: "createPet.color" satisfies ErrorKeys,
		}),
	),
	dateOfBirth: v.optional(
		v.config(v.pipe(v.date(), v.minValue(new Date(2000, 0, 1)), v.maxValue(new Date())), {
			message: "birthdate.range" satisfies ErrorKeys,
		}),
	),
	weight: v.optional(
		v.config(v.pipe(v.number(), v.minValue(0.1), v.maxValue(999)), {
			message: "weight.range" satisfies ErrorKeys,
		}),
	),
});

type UpdatePetInput = v.InferInput<typeof UpdatePetSchema>;

export async function petUpdate(
	petData: {
		[K in keyof UpdatePetInput]?: NonNullable<unknown>;
	},
	petId: DatabasePet["id"],
	userId: UserID,
) {
	const { name, species, gender, breed, color, dateOfBirth, weight } = v.parse(
		UpdatePetSchema,
		petData,
	);
	const db = useDb();
	const pet = await db
		.update(petTable)
		.set({
			weight,
			name,
			species,
			gender,
			breed,
			color,
			dateOfBirth: dateOfBirth?.toUTCString(),
		})
		.where(and(eq(petTable.id, petId), eq(petTable.ownerId, userId)))
		.returning({
			id: petTable.id,
			name: petTable.name,
			species: petTable.species,
			gender: petTable.gender,
			breed: petTable.breed,
			color: petTable.color,
			dateOfBirth: petTable.dateOfBirth,
			weight: petTable.weight,
		})
		.get();

	return pet;
}
