import type { useDb } from "../../web/src/server/db";
import * as schema from "../../web/src/server/db/schema";

export async function seed(db: ReturnType<typeof useDb>) {
	await Promise.all([
		db.delete(schema.authAccount),
		db.delete(schema.sessionTable),
		db.delete(schema.familyInviteTable),
		db.delete(schema.familyUserTable),
		db.delete(schema.familyTable),
		db.delete(schema.petTable),
	]);
	await db.delete(schema.userTable);

	const users = await db
		.insert(schema.userTable)
		.values([
			{
				id: "1",
				name: "User One",
				locale: "en-GB",
				measurementSystem: "metrical",
			},
			{
				id: "2",
				name: "User Two",
				locale: "en-GB",
				measurementSystem: "metrical",
			},
			{
				id: "3",
				name: "User Three",
				locale: "en-GB",
				measurementSystem: "metrical",
			},
			{
				id: "4",
				name: "User Four",
				locale: "en-GB",
				measurementSystem: "metrical",
			},
			{
				id: "5",
				name: "User Five",
				locale: "en-GB",
				measurementSystem: "metrical",
			},
		])
		.returning({ id: schema.userTable.id });

	// User 1 gets no family nor the animals

	// User 2 gets a family, no members
	const userTwoFamily = await db
		.insert(schema.familyTable)
		.values({
			ownerId: users[1].id,
		})
		.returning({ familyId: schema.familyTable.id })
		.get();

	await db.insert(schema.familyUserTable).values({
		userId: users[1].id,
		familyId: userTwoFamily.familyId,
	});
	// User 3 gets a family with User 4 and User 5
	const userThreeFamily = await db
		.insert(schema.familyTable)
		.values({
			ownerId: users[2].id,
		})
		.returning({ familyId: schema.familyTable.id })
		.get();

	await db.insert(schema.familyUserTable).values([
		{
			userId: users[2].id,
			familyId: userThreeFamily.familyId,
		},
		{
			userId: users[3].id,
			familyId: userThreeFamily.familyId,
		},
		{
			userId: users[4].id,
			familyId: userThreeFamily.familyId,
		},
	]);

	// User 3 gets a cat
	await db.insert(schema.petTable).values({
		name: "Juno",
		species: "cat",
		gender: "female",
		ownerId: users[2].id,
	});
	// User 5 gets a dog
	await db.insert(schema.petTable).values({
		name: "Luna",
		species: "dog",
		gender: "female",
		ownerId: users[4].id,
	});
}
