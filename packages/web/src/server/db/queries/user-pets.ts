"use server";

import { desc, eq, inArray, or } from "drizzle-orm";

import { useDb } from "~/server/db";
import { familyUserTable, petTable, userTable } from "~/server/db/schema";
import type { UserID } from "~/server/types";

export async function userPets(userId: UserID) {
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
			or(
				inArray(petTable.ownerId, familyUsers),
				// when there's no family
				eq(petTable.ownerId, userId),
			),
		)
		.leftJoin(userTable, eq(userTable.id, petTable.ownerId))
		.orderBy(desc(eq(petTable.ownerId, userId)), petTable.ownerId, petTable.createdAt)
		.all();
}
