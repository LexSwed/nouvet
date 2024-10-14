import { mergeRefs } from "@solid-primitives/refs";
import {
	type Accessor,
	type ComponentProps,
	createContext,
	createRenderEffect,
	createSignal,
	on,
	splitProps,
	useContext,
} from "solid-js";
import { mergeDefaultProps, startViewTransition } from "../utils";

interface FormContext {
	validationErrors?: Record<string, string | undefined | null> | null;
}

const formContext = createContext<Accessor<FormContext>>(() => ({
	validationErrors: null,
}));
export const useFormContext = () => useContext(formContext);

/**
 * Form component that provides validation errors to its children.
 * `onSubmit` the component will remove any custom validation messages set
 * via `validationErrors` and check the form for native validation errors.
 * If any of the fields includes native validation errors, the submission will be prevented,
 * and those error messages will be set into `nativeErrors`
 *
 * When `validationErrors` prop is updated (usually coming from submission), the component will
 * go over each field in the errors, find the corresponding Input element in the form and set the error message,
 * making element's validity state being reported as invalid.
 */
export const Form = (ownProps: FormContext & ComponentProps<"form">) => {
	let formRef: HTMLFormElement | undefined;
	const [local, props] = splitProps(mergeDefaultProps(ownProps, { method: "post" }), [
		"validationErrors",
	]);
	const [nativeErrors, setNativeErrors] = createSignal<FormContext["validationErrors"]>({});

	/* Sets custom validation errors on validationErrors prop fields */
	createRenderEffect(
		on(
			() => local.validationErrors,
			(newPropErrors) => {
				if (!formRef) return;
				const errors = new Map<string, string>();
				for (const element of Array.from(formRef.elements)) {
					if (!isValidatableInput(element)) continue;
					// store fieldsets with their elements

					// reset custom message if it was set before
					element.setCustomValidity("");

					const errorString =
						newPropErrors && element.name in newPropErrors
							? newPropErrors[element.name]
							: undefined;
					if (typeof errorString !== "string") continue;

					// ensure the field is reported as invalid
					element.setCustomValidity(errorString);

					// update errors map with this field's error
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
					const errors = new Map<string, string>();
					for (const element of Array.from(formRef.elements)) {
						if (!isValidatableInput(element)) continue;

						// reset possible custom message to check native validation
						element.setCustomValidity("");
						// if the field is still invalid – set new native validation message
						if (!element.validity.valid) {
							errors.set(element.name, element.validationMessage);

							const customValidationError = element.validity.customError
								? element.validationMessage
								: null;

							// set back custom validation error
							if (customValidationError) {
								element.setCustomValidity(customValidationError);
							}
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
