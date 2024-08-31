"use server";

import { and, eq, inArray, or } from "drizzle-orm";

import { useDb } from "~/server/db";
import { type PetID, type UserID, familyUserTable, petTable, userTable } from "~/server/db/schema";

export async function userPet(userId: UserID, petId: PetID) {
	const db = useDb();
	const familyUsers = db
		.select({ userId: familyUserTable.userId })
		.from(familyUserTable)
		.where(
			eq(
				familyUserTable.familyId,
				db
					.select({ familyId: familyUserTable.familyId })
					.from(familyUserTable)
					.where(eq(familyUserTable.userId, userId)),
			),
		);

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
			owner: {
				id: userTable.id,
				name: userTable.name,
				avatarUrl: userTable.avatarUrl,
			},
		})
		.from(petTable)
		.where(
			and(
				eq(petTable.id, petId),
				or(
					inArray(petTable.ownerId, familyUsers),
					// when there's no family
					eq(petTable.ownerId, userId),
				),
			),
		)
		.leftJoin(userTable, eq(userTable.id, petTable.ownerId))
		.get();
}
