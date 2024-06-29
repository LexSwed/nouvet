export const getAuthFilePath = (userId: number) =>
	`playwright/.auth/user-${userId}${
		/** Set in the database setup, to ensure auth is accessed from the same-seeded DB
		 * (it used to be re-seeded between workers to ensure isolation, not any more, for velocity)
		 */
		process.env.TEST_RUN_ID ? `-${process.env.TEST_RUN_ID}` : ""
	}.json`;
