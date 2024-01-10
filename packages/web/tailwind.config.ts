import preset from '@nou/config/tailwind';

import { type Config } from 'tailwindcss';

const config = {
  content: ['./src/**/*.{ts,tsx,css}', '../ui/src/**/*.{ts,tsx,css}'],
  presets: [preset],
} satisfies Config;

export default config;
