import preset from '@nou/config/tailwind';
import { type Config } from 'tailwindcss';

const config = {
  content: ['./**/*.{ts,tsx}'],
  presets: [preset],
} satisfies Config;

export default config;
