import { defineConfig } from '@solidjs/start/config';
import { searchForWorkspaceRoot } from 'vite';
import { imagetools } from 'vite-imagetools';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  ssr: true,
  middleware: './src/middleware.ts',
  devOverlay: false,
  server: {
    preset: 'cloudflare_pages',
    rollupConfig: {
      external: ['node:async_hooks'],
    },
  },
  vite: {
    css: {
      postcss: '../config/postcss.config.cjs',
    },
    server: {
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), '../config/global.css'],
      },
    },
    plugins: [
      // @ts-expect-error vite types mismatch?
      tsconfigPaths(),
      // @ts-expect-error vite types mismatch?
      imagetools(),
      // @ts-expect-error vite types mismatch?
      viteSvgSpriteWrapper({
        icons: '../config/icons/source/*.svg',
        outputDir: '../config/icons',
        generateType: true,
        typeOutputDir: '../ui/src/icon',
        sprite: {
          shape: {
            dimension: {
              attributes: true, // Width and height attributes on embedded shapes
            },
          },
        },
      }),
    ],
  },
});
