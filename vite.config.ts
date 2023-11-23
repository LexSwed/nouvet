import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		remix({
			future: {},
			// ignore all files in routes folder to prevent
			// default remix convention from picking up routes
			ignoredRouteFiles: ["**/*"],
			routes: async (defineRoutes) => {
				return flatRoutes("routes", defineRoutes, {
					ignoredRouteFiles: [
						".*",
						"**/*.css",
						"**/*.test.{js,jsx,ts,tsx}",
						"**/__*.*",
					],
				});
			},
		}),
		tsconfigPaths(),
	],
	ssr: {
		noExternal: ["remix-i18next"],
	},
});
