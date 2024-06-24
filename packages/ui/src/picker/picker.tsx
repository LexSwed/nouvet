import { children, Show, splitProps, type JSX } from 'solid-js';

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
    ['class', 'style', 'id', 'variant'],
    ['children', 'label'],
  );
  const label = children(() => local.label);
  const child = children(() => local.children);
  return (
    <FormField
      {...fieldProps}
      name={props.name}
      label={
        <Show when={label()}>
          <span class="flex flex-row items-center gap-2">
            {label()}
            <div class="flex h-[1em] items-center">
              <Icon use="carret-up-down" class="size-3" />
            </div>
          </span>
        </Show>
      }
    >
      {(aria) => {
        return (
          <select
            {...props}
            class={cssStyle.input}
            id={aria.id}
            aria-describedby={aria.describedBy}
          >
            <button
              // @ts-expect-error select menu not supported
              type="popover"
              class="flex w-full cursor-default items-center outline-none"
              data-part="trigger"
              style={{ 'anchor-name': `--anchor-${aria.id}` }}
            >
              <selectedoption />
            </button>
            <datalist class={cssStyle.popover}>{child()}</datalist>
          </select>
        );
      }}
    </FormField>
  );
};

const Option = (
  ownProps: JSX.OptionHTMLAttributes<HTMLOptionElement> & {
    label?: JSX.Element;
  },
) => {
  const [local, props] = splitProps(ownProps, ['label', 'children', 'class']);
  return (
    <ListItem
      as="option"
      {...props}
      class={tw('select-none', cssStyle.option, local.class)}
    >
      <div class="flex flex-row items-center gap-2" data-part="label">
        {local.label}
        <Show when={props.value === ''}>
          <span class="sr-only" data-empty-option />
        </Show>
      </div>
      <div data-part="content">{local.children}</div>
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
