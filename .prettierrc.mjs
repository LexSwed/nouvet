/** @type {import("prettier").Options} */
export default {
	quoteProps: "consistent",
	trailingComma: "all",
	useTabs: true,
	tabWidth: 2,
	overrides: [
		{
			files: ["**/*.json"],
			options: {
				useTabs: false,
			},
		},
	],
	plugins: ["prettier-plugin-tailwindcss"],
};
