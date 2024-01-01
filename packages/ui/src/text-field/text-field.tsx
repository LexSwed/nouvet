import { splitProps, type JSX } from 'solid-js';
import { mergeDefaultProps } from '../utils';

import { FormField, type FormFieldProps } from '../form-field';
import * as cssStyle from './text-field.module.css';

export interface TextFieldProps
  extends FormFieldProps,
    JSX.InputHTMLAttributes<HTMLInputElement> {}
const TextField = (ownProps: TextFieldProps) => {
  const [fieldProps, props] = splitProps(
    mergeDefaultProps(ownProps, { type: 'text' }),
    ['class', 'style', 'id', 'label'],
  );

  return (
    <FormField {...fieldProps} name={props.name}>
      {(aria) => (
        <input
          {...props}
          class={cssStyle.input}
          id={aria.id()}
          aria-describedby={aria.describedBy()}
        />
      )}
    </FormField>
  );
};

export { TextField };
