import { type JSX, Show, children, createUniqueId, splitProps } from "solid-js";

import { Text } from "../text";
import { tw } from "../tw";

import css from "./radio-card.module.css";

interface RadioCardProps
	extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
	name: string;
	label: JSX.Element;
	icon?: JSX.Element;
	children?: JSX.Element;
}

const RadioCard = (ownProps: RadioCardProps) => {
	const [local, props] = splitProps(ownProps, [
		"class",
		"style",
		"id",
		"label",
		"icon",
		"children",
	]);
	const localId = createUniqueId();
	const id = () => local.id || localId;
	const icon = children(() => local.icon);
	const label = children(() => local.label);
	const child = children(() => local.children);
	return (
		<label for={id()} class={tw(css.card, local.class)} style={local.style}>
			<input type="radio" id={id()} {...props} class={"sr-only"} />
			<div class={css.wrapper} data-part="label">
				<Show when={icon()}>
					<div class={css.icon}>{icon()}</div>
				</Show>
				<Text with="label" class={css.label}>
					{label()}
				</Text>
			</div>
			{child()}
		</label>
	);
};

export { RadioCard };
