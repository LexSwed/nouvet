import { type VariantProps, cva } from "class-variance-authority";
import { type ValidComponent, splitProps } from "solid-js";
import { Dynamic, type DynamicProps } from "solid-js/web";

import { tw } from "./tw";

const textVariants = cva("m-0 whitespace-pre-line font-sans", {
	variants: {
		with: {
			body: "font-normal text-base",
			"body-xs": "font-normal text-xs",
			"body-sm": "font-normal text-sm",
			"body-lg": "font-normal text-lg",
			"body-xl": "font-normal text-xl",
			label: "font-medium text-sm",
			"label-sm": "text-sm",
			"label-lg": "font-medium text-lg",
			"headline-1": "font-semibold text-3xl",
			"headline-2": "font-semibold text-2xl",
			"headline-3": "font-medium text-xl",
			"headline-4": "text-xl",
			"headline-5": "text-xl",
			"headline-6": "text-lg uppercase",
			overline: "text-xs uppercase tracking-wide",
			mono: "font-mono text-sm",
			"mono-sm": "font-mono text-xs",
			"mono-lg": "font-mono text-base",
		},
		tone: {
			neutral: "text-on-background",
			accent: "text-primary",
			light: "text-on-surface-variant",
			success: "text-tertiary",
			danger: "text-error",
		},
		align: {
			start: "text-start",
			center: "text-center",
			end: "text-end",
			justify: "text-justify",
		},
		dense: {
			true: "leading-none",
		},
	},
});

type TextProps<T extends ValidComponent> = Omit<DynamicProps<T>, "component"> &
	VariantProps<typeof textVariants> & {
		/** @default 'span' */
		as?: T | undefined;
	};

const Text = <T extends ValidComponent>(ownProps: TextProps<T>) => {
	const [variants, component, props] = splitProps(
		ownProps as TextProps<"span">,
		["with", "tone", "align", "dense"],
		["as", "class"],
	);

	return (
		<Dynamic
			{...props}
			component={component.as || "span"}
			class={tw(textVariants(variants), component.class)}
		/>
	);
};

export { Text };
