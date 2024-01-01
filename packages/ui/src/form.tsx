import { mergeRefs } from '@solid-primitives/refs';
import {
  createContext,
  type ComponentProps,
  useContext,
  type ParentProps,
  type Accessor,
  createSignal,
  splitProps,
  createEffect,
  on,
} from 'solid-js';

interface FormContext {
  validationErrors?: Record<string, string> | null;
}

const formContext = createContext<Accessor<FormContext>>(() => ({
  validationErrors: null,
}));
export const useFormContext = () => useContext(formContext);

export const Form = (
  ownProps: ParentProps<FormContext & ComponentProps<'form'>>,
) => {
  let formRef: HTMLFormElement | undefined;
  const [local, props] = splitProps(ownProps, ['validationErrors']);
  const [nativeErrors, setNativeErrors] =
    createSignal<FormContext['validationErrors']>();
  const value = () => ({
    validationErrors: { ...local.validationErrors, ...nativeErrors() },
  });

  /* Sets custom validation errors on validationErrors prop fields */
  createEffect(
    on(
      () => local.validationErrors,
      (newPropErrors) => {
        if (!formRef) return;
        Array.from(formRef!.elements).forEach((element) => {
          if (!isValidatableInput(element)) return;
          // reset custom message if it was set before
          element.setCustomValidity('');
          if (newPropErrors && element.name in newPropErrors) {
            element.setCustomValidity(newPropErrors[element.name]);
          }
        });
      },
    ),
  );

  return (
    <formContext.Provider value={value}>
      <form
        novalidate
        {...props}
        ref={mergeRefs(ownProps.ref, (el) => (formRef = el))}
        onSubmit={(event) => {
          const errors = setNativeValidationMessages(event.currentTarget);

          setNativeErrors(Object.fromEntries(errors.entries()));
          if (errors.size > 0) {
            event.preventDefault();
          } else {
            // @ts-expect-error Solid issues
            props.onSubmit?.(event);
          }
        }}
      />
    </formContext.Provider>
  );
};

/**
 * Checks validatable form elements for native validation errors,
 * like `required` or `minlenght`. Keeps custom error message, if it was set.
 * @returns native validation errors.
 */
function setNativeValidationMessages(form: HTMLFormElement) {
  const invalid = new Map<string, string>();
  Array.from(form.elements).forEach((element) => {
    if (!isValidatableInput(element)) return;

    const customValidationError = element.validity.customError
      ? (element as HTMLInputElement).validationMessage
      : null;
    // reset possible custom message to check native validation
    (element as HTMLInputElement).setCustomValidity('');
    // if the field is still invalid – set new native validation message
    if (!element['validity'].valid) {
      invalid.set(
        element.name,
        (element as HTMLInputElement).validationMessage,
      );
      return;
    }
    // if native validation passed, but there are still errors from props - set them.
    if (customValidationError) {
      (element as HTMLInputElement).setCustomValidity(customValidationError);
    }
  });
  return invalid;
}

function isValidatableInput(
  element: Element,
): element is HTMLInputElement & { name: string } {
  return (
    !!element.getAttribute('name') &&
    'validity' in element &&
    element['validity'] instanceof ValidityState
  );
}
