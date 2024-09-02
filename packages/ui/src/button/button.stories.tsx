import type { ComponentProps } from "solid-js";
import type { Meta } from "storybook-solidjs";

import { Button } from "./";

type ButtonProps = ComponentProps<typeof Button>;

const meta = {
	title: "Button",
	component: Button,
	argTypes: {
		variant: {
			options: ["accent", "tonal", "outline", "ghost", "link", null] as const satisfies Array<
				ButtonProps["variant"]
			>,
			control: { type: "select" },
		},
		tone: {
			options: [
				"neutral",
				"primary",
				"secondary",
				"destructive",
				"success",
			] as const satisfies Array<ButtonProps["tone"]>,
			control: { type: "select" },
		},
		loading: {
			control: {
				type: "boolean",
			},
		},
	},
} satisfies Meta<typeof Button>;

export default meta;

export const Primary = (args: ButtonProps) => <Button {...args}>Click me</Button>;
