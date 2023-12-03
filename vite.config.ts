// @ts-expect-error not typed
import { defineConfig } from '@solidjs/start/config';
import devtools from 'solid-devtools/vite';
import { type UserConfig } from 'vite';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';

const config = {
  plugins: [
    devtools({
      /* features options - all disabled by default */
      autoname: true, // e.g. enable autoname
    }),
    createSvgSpritePlugin({
      include: '**/src/assets/icons/*.svg',
      symbolId: 'icon-[name]-[hash]',
    }),
  ],
} satisfies UserConfig;

export default defineConfig(config);
