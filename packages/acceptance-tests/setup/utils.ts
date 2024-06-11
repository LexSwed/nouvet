export const getAuthFilePath = (userId: number) =>
  `playwright/.auth/user-${userId}-${
    /** Set in the database setup, to ensure auth is accessed from the same-seeded DB */
    process.env.TEST_RUN_ID
  }.json`;
