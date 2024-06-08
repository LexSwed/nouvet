import { faker } from '@faker-js/faker';

import type { useDb } from '../../web/src/server/db';
import * as schema from '../../web/src/server/db/schema';

export async function seed(db: ReturnType<typeof useDb>) {
  const users = await db
    .insert(schema.userTable)
    .values(
      Array.from({ length: 5 }).map((_, i) => ({
        id: i + 1,
        name: faker.person.fullName(),
        measurementSystem: faker.helpers.arrayElement([
          'imperial',
          'metrical',
        ]) as 'imperial' | 'metrical',
        locale: 'en-GB' as const,
      })),
    )
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
    name: 'Juno',
    type: 'cat',
    gender: 'female',
    ownerId: users[2].id,
  });
  // User 5 gets a dog
  await db.insert(schema.petTable).values({
    name: 'Luna',
    type: 'dog',
    gender: 'female',
    ownerId: users[4].id,
  });
}
