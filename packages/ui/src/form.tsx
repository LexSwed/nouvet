import { mergeRefs } from "@solid-primitives/refs";
import {
	type Accessor,
	type ComponentProps,
	createContext,
	createEffect,
	createSignal,
	on,
	splitProps,
	useContext,
} from "solid-js";
import { mergeDefaultProps } from "./utils";

interface FormContext {
	validationErrors?: Record<string, string | undefined | null> | null;
}

const formContext = createContext<Accessor<FormContext>>(() => ({
	validationErrors: null,
}));
export const useFormContext = () => useContext(formContext);

export const Form = (ownProps: FormContext & ComponentProps<"form">) => {
	let formRef: HTMLFormElement | undefined;
	const [local, props] = splitProps(mergeDefaultProps(ownProps, { method: "post" }), [
		"validationErrors",
	]);
	const [nativeErrors, setNativeErrors] = createSignal<FormContext["validationErrors"]>();
	const value = () => ({
		validationErrors: { ...local.validationErrors, ...nativeErrors() },
	});

	/* Sets custom validation errors on validationErrors prop fields */
	createEffect(
		on(
			() => local.validationErrors,
			(newPropErrors) => {
				if (!formRef) return;
				for (const element of Array.from(formRef?.elements)) {
					if (!isValidatableInput(element)) return;
					// reset custom message if it was set before
					element.setCustomValidity("");
					const errorString =
						newPropErrors && element.name in newPropErrors && newPropErrors[element.name];
					if (typeof errorString === "string") {
						element.setCustomValidity(errorString);
					}
				}
			},
		),
	);
	return (
		<formContext.Provider value={value}>
			<form
				novalidate
				{...props}
				ref={mergeRefs(ownProps.ref, (el) => {
					formRef = el;
				})}
				onSubmit={(event) => {
					const errors = setNativeValidationMessages(event.currentTarget);
					setNativeErrors(Object.fromEntries(errors.entries()));
					if (errors.size > 0) {
						// prevent actions from execution
						event.preventDefault();
						event.stopPropagation();
						return false;
					}
					if (typeof props.onSubmit === "function") {
						props.onSubmit?.(event);
					} else if (Array.isArray(props.onSubmit)) {
						props.onSubmit[1](props.onSubmit[0], event);
					}
				}}
			/>
		</formContext.Provider>
	);
};

/**
 * Checks validatable form elements for native validation errors,
 * like `required` or `minLength`. Keeps custom error message, if it was set.
 * @returns native validation errors.
 */
function setNativeValidationMessages(form: HTMLFormElement) {
	const invalid = new Map<string, string>();
	for (const element of Array.from(form.elements)) {
		if (!isValidatableInput(element)) continue;

		const customValidationError = element.validity.customError
			? (element as HTMLInputElement).validationMessage
			: null;
		// reset possible custom message to check native validation
		(element as HTMLInputElement).setCustomValidity("");
		// if the field is still invalid – set new native validation message
		if (!element.validity.valid) {
			invalid.set(element.name, (element as HTMLInputElement).validationMessage);
			continue;
		}
		// if native validation passed, but there are still errors from props - set them.
		if (customValidationError) {
			(element as HTMLInputElement).setCustomValidity(customValidationError);
		}
	}
	return invalid;
}

function isValidatableInput(element: Element): element is HTMLInputElement & { name: string } {
	return (
		!!element.getAttribute("name") &&
		"validity" in element &&
		element.validity instanceof ValidityState
	);
}
