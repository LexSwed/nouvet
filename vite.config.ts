import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import viteSvgSpriteWrapper from "vite-svg-sprite-wrapper";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		viteSvgSpriteWrapper({
			icons: "./assets/icons/*.svg",
			outputDir: "./public/assets",
			generateType: true,
			typeOutputDir: "./app/lib/ui/icon",
			sprite: {
				shape: {
					dimension: {
						attributes: true, // Width and height attributes on embedded shapes
					},
				},
			},
		}),
		remix({
			future: {
				v3_relativeSplatPath: true,
			},
		}),
		tsconfigPaths(),
	],
	ssr: {
		noExternal: ["remix-i18next"],
	},
});
