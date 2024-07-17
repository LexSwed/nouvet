import containerQueryPlugin from "@tailwindcss/container-queries";
import animatePlugin from "tailwindcss-animate";
import defaultConfig from "tailwindcss/defaultConfig";
import plugin from "tailwindcss/plugin";

import type { Config } from "tailwindcss";

const colors = {
	primary: "hsl(var(--nou-primary) / <alpha-value>)",
	"on-primary": "hsl(var(--nou-on-primary) / <alpha-value>)",
	"primary-container": "hsl(var(--nou-primary-container) / <alpha-value>)",
	"on-primary-container": "hsl(var(--nou-on-primary-container) / <alpha-value>)",
	secondary: "hsl(var(--nou-secondary) / <alpha-value>)",
	"on-secondary": "hsl(var(--nou-on-secondary) / <alpha-value>)",
	"secondary-container": "hsl(var(--nou-secondary-container) / <alpha-value>)",
	"on-secondary-container": "hsl(var(--nou-on-secondary-container) / <alpha-value>)",
	tertiary: "hsl(var(--nou-tertiary) / <alpha-value>)",
	"on-tertiary": "hsl(var(--nou-on-tertiary) / <alpha-value>)",
	"tertiary-container": "hsl(var(--nou-tertiary-container) / <alpha-value>)",
	"on-tertiary-container": "hsl(var(--nou-on-tertiary-container) / <alpha-value>)",
	error: "hsl(var(--nou-error) / <alpha-value>)",
	"on-error": "hsl(var(--nou-on-error) / <alpha-value>)",
	"error-container": "hsl(var(--nou-error-container) / <alpha-value>)",
	"on-error-container": "hsl(var(--nou-on-error-container) / <alpha-value>)",
	outline: "hsl(var(--nou-outline) / <alpha-value>)",
	background: "hsl(var(--nou-background) / <alpha-value>)",
	"on-background": "hsl(var(--nou-on-background) / <alpha-value>)",
	surface: "hsl(var(--nou-surface) / <alpha-value>)",
	"on-surface": "hsl(var(--nou-on-surface) / <alpha-value>)",
	"surface-variant": "hsl(var(--nou-surface-variant) / <alpha-value>)",
	"on-surface-variant": "hsl(var(--nou-on-surface-variant) / <alpha-value>)",
	"inverse-surface": "hsl(var(--nou-inverse-surface) / <alpha-value>)",
	"inverse-on-surface": "hsl(var(--nou-inverse-on-surface) / <alpha-value>)",
	"inverse-primary": "hsl(var(--nou-inverse-primary) / <alpha-value>)",
	"surface-tint": "hsl(var(--nou-surface-tint) / <alpha-value>)",
	"outline-variant": "hsl(var(--nou-outline-variant) / <alpha-value>)",
	scrim: "hsl(var(--nou-scrim) / <alpha-value>)",
	"surface-container-highest": "hsl(var(--nou-surface-container-highest) / <alpha-value>)",
	"surface-container-high": "hsl(var(--nou-surface-container-high) / <alpha-value>)",
	"surface-container": "hsl(var(--nou-surface-container) / <alpha-value>)",
	"surface-container-low": "hsl(var(--nou-surface-container-low) / <alpha-value>)",
	"surface-container-lowest": "hsl(var(--nou-surface-container-lowest) / <alpha-value>)",
};

export default {
	darkMode: ["class"],
	content: [],
	corePlugins: {
		container: false,
	},
	theme: {
		// container: {
		//   center: true,
		//   padding: {
		//     'DEFAULT': '1rem',
		//     'sm': '2rem',
		//     'lg': '4rem',
		//     'xl': '5rem',
		//     '2xl': '6rem',
		//   },
		//   screens: {
		//     '2xl': '1400px',
		//   },
		// },
		screens: {
			...defaultConfig.theme?.screens,
			sm: "560px",
			"2xl": "1400px",
		},
		extend: {
			opacity: {
				2: "0.02",
				8: "0.08",
				12: "0.12",
			},
			spacing: {
				font: "1em",
			},
			fontFamily: {
				sans: [
					"var(--nou-font-sans)",
					// biome-ignore lint/suspicious/noExplicitAny: imports :shrug:
					...(defaultConfig as any).theme.fontFamily.sans,
				],
			},
			backgroundImage: {
				main: "linear-gradient(135deg, hsl(var(--nou-secondary-container)/0.3) 0%, hsl(var(--nou-tertiary-container)/0.3) 100%)",
			},
			colors,
			boxShadow: {
				flat: "0 0 1px 2px var(--nou-on-surface)/0.2",
				popover: `0 0 1px theme('colors.on-surface-variant/0.2'), theme('boxShadow.lg')`,
			},
			animation: {
				"spinner-circle": "spinner-circle 1.8s linear infinite",
			},
			keyframes: {
				"spinner-circle": {
					"0%": {
						"stroke-dasharray": "1, 150",
						"stroke-dashoffset": "0",
					},
					"50%": {
						"stroke-dasharray": "90, 150",
						"stroke-dashoffset": "-35",
					},
					"100%": {
						"stroke-dasharray": "90, 150",
						"stroke-dashoffset": "-124",
					},
				},
			},
		},
	},
	plugins: [
		containerQueryPlugin,
		animatePlugin,
		plugin(function hoverAndFocusVariant({ addVariant }) {
			addVariant("intent", ["&:where(:hover,:focus-visible:focus)"]);
		}),
		plugin(function disabledVariant({ addVariant }) {
			addVariant("disabled", ['&:where(disabled,[aria-disabled="true"])']);
		}),
		plugin(function viewTransitions({ matchUtilities }) {
			matchUtilities({
				"view-transition": (value) => ({
					viewTransitionName: value,
				}),
				"view-transition-class": (value) => ({
					viewTransitionClass: value,
				}),
			});
		}),
		plugin(function startingStyle({ addVariant }) {
			addVariant("starting", "@starting-style");
		}),
	],
} satisfies Config;
