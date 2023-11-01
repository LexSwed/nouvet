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
		},
	},
	plugins: [animatePlugin],
} satisfies Config;
