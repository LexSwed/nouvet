// @ts-expect-error not typed
import { defineConfig } from '@solidjs/start/config';
import { type UserConfig } from 'vite';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';

const config = {
  plugins: [
    createSvgSpritePlugin({
      include: '**/src/assets/icons/*.svg',
      symbolId: 'icon-[name]-[hash]',
    }),
  ],
} satisfies UserConfig;

export default defineConfig(config);
