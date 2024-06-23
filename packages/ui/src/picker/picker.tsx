import { Show, splitProps, type JSX } from 'solid-js';

import { FormField, type FormFieldProps } from '../form-field';
import { Icon } from '../icon/icon';
import { ListItem } from '../menu/list-item';
import { tw } from '../tw';

import * as cssStyle from './picker.module.css';

interface PickerProps
  extends FormFieldProps,
    JSX.SelectHTMLAttributes<HTMLSelectElement> {}

const Picker = (ownProps: PickerProps) => {
  const [fieldProps, local, props] = splitProps(
    ownProps,
    ['class', 'style', 'id', 'label'],
    ['children'],
  );
  return (
    <FormField
      {...fieldProps}
      label={
        fieldProps.label ? (
          <span class="flex flex-row items-center gap-2">
            {fieldProps.label}
            <div class="flex h-[1em] items-center">
              <Icon use="carret-up-down" class="size-3" />
            </div>
          </span>
        ) : null
      }
      name={props.name}
    >
      {(aria) => {
        return (
          <select
            {...props}
            class={cssStyle.input}
            id={aria.id()}
            aria-describedby={aria.describedBy()}
          >
            <button
              // @ts-expect-error select menu not supported
              type="popover"
              class="flex w-full cursor-default items-center outline-none"
              data-part="trigger"
              style={{ 'anchor-name': `--anchor-${aria.id()}` }}
            >
              <selectedoption />
            </button>
            <datalist class={cssStyle.popover}>{local.children}</datalist>
          </select>
        );
      }}
    </FormField>
  );
};

const Option = (props: JSX.OptionHTMLAttributes<HTMLOptionElement>) => {
  return (
    <ListItem
      as="option"
      {...props}
      class={tw('select-none', cssStyle.option, props.class)}
    >
      {props.children}
      <Show when={props.value === ''}>
        <span class="sr-only" data-empty-option />
      </Show>
    </ListItem>
  );
};

export { Picker, Option };

/* eslint-disable @typescript-eslint/no-namespace */
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      selectedoption: HTMLAttributes<HTMLElement>;
    }
  }
}
