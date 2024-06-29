"use server";

import { and, eq } from "drizzle-orm";

import { type UserID, familyTable } from "../schema";

import { useDb } from "..";

export function familyUpdate(params: { name: string; familyOwnerId: UserID }) {
	const db = useDb();
	return db
		.update(familyTable)
		.set({ name: params.name })
		.where(and(eq(familyTable.ownerId, params.familyOwnerId)))
		.returning({
			id: familyTable.id,
			name: familyTable.name,
		})
		.get();
}
