import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme.js";
import animatePlugin from "tailwindcss-animate";

export default {
	content: ["./app/**/*.{ts,tsx,jsx,js}"],
	darkMode: "class",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
			},
			colors: {
				"white": "rgba(255, 255, 255, 1)",
				"black": "rgba(0, 0, 0, 1)",
				"primary": "rgba(228, 101, 119, 1)",
				"tertiary": "rgba(33, 158, 188, 1)",
				"error": "rgba(230, 57, 70, 1)",
				"neutral": "rgba(2, 48, 71, 1)",
				"neutral-variant": "rgba(158, 141, 144, 1)",
				"surface1": "rgba(249, 249, 252, 1)",
				"surface2": "rgba(249, 249, 252, 1)",
				"surface3": "rgba(249, 249, 252, 1)",
				"surface4": "rgba(249, 249, 252, 1)",
				"surface5": "rgba(249, 249, 252, 1)",
				"dark-surface1": "rgba(17, 20, 22, 1)",
				"dark-surface2": "rgba(17, 20, 22, 1)",
				"dark-surface3": "rgba(17, 20, 22, 1)",
				"dark-surface4": "rgba(17, 20, 22, 1)",
				"dark-surface5": "rgba(17, 20, 22, 1)",
			},
			// TODO: missing line heights
			/* Text-size styles */
			/* base size: nuo--title--medium (16px) */
			// --nuo-display--large: 3.56rem;
			// --nuo-display--medium: 2.81rem;
			// --nuo-display--small: 2.25rem;
			// --nuo-headline--large: 2rem;
			// --nuo-headline--medium: 1.75rem;
			// --nuo-headline--small: 1.5rem;
			// --nuo-title--large: 1.38rem;
			// --nuo-title--medium: 1rem;
			// --nuo-title--small: 0.88rem;
			// --nuo-body--large: 1rem;
			// --nuo-body--medium: 0.88rem;
			// --nuo-body--small: 0.75rem;
			// --nuo-label--large: 0.88rem;
			// --nuo-label--medium: 0.75rem;
			// --nuo-label--small: 0.69rem;
		},
		boxShadow: {
			"1": "0px 1px 3px rgba(0, 0, 0, 0.15), 0px 1px 2px rgba(0, 0, 0, 0.3)",
			"2": "0px 2px 6px rgba(0, 0, 0, 0.15), 0px 1px 2px rgba(0, 0, 0, 0.3)",
			"3": "0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.15)",
			"4": "0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px rgba(0, 0, 0, 0.15)",
			"5": "0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px rgba(0, 0, 0, 0.15)",
			"dark-1":
				"0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px rgba(0, 0, 0, 0.15)",
			"dark-2":
				"0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px rgba(0, 0, 0, 0.15)",
			"dark-3":
				"0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px rgba(0, 0, 0, 0.15)",
			"dark-4":
				"0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px rgba(0, 0, 0, 0.15)",
			"dark-5":
				"0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px rgba(0, 0, 0, 0.15)",
		},
	},
	plugins: [animatePlugin],
} satisfies Config;
