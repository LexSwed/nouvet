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
import { mergeDefaultProps } from "../utils";

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
	const [nativeErrors, setNativeErrors] = createSignal<FormContext["validationErrors"]>({});

	/* Sets custom validation errors on validationErrors prop fields */
	createEffect(
		on(
			() => local.validationErrors,
			(newPropErrors) => {
				if (!formRef) return;
				const errors = new Map<string, string>();
				const fieldsets = new Map<string, Set<string>>();
				main: for (const element of Array.from(formRef.elements)) {
					if (!isValidatableInput(element)) continue;
					// store fieldsets with their elements
					if (element instanceof HTMLFieldSetElement) {
						fieldsets.set(
							element.name,
							Array.from(element.elements).reduce((acc, el) => {
								if (isValidatableInput(el)) acc.add(el.name);
								return acc;
							}, new Set<string>()),
						);
						// no need to check fieldsets for validity as they don't hold it
						continue;
					}
					// reset custom message if it was set before
					element.setCustomValidity("");

					const errorString =
						newPropErrors && element.name in newPropErrors
							? newPropErrors[element.name]
							: undefined;
					if (typeof errorString !== "string") continue;

					// for some reason the element is not rerendered with new error state
					setTimeout(() => {
						// ensure the field is reported as invalid
						element.setCustomValidity(errorString);
					}, 10);

					// check if the field belongs to a fieldset and set the error on the fieldset
					for (const [fieldsetName, fieldset] of fieldsets.entries()) {
						if (fieldset.has(element.name)) {
							errors.set(
								fieldsetName,
								errors.has(fieldsetName)
									? [errors.get(fieldsetName), errorString].join("\n")
									: errorString,
							);
							continue main;
						}
					}
					// otherwise set the error on the field itself
					errors.set(element.name, errorString);
				}
				setNativeErrors(Object.fromEntries(errors.entries()));
			},
		),
	);

	return (
		<formContext.Provider
			value={() => ({
				validationErrors: nativeErrors(),
			})}
		>
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

		const customValidationError = element.validity.customError ? element.validationMessage : null;
		// reset possible custom message to check native validation
		element.setCustomValidity("");

		// if the field is still invalid – set new native validation message
		if (!element.validity.valid) {
			invalid.set(element.name, element.validationMessage);
			continue;
		}
		// if native validation passed, but there are still errors from props - set them.
		if (customValidationError) {
			element.setCustomValidity(customValidationError);
		}
	}
	return invalid;
}

function isValidatableInput(element: Element): element is HTMLInputElement & { name: string } {
	return "validity" in element && element.validity instanceof ValidityState;
}
