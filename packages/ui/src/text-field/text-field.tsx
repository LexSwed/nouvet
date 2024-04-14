import { splitProps, type JSX } from 'solid-js';

import { FormField, type FormFieldProps } from '../form-field';
import { mergeDefaultProps } from '../utils';

import * as cssStyle from './text-field.module.css';

export interface TextFieldProps
  extends FormFieldProps,
    JSX.InputHTMLAttributes<HTMLInputElement> {
  suffix?: JSX.Element;
}
const TextField = (ownProps: TextFieldProps) => {
  const [fieldProps, props] = splitProps(
    mergeDefaultProps(ownProps, { type: 'text' }),
    [
      'class',
      'style',
      'id',
      'label',
      'description',
      'variant',
      'prefix',
      'suffix',
    ],
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
