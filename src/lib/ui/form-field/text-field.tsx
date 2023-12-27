import {
  splitProps,
  type JSX,
  Show,
  createUniqueId,
  Match,
  Switch,
} from 'solid-js';
import { mergeDefaultProps } from '../../merge-default-props';
import { tw } from '../tw';

import { useFormContext } from './form';
import * as cssStyle from './text-field.module.css';

export interface TextFieldProps
  extends JSX.InputHTMLAttributes<HTMLInputElement> {
  /**
   * @default 'text'
   */
  type?: JSX.InputHTMLAttributes<HTMLInputElement>['type'];
  /** Field label. */
  label?: string;
  /** Helper text. */
  description?: string;
}
const TextField = (ownProps: TextFieldProps) => {
  const formContext = useFormContext();
  const [styles, local, props] = splitProps(
    mergeDefaultProps({ type: 'text' }, ownProps),
    ['class', 'style'],
    ['label', 'id'],
  );
  const localId = createUniqueId();
  const id = () => (local.label ? local.id || localId : localId);
  const descriptionId = () => `${id()}-description`;
  const errorMessage = () =>
    ownProps.name ? formContext().validationErrors?.[ownProps.name] : null;
  return (
    <div class={tw(cssStyle.field, styles.class)} style={styles.style}>
      <Show when={local.label}>
        <label for={id()} class={cssStyle.label}>
          {local.label}
        </label>
      </Show>
      <input
        {...props}
        class={cssStyle.input}
        id={id()}
        aria-describedby={
          errorMessage() || props.description ? descriptionId() : undefined
        }
      />
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

export { TextField };
