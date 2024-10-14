import { type VariantProps, cva } from "class-variance-authority";
import {
	type ComponentProps,
	type JSX,
	type JSXElement,
	Show,
	children,
	createMemo,
	createUniqueId,
	splitProps,
} from "solid-js";

import { Text } from "../text";
import { tw } from "../tw";
import { useFormContext } from "./form";
import css from "./form-field.module.css";

export const formFieldVariants = cva(css.wrapper, {
	variants: {
		variant: {
			underline: css.wrapperUnderline,
			ghost: css.wrapperGhost,
		},
		textSize: {
			sm: css.sizeSm,
			base: css.sizeBase,
			lg: css.sizeLg,
		},
		inline: {
			true: css.wrapperInline,
		},
	},
	defaultVariants: {
		variant: "underline",
		textSize: "base",
		inline: false,
	},
});

export interface FormFieldProps extends VariantProps<typeof formFieldVariants> {
	overlay?: JSXElement;
	/** Field label. */
	label?: JSXElement;
	/** Helper text. */
	description?: string;
}
interface FieldInnerProps
	extends FormFieldProps,
		Pick<JSX.HTMLAttributes<HTMLDivElement>, "class" | "id" | "style"> {
	/* Name of the input field to assign validation description */
	name?: string;
	children: (ariaProps: {
		id: string;
		describedBy: string | undefined;
	}) => JSX.Element;
	/** Prefix text or an icon */
	prefix?: JSX.Element;
	/** Prefix text or an icon */
	suffix?: JSX.Element;
}
const FormField = (ownProps: FieldInnerProps) => {
	const formContext = useFormContext();
	const [local, props] = splitProps(ownProps, ["variant", "inline", "id", "textSize"]);
	const localId = createUniqueId();

	const errorMessage = () => (props.name ? formContext().validationErrors?.[props.name] : null);

	const aria = {
		get id() {
			return local.id || localId;
		},
		get describedBy() {
			return `${aria.id}-description`;
		},
	};

	const prefix = children(() => props.prefix);
	const suffix = children(() => props.suffix);
	const label = children(() => props.label);
	const description = children(() => props.description);
	const child = createMemo(() => props.children(aria));
	const overlay = children(() => props.overlay);
	return (
		<div id={local.id} class={tw(css.field, props.class)} style={props.style}>
			<div class={formFieldVariants(local)}>
				<Show when={label()}>
					<Text
						as="label"
						for={aria.id}
						with="label-sm"
						class={tw(css.label, "flex w-full flex-row items-center justify-between gap-4")}
					>
						{label()}
					</Text>
				</Show>
				<div class="stack w-full place-items-baseline">
					<div class={css.inputWrapper}>
						<Show when={prefix()}>
							<label for={aria.id} class={css.prefix}>
								{prefix()}
							</label>
						</Show>
						{child()}
						<Show when={suffix()}>
							<label for={aria.id} class={css.suffix}>
								{suffix()}
							</label>
						</Show>
					</div>
					<Show when={overlay()}>
						<Text as="label" with="label" tone="light" for={aria.id} class={css.overlay}>
							{overlay()}
						</Text>
					</Show>
				</div>
			</div>
			<Show when={typeof errorMessage() === "string" || description()}>
				<div id={aria.describedBy} class={css.description}>
					{description()}
					<Show when={typeof errorMessage() === "string"}>
						<div aria-live="polite" class={tw(css.error)}>
							{errorMessage()}
						</div>
					</Show>
				</div>
			</Show>
		</div>
	);
};

const Fieldset = (
	ownProps: ComponentProps<"fieldset"> & { legend?: JSX.Element; description?: JSX.Element },
) => {
	const [local, props] = splitProps(ownProps, ["id", "legend", "children"]);

	const formContext = useFormContext();

	const errorMessage = () => (props.name ? formContext().validationErrors?.[props.name] : null);

	const localId = createUniqueId();
	const description = children(() => props.description);

	const aria = {
		get id() {
			return local.id || localId;
		},
		get describedBy() {
			if (errorMessage() || description()) {
				return `${aria.id}-description`;
			}
			return undefined;
		},
	};
	const legend = children(() => local.legend);

	return (
		<fieldset
			{...props}
			id={aria.id}
			class={tw(css.fieldset, props.class)}
			aria-describedby={aria.describedBy}
		>
			<Show when={legend()}>
				<Text
					as="legend"
					with="label-sm"
					class={tw(css.label, "ms-3 mb-1 flex w-full items-center justify-between gap-4")}
				>
					{legend()}
				</Text>
			</Show>
			{local.children}
			<Show when={aria.describedBy}>
				<div aria-live="polite" class={tw(css.description)} id={aria.describedBy}>
					<Show when={description()}>{description()}</Show>
					<Show when={errorMessage()}>
						<div aria-live="polite" class={tw(css.error)}>
							{errorMessage()}
						</div>
					</Show>
				</div>
			</Show>
		</fieldset>
	);
};

export { FormField, Fieldset };
