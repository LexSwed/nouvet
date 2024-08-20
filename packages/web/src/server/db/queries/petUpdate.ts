"use server";

import { and, eq } from "drizzle-orm";
import * as v from "valibot";

import { parseISO } from "date-fns";
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
		v.config(v.pipe(v.string(), v.trim(), v.maxLength(200)), {
			message: "createPet.breed" satisfies ErrorKeys,
		}),
	),
	color: v.optional(
		v.config(v.pipe(v.string(), v.trim(), v.maxLength(200)), {
			message: "createPet.color" satisfies ErrorKeys,
		}),
	),
	dateOfBirth: v.optional(
		v.config(
			v.pipe(
				v.string(),
				v.isoDate(),
				v.transform((str) => {
					const date = parseISO(str);
					const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
					console.log({ utcDate });
					return utcDate;
				}),
				v.minValue(new Date(2000, 0, 1)),
				v.maxValue(new Date()),
			),
			{
				message: "birthdate.range" satisfies ErrorKeys,
			},
		),
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
	console.log({ original: petData.dateOfBirth, dateOfBirth, str: dateOfBirth?.toISOString() });
	const pet = await db
		.update(petTable)
		.set({
			weight,
			name,
			species,
			gender,
			breed: breed === "" ? null : breed,
			color: color === "" ? null : color,
			dateOfBirth: dateOfBirth instanceof Date ? dateOfBirth.toISOString() : dateOfBirth,
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

export const getUpdatePetSchema = () => UpdatePetSchema;
