import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      screens: {
        xs: '375px',
      },
      colors: {
        'background': '#DBE5EE',
        'on-background': '#072741',
        'primary': '#E46577',
        'on-primary': '#072741',
        'stroke': '#010101',
      },
      fontFamily: {
        sans: ['Lexend Variable', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
