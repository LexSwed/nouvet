"use server";

import { eq } from "drizzle-orm";

import { useDb } from "~/server/db";
import { petTable, userTable } from "~/server/db/schema";
import type { PetID, UserID } from "~/server/types";
import { checkCanPerformPetAction } from "./can-perform-pet-action";

export async function userPet(userId: UserID, petId: PetID) {
	const db = useDb();

	checkCanPerformPetAction(petId, userId);

	return db
		.select({
			id: petTable.id,
			name: petTable.name,
			pictureUrl: petTable.pictureUrl,
			species: petTable.species,
			breed: petTable.breed,
			gender: petTable.gender,
			dateOfBirth: petTable.dateOfBirth,
			color: petTable.color,
			weight: petTable.weight,
			height: petTable.height,
			owner: {
				id: userTable.id,
				name: userTable.name,
				avatarUrl: userTable.avatarUrl,
			},
		})
		.from(petTable)
		.where(eq(petTable.id, petId))
		.leftJoin(userTable, eq(userTable.id, petTable.ownerId))
		.get();
}
