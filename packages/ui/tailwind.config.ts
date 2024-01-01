import { type Config } from 'tailwindcss';
import preset from '@nou/config/tailwind';

const config = {
  content: ['./**/*.{ts,tsx}'],
  presets: [preset],
} satisfies Config;

export default config;