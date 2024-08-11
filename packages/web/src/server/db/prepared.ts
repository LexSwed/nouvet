import { eq, sql } from "drizzle-orm";
import { useDb } from ".";
import { type UserID, familyUserTable } from "./schema";

const db = useDb();

const userIdPlaceholder = sql.placeholder("userId");

const userFamily = db
	.select({ familyId: familyUserTable.familyId })
	.from(familyUserTable)
	.where(eq(familyUserTable.userId, userIdPlaceholder))
	.prepare();

const familyUsers = db
	.select({ userId: familyUserTable.userId })
	.from(familyUserTable)
	.where(eq(familyUserTable.familyId, userFamily.get({ userId: userIdPlaceholder })!.familyId))
	.prepare();

export function preparedFamilyUsers(userId: UserID) {
	return familyUsers.all({ userId });
}

export function preparedUserFamily(userId: UserID) {
	return familyUsers.all({ userId });
}
