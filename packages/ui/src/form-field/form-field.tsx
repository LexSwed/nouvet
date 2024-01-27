import {
  createUniqueId,
  Match,
  Show,
  Switch,
  type Accessor,
  type ComponentProps,
  type JSX,
  type JSXElement,
} from 'solid-js';

import { useFormContext } from '../form';
import { Text } from '../text';
import { tw } from '../tw';

import * as cssStyle from './form-field.module.css';

export interface FormFieldProps {
  /** Field label. */
  label?: JSXElement;
  /** Helper text. */
  description?: string;
}
interface FieldInnerProps
  extends FormFieldProps,
    Pick<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'id' | 'style'> {
  /* Name of the input field */
  name?: string;
  children: (ariaProps: {
    id: Accessor<string>;
    describedBy: Accessor<string | undefined>;
  }) => JSX.Element;
}
const FormField = (props: FieldInnerProps) => {
  const formContext = useFormContext();
  const localId = createUniqueId();
  const id = () => props.id || localId;
  const descriptionId = () => `${id()}-description`;
  const errorMessage = () =>
    props.name ? formContext().validationErrors?.[props.name] : null;
  return (
    <div class={tw(cssStyle.field, props.class)} style={props.style}>
      <div class={cssStyle.inputWrapper}>
        <Show when={props.label}>
          <Text as="label" for={id()} with="label-sm" class={cssStyle.label}>
            {props.label}
          </Text>
        </Show>
        {props.children({
          id,
          describedBy: () =>
            errorMessage() || props.description ? descriptionId() : undefined,
        })}
      </div>
      <Switch>
        <Match when={errorMessage()}>
          <span
            id={descriptionId()}
            aria-live="polite"
            class={cssStyle.description}
          >
            {errorMessage()}
          </span>
        </Match>
        <Match when={props.description}>
          <span id={descriptionId()} class={cssStyle.description}>
            {props.description}
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
