import remarkGfm from "remark-gfm";
import type { StorybookConfig } from "storybook-solidjs-vite";

const config = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		{
			name: "@storybook/addon-docs",
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [remarkGfm],
					},
				},
			},
		},
	],
	framework: {
		name: "storybook-solidjs-vite",
		options: {},
	},
	docs: {},
	core: {
		disableTelemetry: true,
	},
} satisfies StorybookConfig;

export default config;
