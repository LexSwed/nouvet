import { type AppConfig } from "@remix-run/dev";
// import { flatRoutes } from "remix-flat-routes";

console.log("READ CONFIG");

export default {
	future: {},
	tailwind: true,
	postcss: true,
	// ignore all files in routes folder to prevent
	// default remix convention from picking up routes
	// ignoredRouteFiles: ["**/*"],
	// routes: async (defineRoutes) => {
	// 	console.log(
	// 		flatRoutes("routes", defineRoutes, {
	// 			ignoredRouteFiles: [
	// 				".*",
	// 				"**/*.css",
	// 				"**/*.test.{js,jsx,ts,tsx}",
	// 				"**/__*.*",
	// 			],
	// 		}),
	// 	);
	// 	return flatRoutes("routes", defineRoutes, {
	// 		ignoredRouteFiles: [
	// 			".*",
	// 			"**/*.css",
	// 			"**/*.test.{js,jsx,ts,tsx}",
	// 			"**/__*.*",
	// 		],
	// 	});
	// },
	watchPaths: ["./tailwind.config.ts"],
} satisfies AppConfig;
