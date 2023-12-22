import { splitProps, type JSX, Show, createUniqueId } from 'solid-js';
import { tw } from './tw';
import { mergeDefaultProps } from '../merge-default-props';

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

const TextField = (ownProps: TextFieldProps) => {
  const [styles, local, props] = splitProps(
    mergeDefaultProps({ type: 'text' }, ownProps),
    ['class', 'style'],
    ['label', 'id'],
  );
  const localId = createUniqueId();
  const id = () => local.id || localId;
  return (
    <div
      class={tw('group/field relative inline-flex', styles.class)}
      style={styles.style}
    >
      <div class="pointer-events-none absolute inset-0 flex flex-row pt-4 transition-all">
        <div class="rounded-s-lg bg-surface ps-2 transition-colors group-has-[:focus-within]/field:bg-primary-container/30 group-has-[:hover]/field:bg-primary-container/30" />
        <div class="mt-2 w-fit bg-surface transition-colors group-has-[:focus-within]/field:bg-primary-container/30 group-has-[:hover]/field:bg-primary-container/30">
          <Show when={local.label}>
            <label
              for={id()}
              class="pointer-events-auto block -translate-y-6 px-2 py-1 text-sm text-on-surface"
            >
              {local.label}
            </label>
          </Show>
        </div>
        <div class="flex-[2] rounded-e-lg bg-surface pe-2 transition-colors group-has-[:focus-within]/field:bg-primary-container/30 group-has-[:hover]/field:bg-primary-container/30" />
      </div>
      <input
        {...props}
        class="relative bg-transparent px-3 pb-2 pt-8 outline-none"
        id={id()}
      />
    </div>
  );
};

export { TextField };
