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
      icons: './src/assets/icons/*.svg',
      outputDir: './public/assets',
      generateType: true,
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
    ssr: 'async',
    middleware: './src/middleware.ts',
    server: {
      preset: 'cloudflare_pages',
      rollupConfig: {
        external: ['node:async_hooks'],
      },
    },
  },
});
