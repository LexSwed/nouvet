import type { StorybookConfig } from 'storybook-solidjs-vite';
import { mergeConfig } from 'vite';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';

const config = {
  core: {
    builder: '@storybook/builder-vite', // 👈 The builder enabled here.
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      assetsInclude: ['/sb-preview/**'],
      css: {
        postcss: '../config/postcss.config.cjs',
      },
      plugins: [
        viteSvgSpriteWrapper({
          icons: '../web/src/assets/icons/*.svg',
          outputDir: '../web/public/assets',
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
    });
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
} satisfies StorybookConfig;

export default config;
