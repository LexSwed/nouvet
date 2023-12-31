/* eslint-disable @typescript-eslint/no-namespace */
import { splitProps, type JSX } from 'solid-js';

import { FormField, type FormFieldProps } from '../form-field';

import * as cssStyle from './picker.module.css';
import { tw } from '~/lib/ui/tw';

interface PickerProps
  extends FormFieldProps,
    JSX.SelectHTMLAttributes<HTMLSelectElement> {}

const Picker = (ownProps: PickerProps) => {
  const [fieldProps, props] = splitProps(ownProps, [
    'class',
    'style',
    'id',
    'label',
  ]);
  return (
    <FormField {...fieldProps} name={props.name}>
      {(aria) => {
        return (
          <select
            {...props}
            class={cssStyle.input}
            id={aria.id()}
            aria-describedby={aria.describedBy()}
          />
        );
      }}
    </FormField>
  );
};

const Option = (props: JSX.OptionHTMLAttributes<HTMLOptionElement>) => {
  return <option {...props} class={tw(cssStyle.option, props.class)} />;
};

export { Picker, Option };

declare module 'solid-js' {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      popover?: true | 'auto' | 'manual';
      popovertarget?: string;
    }
  }
}
