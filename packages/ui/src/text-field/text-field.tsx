import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { FormField, type FormFieldProps } from "../form-field";
import { mergeDefaultProps } from "../utils";

import css from "./text-field.module.css";

export type TextFieldProps<T extends "input" | "textarea"> = FormFieldProps &
	(T extends "input"
		? JSX.InputHTMLAttributes<HTMLInputElement>
		: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>) & {
		/** Prefix symbol or an icon */
		prefix?: JSX.Element;
		/** Prefix symbol or an icon */
		suffix?: JSX.Element;
		as?: T;
	};

const TextField = <T extends "input" | "textarea" = "input">(ownProps: TextFieldProps<T>) => {
	const [fieldProps, local, props] = splitProps(
		mergeDefaultProps(ownProps as TextFieldProps<"input">, {
			as: "input",
			type: "text",
		}),
		[
			"class",
			"inline",
			"style",
			"id",
			"label",
			"description",
			"variant",
			"textSize",
			"prefix",
			"suffix",
			"overlay",
		],
		["as", "type"],
	);

	// TODO: Max length handling to allow surpassing it, but showing as native error somehow still
	return (
		<FormField {...fieldProps} name={props.name}>
			{(aria) => (
				<Dynamic
					{...props}
					component={local.as}
					type={local.as === "input" ? local.type : undefined}
					class={css.input}
					id={aria.id}
					aria-describedby={aria.describedBy}
					data-part="input"
				/>
			)}
		</FormField>
	);
};

export { TextField };
