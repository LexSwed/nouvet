import containerQueryPlugin from '@tailwindcss/container-queries';
import { type Config } from 'tailwindcss';
import defaultConfig from 'tailwindcss/defaultConfig.js';
import plugin from 'tailwindcss/plugin.js';
import animatePlugin from 'tailwindcss-animate';

const colors = {
  'primary': 'hsl(var(--nou-primary) / <alpha-value>)',
  'on-primary': 'hsl(var(--nou-on-primary) / <alpha-value>)',
  'primary-container': 'hsl(var(--nou-primary-container) / <alpha-value>)',
  'on-primary-container':
    'hsl(var(--nou-on-primary-container) / <alpha-value>)',
  'primary-fixed': 'hsl(var(--nou-primary-fixed) / <alpha-value>)',
  'on-primary-fixed': 'hsl(var(--nou-on-primary-fixed) / <alpha-value>)',
  'primary-fixed-dim': 'hsl(var(--nou-primary-fixed-dim) / <alpha-value>)',
  'on-primary-fixed-variant':
    'hsl(var(--nou-on-primary-fixed-variant) / <alpha-value>)',
  'secondary': 'hsl(var(--nou-secondary) / <alpha-value>)',
  'on-secondary': 'hsl(var(--nou-on-secondary) / <alpha-value>)',
  'secondary-container': 'hsl(var(--nou-secondary-container) / <alpha-value>)',
  'on-secondary-container':
    'hsl(var(--nou-on-secondary-container) / <alpha-value>)',
  'secondary-fixed': 'hsl(var(--nou-secondary-fixed) / <alpha-value>)',
  'on-secondary-fixed': 'hsl(var(--nou-on-secondary-fixed) / <alpha-value>)',
  'secondary-fixed-dim': 'hsl(var(--nou-secondary-fixed-dim) / <alpha-value>)',
  'on-secondary-fixed-variant':
    'hsl(var(--nou-on-secondary-fixed-variant) / <alpha-value>)',
  'tertiary': 'hsl(var(--nou-tertiary) / <alpha-value>)',
  'on-tertiary': 'hsl(var(--nou-on-tertiary) / <alpha-value>)',
  'tertiary-container': 'hsl(var(--nou-tertiary-container) / <alpha-value>)',
  'on-tertiary-container':
    'hsl(var(--nou-on-tertiary-container) / <alpha-value>)',
  'tertiary-fixed': 'hsl(var(--nou-tertiary-fixed) / <alpha-value>)',
  'on-tertiary-fixed': 'hsl(var(--nou-on-tertiary-fixed) / <alpha-value>)',
  'tertiary-fixed-dim': 'hsl(var(--nou-tertiary-fixed-dim) / <alpha-value>)',
  'on-tertiary-fixed-variant':
    'hsl(var(--nou-on-tertiary-fixed-variant) / <alpha-value>)',
  'error': 'hsl(var(--nou-error) / <alpha-value>)',
  'on-error': 'hsl(var(--nou-on-error) / <alpha-value>)',
  'error-container': 'hsl(var(--nou-error-container) / <alpha-value>)',
  'on-error-container': 'hsl(var(--nou-on-error-container) / <alpha-value>)',
  'outline': 'hsl(var(--nou-outline) / <alpha-value>)',
  'background': 'hsl(var(--nou-background) / <alpha-value>)',
  'on-background': 'hsl(var(--nou-on-background) / <alpha-value>)',
  'surface': 'hsl(var(--nou-surface) / <alpha-value>)',
  'on-surface': 'hsl(var(--nou-on-surface) / <alpha-value>)',
  'surface-variant': 'hsl(var(--nou-surface-variant) / <alpha-value>)',
  'on-surface-variant': 'hsl(var(--nou-on-surface-variant) / <alpha-value>)',
  'inverse-surface': 'hsl(var(--nou-inverse-surface) / <alpha-value>)',
  'inverse-on-surface': 'hsl(var(--nou-inverse-on-surface) / <alpha-value>)',
  'inverse-primary': 'hsl(var(--nou-inverse-primary) / <alpha-value>)',
  'shadow': 'hsl(var(--nou-shadow) / <alpha-value>)',
  'surface-tint': 'hsl(var(--nou-surface-tint) / <alpha-value>)',
  'outline-variant': 'hsl(var(--nou-outline-variant) / <alpha-value>)',
  'scrim': 'hsl(var(--nou-scrim) / <alpha-value>)',
  'surface-container-highest':
    'hsl(var(--nou-surface-container-highest) / <alpha-value>)',
  'surface-container-high':
    'hsl(var(--nou-surface-container-high) / <alpha-value>)',
  'surface-container': 'hsl(var(--nou-surface-container) / <alpha-value>)',
  'surface-container-low':
    'hsl(var(--nou-surface-container-low) / <alpha-value>)',
  'surface-container-lowest':
    'hsl(var(--nou-surface-container-lowest) / <alpha-value>)',
  'surface-bright': 'hsl(var(--nou-surface-bright) / <alpha-value>)',
  'surface-dim': 'hsl(var(--nou-surface-dim) / <alpha-value>)',
};

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        'DEFAULT': '1rem',
        'sm': '2rem',
        'lg': '4rem',
        'xl': '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    screens: {
      ...defaultConfig.theme?.screens,
      '2xl': '1400px',
    },
    extend: {
      spacing: {
        font: '1em',
      },
      fontFamily: {
        sans: [
          'var(--nou-font-sans)',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(defaultConfig as any).theme.fontFamily.sans,
        ],
      },
      backgroundImage: {
        main: 'linear-gradient(135deg, hsl(var(--nou-secondary-container)/0.3) 0%, hsl(var(--nou-tertiary-container)/0.3) 100%)',
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
        'spinner-circle': 'spinner-circle 1.8s linear infinite',
      },
      boxShadow: {
        '1': 'var(--nou-elevation-1)',
        '2': 'var(--nou-elevation-2)',
        '3': 'var(--nou-elevation-3)',
        '4': 'var(--nou-elevation-4)',
        '5': 'var(--nou-elevation-5)',
      },
    },
    keyframes: {
      'spinner-circle': {
        '0%': {
          'stroke-dasharray': '1, 150',
          'stroke-dashoffset': '0',
        },
        '50%': {
          'stroke-dasharray': '90, 150',
          'stroke-dashoffset': '-35',
        },
        '100%': {
          'stroke-dasharray': '90, 150',
          'stroke-dashoffset': '-124',
        },
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
    plugin(function hoverAndFocusVariant({ addVariant }) {
      addVariant('intent', ['&:where(:hover,:focus)']);
    }),
  ],
} satisfies Config;
