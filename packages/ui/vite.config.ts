import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import viteSvgSpriteWrapper from "vite-svg-sprite-wrapper";

export default defineConfig({
	css: {
		postcss: "../config/postcss.config.cjs",
	},
	plugins: [
		solid(),
		viteSvgSpriteWrapper({
			icons: "../config/icons/source/*.svg",
			outputDir: "../config/icons",
			generateType: true,
			typeOutputDir: "./src/icon",
			sprite: {
				shape: {
					dimension: {
						attributes: true, // Width and height attributes on embedded shapes
					},
				},
			},
		}),
	],
});
