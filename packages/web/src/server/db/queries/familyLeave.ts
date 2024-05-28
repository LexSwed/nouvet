import { and, eq, notExists } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  familyWaitListTable,
  type DatabaseUser,
} from '~/server/db/schema';
import { NotAllowedToPerformFamilyAction } from '~/server/errors';

export async function familyLeave(userId: DatabaseUser['id']) {
  const db = useDb();

  const family = await db
    .delete(familyUserTable)
    .where(
      and(
        notExists(
          db
            .select({
              id: familyTable.id,
            })
            .from(familyTable)
            .where(eq(familyTable.ownerId, userId)),
        ),
        eq(familyUserTable.userId, userId),
      ),
    )
    .returning({ familyId: familyWaitListTable.familyId })
    .get();

  if (!family?.familyId) {
    throw new NotAllowedToPerformFamilyAction('The action is now allowed');
  }
  return family;
}
