import {
  createContext,
  type ComponentProps,
  useContext,
  type ParentProps,
  type Accessor,
  createSignal,
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
  const [nativeErrors, setNativeErrors] =
    createSignal<FormContext['validationErrors']>();
  const value = () => ({
    validationErrors: nativeErrors(),
  });

  return (
    <formContext.Provider value={value}>
      <form
        novalidate
        {...ownProps}
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
          if (errors.size > 0) {
            event.preventDefault();
          } else {
            // @ts-expect-error Solid issues
            ownProps.onSubmit?.(event);
          }
          setNativeErrors(Object.fromEntries(errors.entries()));
        }}
      >
        {ownProps.children}
      </form>
    </formContext.Provider>
  );
};

export const useFormContext = () => useContext(formContext);
