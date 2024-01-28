import { defineConfig } from '@solidjs/start/config';
import { searchForWorkspaceRoot, type UserConfig } from 'vite';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';

const config = {
  css: {
    postcss: '../config/postcss.config.cjs',
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), '../config/global.css'],
    },
  },
  plugins: [
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
} satisfies UserConfig;

export default defineConfig({
  ...config,
  start: {
    ssr: true,
    middleware: './src/middleware.ts',
    server: {
      preset: 'cloudflare_pages',
      rollupConfig: {
        external: ['node:async_hooks'],
      },
      experimental: {
        asyncContext: true,
      },
    },
  },
});
