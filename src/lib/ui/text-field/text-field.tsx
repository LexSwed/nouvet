import { splitProps, type JSX, Show, createUniqueId } from 'solid-js';
import { tw } from '../tw';
import { mergeDefaultProps } from '../../merge-default-props';

import cssStyle from './text-field.module.css';

export interface TextFieldProps
  extends JSX.InputHTMLAttributes<HTMLInputElement> {
  /**
   * @default 'text'
   */
  type?: JSX.InputHTMLAttributes<HTMLInputElement>['type'];
  /**
   * Field label
   */
  label?: string;
}
console.log(cssStyle);
const TextField = (ownProps: TextFieldProps) => {
  const [styles, local, props] = splitProps(
    mergeDefaultProps({ type: 'text' }, ownProps),
    ['class', 'style'],
    ['label', 'id'],
  );
  const localId = createUniqueId();
  const id = () => (local.label ? local.id || localId : localId);
  return (
    <div class={tw(cssStyle.field, styles.class)} style={styles.style}>
      <Show when={local.label}>
        <label for={id()} class={cssStyle.label}>
          {local.label}
        </label>
      </Show>
      <input {...props} class={cssStyle.input} id={id()} />
    </div>
  );
};

export { TextField };
