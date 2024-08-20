import { type JSX, Show, children, splitProps } from "solid-js";
import { FormField, type FormFieldProps } from "../form-field";
import { Icon } from "../icon/icon";
import { ListItem } from "../menu/list-item";
import { tw } from "../tw";
import css from "./picker.module.css";

export interface PickerProps
	extends FormFieldProps,
		Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "prefix"> {
	/** Prefix text or an icon */
	prefix?: JSX.Element;
	/** Prefix text or an icon */
	suffix?: JSX.Element;
}

const Picker = (ownProps: PickerProps) => {
	const [fieldProps, local, props] = splitProps(
		ownProps,
		["class", "style", "id", "variant"],
		["children", "label", "prefix", "suffix"],
	);
	const label = children(() => local.label);
	const options = children(() => local.children);
	return (
		<FormField
			{...fieldProps}
			name={props.name}
			label={
				<Show when={label()}>
					<span class="flex flex-row items-center gap-2">
						{label()}
						<Icon use="carret-up-down" size="font" />
					</span>
				</Show>
			}
		>
			{(aria) => {
				return (
					<select {...props} class={css.input} id={aria.id} aria-describedby={aria.describedBy}>
						<button
							// @ts-expect-error select menu not supported
							// biome-ignore lint/a11y/useButtonType: <explanation>
							type="popover"
							class="flex w-full cursor-default items-center outline-none"
							data-part="trigger"
							style={{ "anchor-name": `--anchor-${aria.id}` }}
						>
							{local.prefix}
							<selectedoption class="w-full" />
							{local.suffix}
						</button>
						<datalist
							class={tw(
								css.popover,
								"isolate max-h-64 overflow-auto overflow-y-auto rounded-2xl border border-on-surface/5 bg-surface p-1 text-on-surface shadow-popover",
							)}
						>
							{options()}
						</datalist>
					</select>
				);
			}}
		</FormField>
	);
};

const Option = (
	ownProps: Omit<JSX.OptionHTMLAttributes<HTMLOptionElement>, "label"> & {
		label: JSX.Element;
	},
) => {
	const [local, props] = splitProps(ownProps, ["label", "children", "class"]);
	const label = children(() => local.label);
	const child = children(() => local.children);
	return (
		<ListItem
			as="option"
			{...props}
			class={tw(
				"flex select-none flex-col items-stretch justify-center gap-1",
				css.option,
				local.class,
			)}
		>
			<div class="flex flex-row items-center justify-stretch gap-2" data-part="label">
				{label()}
				<Show when={props.value === ""}>
					<span class="sr-only" data-part="empty-option" />
				</Show>
			</div>
			<Show when={child()}>
				<div data-part="content" class="empty:hidden">
					{child()}
				</div>
			</Show>
		</ListItem>
	);
};

export { Picker, Option };

declare module "solid-js" {
	namespace JSX {
		interface IntrinsicElements {
			selectedoption: HTMLAttributes<HTMLElement>;
		}
	}
}
