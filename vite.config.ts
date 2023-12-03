import createSvgSpritePlugin from 'vite-plugin-svg-sprite';
import { type UserConfig } from 'vite';
// @ts-expect-error not typed
import { defineConfig } from '@solidjs/start/config';

const config = {
  plugins: [
    createSvgSpritePlugin({
      symbolId: 'icon-[name]-[hash]',
    }),
  ],
} satisfies UserConfig;

export default defineConfig(config);
