/* eslint-disable @typescript-eslint/no-namespace */
import {
  splitProps,
  type JSX,
  createUniqueId,
  Show,
  Match,
  Switch,
} from 'solid-js';

import 'selectlist-polyfill';
import { useFormContext } from '../form';
import { type FormFieldProps } from '../form-field/form-field';
import * as formFieldCss from '../form-field/form-field.module.css';
import { Text } from '../text';

import { tw } from '../tw';
import * as cssStyle from './select-list.module.css';

interface SelectListProps
  extends FormFieldProps,
    Pick<
      JSX.SelectHTMLAttributes<HTMLSelectElement>,
      'class' | 'style' | 'id' | 'name' | 'autocomplete' | 'children'
    > {}

const SelectList = (ownProps: SelectListProps) => {
  const [fieldProps, props] = splitProps(ownProps, [
    'class',
    'style',
    'id',
    'label',
  ]);
  const formContext = useFormContext();
  const localId = createUniqueId();
  const id = () => (fieldProps.label ? fieldProps.id || localId : localId);
  const descriptionId = () => `${id()}-description`;
  const errorMessage = () =>
    props.name ? formContext().validationErrors?.[props.name] : null;
  return (
    <div
      class={tw(formFieldCss.field, fieldProps.class)}
      style={fieldProps.style}
    >
      <x-selectlist
        id={id()}
        attr:name={props.name}
        autocomplete={props.autocomplete}
      >
        <button
          slot="button"
          behavior="button"
          type="button"
          class={tw(formFieldCss.inputWrapper, cssStyle.button)}
        >
          <Show when={fieldProps.label}>
            <Text component="label" class={formFieldCss.label}>
              {fieldProps.label}
            </Text>
          </Show>
          <span
            slot="selected-value"
            behavior="selected-value"
            class={cssStyle.selected}
          />
        </button>
        <div popover slot="listbox" behavior="listbox" class={cssStyle.listbox}>
          {props.children}
        </div>
      </x-selectlist>
      <Switch>
        <Match when={errorMessage()}>
          <span
            id={descriptionId()}
            aria-live="polite"
            class={formFieldCss.description}
          >
            {errorMessage()}
          </span>
        </Match>
        <Match when={props.description}>
          <span id={descriptionId()} class={formFieldCss.description}>
            {props.description}
          </span>
        </Match>
      </Switch>
    </div>
  );
};

const Option = (props: JSX.OptionHTMLAttributes<HTMLOptionElement>) => {
  return <x-option {...props} class={tw(cssStyle.option, props.class)} />;
};

export { SelectList, Option };

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'x-selectlist': JSX.SelectHTMLAttributes<HTMLSelectElement> & {
        'attr:name'?: string;
      };
      'x-option': JSX.OptionHTMLAttributes<HTMLOptionElement>;
    }

    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      behavior?: 'button' | 'listbox' | 'selected-value';
      popover?: true | 'auto' | 'manual';
    }
  }
}
