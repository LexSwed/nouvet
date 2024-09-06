import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { imagetools } from "vite-imagetools";
import viteSvgSpriteWrapper from "vite-svg-sprite-wrapper";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	ssr: true,
	middleware: "./src/middleware.ts",
	solid: {
		hot: false,
	},
	server: {
		prerender: {
			// TODO: needs per-language generation
			// routes: ['/', '/about', '/privacy'],
		},
		// preset: 'cloudflare_pages',
		// rollupConfig: {
		//   external: ['node:async_hooks'],
		// },
	},
	vite: {
		build: {
			target: "esnext",
		},
		define: {
			"process.env.VITE_ACCEPTANCE_TESTING": JSON.stringify(process.env.VITE_ACCEPTANCE_TESTING),
		},
		plugins: [
			tailwindcss(),
			tsconfigPaths(),
			imagetools(),
			viteSvgSpriteWrapper({
				icons: "../config/icons/source/*.svg",
				outputDir: "../config/icons",
				generateType: true,
				typeOutputDir: "../ui/src/icon",
				sprite: {
					shape: {
						dimension: {
							// Width and height attributes on embedded shapes
							attributes: true,
						},
					},
				},
			}),
		],
	},
});
