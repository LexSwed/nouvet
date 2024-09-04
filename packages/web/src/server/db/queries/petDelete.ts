import { and, eq } from "drizzle-orm";
import { useDb } from "~/server/db";
import { PetActionNotAllowed } from "~/server/errors";
import type { PetID, UserID } from "~/server/types";
import { petTable } from "../schema";

export async function petDelete(petId: PetID, userId: UserID) {
	const db = useDb();
	const pet = await db
		.delete(petTable)
		.where(and(eq(petTable.id, petId), eq(petTable.ownerId, userId)))
		.returning({ petId: petTable.id })
		.get();

	if (!pet) {
		throw new PetActionNotAllowed();
	}

	return petId;
}
