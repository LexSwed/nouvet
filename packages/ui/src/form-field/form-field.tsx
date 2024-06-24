import {
  children,
  createMemo,
  createUniqueId,
  Match,
  Show,
  splitProps,
  Switch,
  type ComponentProps,
  type JSX,
  type JSXElement,
} from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { useFormContext } from '../form';
import { Text } from '../text';
import { tw } from '../tw';

import * as cssStyle from './form-field.module.css';

export const formFieldVariants = cva(cssStyle.wrapper, {
  variants: {
    variant: {
      underline: cssStyle['wrapperUnderline'],
      ghost: cssStyle['wrapperGhost'],
    },
    textSize: {
      base: cssStyle['sizeBase'],
      lg: cssStyle['sizeLg'],
    },
  },
  defaultVariants: {
    variant: 'underline',
    textSize: 'base',
  },
});

export interface FormFieldProps extends VariantProps<typeof formFieldVariants> {
  /** Field label. */
  label?: JSXElement;
  /** Helper text. */
  description?: string;
}
interface FieldInnerProps
  extends FormFieldProps,
    Pick<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'id' | 'style'> {
  /* Name of the input field to assign validation description */
  name?: string;
  children: (ariaProps: {
    id: string;
    describedBy: string | undefined;
  }) => JSX.Element;
  /** Prefix text or an icon */
  prefix?: JSX.Element;
  /** Prefix text or an icon */
  suffix?: JSX.Element;
}
const FormField = (ownProps: FieldInnerProps) => {
  const formContext = useFormContext();
  const [local, props] = splitProps(ownProps, ['variant', 'textSize']);
  const localId = createUniqueId();

  const aria = {
    get id() {
      return props.id || localId;
    },
    get describedBy() {
      return `${aria.id}-description`;
    },
  };

  const errorMessage = () =>
    props.name ? formContext().validationErrors?.[props.name] : null;
  const prefix = children(() => props.prefix);
  const suffix = children(() => props.suffix);
  const label = children(() => props.label);
  const description = children(() => props.description);
  const child = createMemo(() => props.children(aria));
  return (
    <div class={tw(cssStyle.field, props.class)} style={props.style}>
      <div class={formFieldVariants(local)}>
        <Show when={label()}>
          <Text as="label" for={aria.id} with="label-sm" class={cssStyle.label}>
            {label()}
          </Text>
        </Show>
        <div class={cssStyle.inputWrapper}>
          <Show when={prefix()}>
            <label for={aria.id} class={cssStyle.prefix}>
              {prefix()}
            </label>
          </Show>
          {child()}
          <Show when={suffix()}>
            <label for={aria.id} class={cssStyle.suffix}>
              {suffix()}
            </label>
          </Show>
        </div>
      </div>
      <Switch>
        <Match when={errorMessage()}>
          <span
            id={aria.describedBy}
            aria-live="polite"
            class={cssStyle.description}
          >
            {errorMessage()}
          </span>
        </Match>
        <Match when={description()}>
          <span id={aria.describedBy} class={cssStyle.description}>
            {description()}
          </span>
        </Match>
      </Switch>
    </div>
  );
};

const Fieldset = (props: ComponentProps<'fieldset'>) => {
  return <fieldset {...props} class={tw(cssStyle.fieldset, props.class)} />;
};

export { FormField, Fieldset };
