import containerQueryPlugin from "@tailwindcss/container-queries";
import { type Config } from "tailwindcss";
import defaultConfig from "tailwindcss/defaultConfig.js";
import plugin from "tailwindcss/plugin.js";
import animatePlugin from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	corePlugins: {
		container: false,
	},
	theme: {
		screens: {
			...defaultConfig.theme?.screens,
			"2xl": "1400px",
		},
		extend: {
			fontFamily: {
				sans: [
					"'Inter Variable'",
					...(defaultConfig as any).theme.fontFamily.sans,
				],
			},
			backgroundImage: {
				main: "linear-gradient(105deg, hsl(var(--background))  0%, hsl(var(--accent)/0.7) 100%)",
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				tertiary: {
					DEFAULT: "hsl(var(--tertiary))",
					foreground: "hsl(var(--tertiary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card) / 0.1)",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [
		containerQueryPlugin,
		animatePlugin,
		plugin(function noScrollBarPlugin({ addUtilities }) {
			addUtilities({
				".scrollbar-none": {
					"-ms-overflow-style": "none",
					"scrollbar-width": "none",
					"&::-webkit-scrollbar": {
						display: "none",
					},
				},
			});
		}),
		plugin(function spacingBleed({ addComponents, theme }) {
			addComponents({
				".container": {
					"margin-inline": "auto",
					"padding-inline": "var(--container-px-base)",
					"@screen sm": {
						"padding-inline": "var(--container-px-sm)",
					},
					"@screen md": {
						"padding-inline": "var(--container-px-md)",
					},
					"@screen lg": {
						"maxWidth": theme("screens.lg"),
						"padding-inline": "var(--container-px-lg)",
					},
					"@screen xl": {
						"maxWidth": theme("screens.xl"),
						"padding-inline": "var(--container-px-xl)",
					},
					"@screen 2xl": {
						"maxWidth": theme("screens.2xl"),
						"padding-inline": "var(--container-px-2xl)",
					},
				},
			});

			addComponents({
				".spacing-bleed": {
					"--spacing-bleed": "var(--container-px-base, 0)",

					"margin-inline": "calc(-1 * var(--spacing-bleed))",
					"padding-inline": "var(--spacing-bleed)",
					"scroll-padding-inline": "var(--spacing-bleed)",
					"@screen sm": {
						"--spacing-bleed": "var(--container-px-sm)",
					},
					"@screen md": {
						"--spacing-bleed": "var(--container-px-md)",
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
