import containerQueryPlugin from '@tailwindcss/container-queries';
import { type Config } from 'tailwindcss';
import defaultConfig from 'tailwindcss/defaultConfig.js';
import plugin from 'tailwindcss/plugin.js';
import animatePlugin from 'tailwindcss-animate';

const colors = {
  'primary': 'hsl(var(--nuo-primary) / <alpha-value>)',
  'on-primary': 'hsl(var(--nuo-on-primary) / <alpha-value>)',
  'primary-container': 'hsl(var(--nuo-primary-container) / <alpha-value>)',
  'on-primary-container':
    'hsl(var(--nuo-on-primary-container) / <alpha-value>)',
  'primary-fixed': 'hsl(var(--nuo-primary-fixed) / <alpha-value>)',
  'on-primary-fixed': 'hsl(var(--nuo-on-primary-fixed) / <alpha-value>)',
  'primary-fixed-dim': 'hsl(var(--nuo-primary-fixed-dim) / <alpha-value>)',
  'on-primary-fixed-variant':
    'hsl(var(--nuo-on-primary-fixed-variant) / <alpha-value>)',
  'secondary': 'hsl(var(--nuo-secondary) / <alpha-value>)',
  'on-secondary': 'hsl(var(--nuo-on-secondary) / <alpha-value>)',
  'secondary-container': 'hsl(var(--nuo-secondary-container) / <alpha-value>)',
  'on-secondary-container':
    'hsl(var(--nuo-on-secondary-container) / <alpha-value>)',
  'secondary-fixed': 'hsl(var(--nuo-secondary-fixed) / <alpha-value>)',
  'on-secondary-fixed': 'hsl(var(--nuo-on-secondary-fixed) / <alpha-value>)',
  'secondary-fixed-dim': 'hsl(var(--nuo-secondary-fixed-dim) / <alpha-value>)',
  'on-secondary-fixed-variant':
    'hsl(var(--nuo-on-secondary-fixed-variant) / <alpha-value>)',
  'tertiary': 'hsl(var(--nuo-tertiary) / <alpha-value>)',
  'on-tertiary': 'hsl(var(--nuo-on-tertiary) / <alpha-value>)',
  'tertiary-container': 'hsl(var(--nuo-tertiary-container) / <alpha-value>)',
  'on-tertiary-container':
    'hsl(var(--nuo-on-tertiary-container) / <alpha-value>)',
  'tertiary-fixed': 'hsl(var(--nuo-tertiary-fixed) / <alpha-value>)',
  'on-tertiary-fixed': 'hsl(var(--nuo-on-tertiary-fixed) / <alpha-value>)',
  'tertiary-fixed-dim': 'hsl(var(--nuo-tertiary-fixed-dim) / <alpha-value>)',
  'on-tertiary-fixed-variant':
    'hsl(var(--nuo-on-tertiary-fixed-variant) / <alpha-value>)',
  'error': 'hsl(var(--nuo-error) / <alpha-value>)',
  'on-error': 'hsl(var(--nuo-on-error) / <alpha-value>)',
  'error-container': 'hsl(var(--nuo-error-container) / <alpha-value>)',
  'on-error-container': 'hsl(var(--nuo-on-error-container) / <alpha-value>)',
  'outline': 'hsl(var(--nuo-outline) / <alpha-value>)',
  'background': 'hsl(var(--nuo-background) / <alpha-value>)',
  'on-background': 'hsl(var(--nuo-on-background) / <alpha-value>)',
  'surface': 'hsl(var(--nuo-surface) / <alpha-value>)',
  'on-surface': 'hsl(var(--nuo-on-surface) / <alpha-value>)',
  'surface-variant': 'hsl(var(--nuo-surface-variant) / <alpha-value>)',
  'on-surface-variant': 'hsl(var(--nuo-on-surface-variant) / <alpha-value>)',
  'inverse-surface': 'hsl(var(--nuo-inverse-surface) / <alpha-value>)',
  'inverse-on-surface': 'hsl(var(--nuo-inverse-on-surface) / <alpha-value>)',
  'inverse-primary': 'hsl(var(--nuo-inverse-primary) / <alpha-value>)',
  'shadow': 'hsl(var(--nuo-shadow) / <alpha-value>)',
  'surface-tint': 'hsl(var(--nuo-surface-tint) / <alpha-value>)',
  'outline-variant': 'hsl(var(--nuo-outline-variant) / <alpha-value>)',
  'scrim': 'hsl(var(--nuo-scrim) / <alpha-value>)',
  'surface-container-highest':
    'hsl(var(--nuo-surface-container-highest) / <alpha-value>)',
  'surface-container-high':
    'hsl(var(--nuo-surface-container-high) / <alpha-value>)',
  'surface-container': 'hsl(var(--nuo-surface-container) / <alpha-value>)',
  'surface-container-low':
    'hsl(var(--nuo-surface-container-low) / <alpha-value>)',
  'surface-container-lowest':
    'hsl(var(--nuo-surface-container-lowest) / <alpha-value>)',
  'surface-bright': 'hsl(var(--nuo-surface-bright) / <alpha-value>)',
  'surface-dim': 'hsl(var(--nuo-surface-dim) / <alpha-value>)',
};

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  corePlugins: {
    container: false,
  },
  theme: {
    screens: {
      ...defaultConfig.theme?.screens,
      '2xl': '1400px',
    },
    extend: {
      fontFamily: {
        sans: [
          "'Rubik Variable'",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(defaultConfig as any).theme.fontFamily.sans,
        ],
      },
      backgroundImage: {
        main: 'linear-gradient(105deg, hsl(var(--background))  0%, hsl(var(--primary)/0.7) 100%)',
      },
      colors,
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      boxShadow: {
        '1': 'var(--nuo-elevation-1)',
        '2': 'var(--nuo-elevation-2)',
        '3': 'var(--nuo-elevation-3)',
        '4': 'var(--nuo-elevation-4)',
        '5': 'var(--nuo-elevation-5)',
      },
    },
  },
  plugins: [
    containerQueryPlugin,
    animatePlugin,
    plugin(function noScrollBarPlugin({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
    plugin(function spacingBleed({ addComponents, theme }) {
      addComponents({
        '.container': {
          'margin-inline': 'auto',
          'padding-inline': 'var(--container-x-base)',
          '@screen sm': {
            'padding-inline': 'var(--container-x-sm)',
          },
          '@screen md': {
            'padding-inline': 'var(--container-x-md)',
          },
          '@screen lg': {
            'maxWidth': theme('screens.lg'),
            'padding-inline': 'var(--container-x-lg)',
          },
          '@screen xl': {
            'maxWidth': theme('screens.xl'),
            'padding-inline': 'var(--container-x-xl)',
          },
          '@screen 2xl': {
            'maxWidth': theme('screens.2xl'),
            'padding-inline': 'var(--container-x-2xl)',
          },
        },
      });

      addComponents({
        '.spacing-bleed': {
          '--spacing-bleed': 'var(--container-x-base, 0)',

          'margin-inline': 'calc(-1 * var(--spacing-bleed))',
          'padding-inline': 'var(--spacing-bleed)',
          'scroll-padding-inline': 'var(--spacing-bleed)',
          '@screen sm': {
            '--spacing-bleed': 'var(--container-x-sm)',
          },
          '@screen md': {
            '--spacing-bleed': 'var(--container-x-md)',
          },
          // "@screen lg": {
          // 	"margin-inline": "calc(-1 * var(--container-px-lg))",
          // },
          // "@screen xl": {
          // 	"margin-inline": "calc(-1 * var(--container-px-xl))",
          // },
          // "@screen 2xl": {
          // 	"margin-inline": "calc(-1 * var(--container-px-2xl))",
          // },
        },
      });
    }),
  ],
} satisfies Config;
