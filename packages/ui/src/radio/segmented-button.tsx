import { children, createUniqueId, Show, splitProps, type JSX } from 'solid-js';

import { Icon } from '../_index';
import { tw } from '../tw';
import { mergeDefaultProps } from '../utils';

type RadioButtonProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children'
> & {
  name: string;
  label: JSX.Element;
  icon?: JSX.Element;
};
/** Segmented buttons help people select options, switch views, or sort elements */
const SegmentedButton = (ownProps: RadioButtonProps) => {
  const [local, props] = splitProps(
    mergeDefaultProps(ownProps, { size: 'sm' }),
    ['class', 'style', 'id', 'label', 'icon', 'size'],
  );
  const localId = createUniqueId();
  const id = () => local.id || localId;
  const icon = children(() => local.icon);
  const label = children(() => local.label);
  return (
    <label
      class={tw(
        'flex gap-2 select-none border px-5 h-10 items-center outline-primary rounded-full transition-all duration-200 intent:bg-surface-container',
        'first-of-type:[&:not(:last-of-type)]:rounded-se-none first-of-type:[&:not(:last-of-type)]:rounded-ee-none last-of-type:[&:not(:first-of-type)]:rounded-ss-none last-of-type:[&:not(:first-of-type)]:rounded-es-none [&:not(:first-of-type)]:-ms-[1px] ',
        'has-[:focus-visible]:focus-within:outline has-[:focus-visible]:focus-within:outline-2 has-[:focus-visible]:focus-within:outline-offset-2 has-[input:checked]:bg-secondary-container has-[input:checked]:text-on-secondary-container',
        local.class,
      )}
      style={local.style}
    >
      <input type="radio" id={id()} {...props} class={tw('sr-only peer')} />
      <Icon
        use="check"
        class="-ms-2 size-[1.25em] opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
      />
      <Show when={icon()}>
        <span class="contents transition-opacity duration-150 peer-checked:opacity-0">
          {icon()}
        </span>
      </Show>
      <span class="-translate-x-2 text-sm transition-transform duration-200 ease-out peer-checked:translate-x-0">
        {label()}
      </span>
    </label>
  );
};

export { SegmentedButton };
