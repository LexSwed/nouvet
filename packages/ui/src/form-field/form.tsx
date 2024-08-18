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
import { mergeDefaultProps, startViewTransition } from "../utils";

interface FormContext {
	validationErrors?: Record<string, HTMLElement | string | undefined | null> | null;
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
				const errors = new Map<string, string | HTMLElement>();
				const fieldsets = new Map<HTMLFieldSetElement, Set<string>>();
				main: for (const element of Array.from(formRef.elements)) {
					if (!isValidatableInput(element)) continue;
					// store fieldsets with their elements
					if (element instanceof HTMLFieldSetElement) {
						fieldsets.set(
							element,
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

					// ensure the field is reported as invalid
					element.setCustomValidity(errorString);

					// check if the field belongs to a fieldset and set the error on the fieldset
					for (const [fieldset, elements] of fieldsets.entries()) {
						if (elements.has(element.name)) {
							errors.set(
								fieldset.name,
								errors.has(fieldset.name)
									? [errors.get(fieldset.name), errorString].join("\n")
									: errorString,
							);
							errors.set(element.name, fieldset);
							continue main;
						}
					}
					// otherwise set the error on the field itself
					errors.set(element.name, errorString);
				}
				startViewTransition(() => {
					setNativeErrors(Object.fromEntries(errors.entries()));
				});
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
					if (!formRef) return;
					// run through built-in validations, like `required` and `pattern`.
					// if the field is reported as invalid, take the error message and store it in the context.
					const errors = new Map<string, string | HTMLElement>();
					const fieldsets = new Map<HTMLFieldSetElement, Set<string>>();
					main: for (const element of Array.from(formRef.elements)) {
						if (!isValidatableInput(element)) continue;
						// store fieldsets with their elements
						if (element instanceof HTMLFieldSetElement) {
							fieldsets.set(
								element,
								Array.from(element.elements).reduce((acc, el) => {
									if (isValidatableInput(el)) acc.add(el.name);
									return acc;
								}, new Set<string>()),
							);
							// no need to check fieldsets for validity as they don't hold it
							continue;
						}
						// reset possible custom message to check native validation
						element.setCustomValidity("");
						// if the field is still invalid – set new native validation message
						if (!element.validity.valid) {
							for (const [fieldset, elements] of fieldsets.entries()) {
								if (elements.has(element.name)) {
									errors.set(
										fieldset.name,
										errors.has(fieldset.name)
											? [errors.get(fieldset.name), element.validationMessage].join("\n")
											: element.validationMessage,
									);
									errors.set(element.name, fieldset);
									continue main;
								}
							}
						}
						const customValidationError = element.validity.customError
							? element.validationMessage
							: null;

						// set back custom validation error
						if (customValidationError) {
							element.setCustomValidity(customValidationError);
						}
					}
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

function isValidatableInput(element: Element): element is HTMLInputElement & { name: string } {
	return "validity" in element && element.validity instanceof ValidityState;
}
