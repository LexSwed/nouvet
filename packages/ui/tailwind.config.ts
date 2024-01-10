import preset from '@nou/config/tailwind';

import { type Config } from 'tailwindcss';

const config = {
  content: ['./.storybook/*.{ts,tsx,css}', './src/**/*.{ts,tsx,css}'],
  presets: [preset],
} satisfies Config;

export default config;
