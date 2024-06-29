/** @jsxImportSource solid-js */
import { MemoryRouter, Route } from "@solidjs/router";
import type { Preview } from "storybook-solidjs";

import "@nou/config/global.css";
import "./storybook.css";

import { Suspense } from "solid-js";

const preview = {
	decorators: [
		(Story) => {
			const component = () => (
				<div class="h-full w-full bg-background p-8 text-on-background">
					<Story />
				</div>
			);
			return (
				<MemoryRouter
					root={(props) => {
						return <Suspense>{props.children}</Suspense>;
					}}
				>
					<Route path="/" component={component} />
				</MemoryRouter>
			);
		},
	],
} satisfies Preview;

export default preview;
