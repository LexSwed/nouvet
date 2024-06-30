import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./tests",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "html",
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://localhost:3000",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	/* Run local dev server before starting the tests. */
	webServer: {
		command: "npm run start:web",
		url: "http://localhost:3000",
		ignoreHTTPSErrors: true,
		stdout: process.env.CI ? "ignore" : "pipe",
		stderr: "pipe",
		reuseExistingServer: !process.env.CI,
	},

	projects: [
		{
			name: "database setup",
			testDir: "setup",
			testMatch: "database.setup.ts",
		},
		{
			name: "Desktop Chrome",
			use: {
				...devices["Desktop Chrome"],
				locale: "en-GB",
			},
			dependencies: ["database setup"],
		},
		{
			name: "Mobile Chrome",
			use: {
				...devices["Pixel 5"],
				locale: "en-GB",
			},
			dependencies: ["database setup"],
		},
	],
});
