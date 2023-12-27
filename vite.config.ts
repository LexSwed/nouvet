import { defineConfig } from '@solidjs/start/config';
import { type UserConfig } from 'vite';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';

const config = {
  assetsInclude: ['/sb-preview/**'],
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
  start: {
    ssr: 'async',
    middleware: './src/middleware.ts',
  },
  ...config,
});
