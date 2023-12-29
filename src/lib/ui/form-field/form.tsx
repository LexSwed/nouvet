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

  createEffect(
    on(
      () => local.validationErrors,
      (newPropErrors, prevPropErrors) => {
        if (!formRef) return;
        setNativeErrors((errors) => {
          // const newErrors = { ...errors };
          Array.from(formRef!.elements).forEach((input) => {
            const name = input.getAttribute('name');
            if (!name || !('setCustomValidity' in input)) return;
            if (prevPropErrors && name in prevPropErrors) {
              errors && name in errors && delete errors[name];
              (input as HTMLInputElement).setCustomValidity('');
              console.log('reset');
            }
            if (newPropErrors && name in newPropErrors) {
              (input as HTMLInputElement).setCustomValidity(
                newPropErrors[name],
              );
            }
          });
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
          const form = event.currentTarget;
          const errors = Array.from(form.elements).reduce((errors, element) => {
            if (
              'validity' in element &&
              element['validity'] instanceof ValidityState &&
              !element.validity.valid
            ) {
              const name = element.getAttribute('name');
              if (name) {
                errors.set(
                  name,
                  (element as HTMLInputElement).validationMessage,
                );
              }
            }
            return errors;
          }, new Map<string, string>());
          setNativeErrors(Object.fromEntries(errors.entries()));
          // @ts-expect-error Solid issues
          props.onSubmit?.(event);
        }}
      />
    </formContext.Provider>
  );
};

export const useFormContext = () => useContext(formContext);
