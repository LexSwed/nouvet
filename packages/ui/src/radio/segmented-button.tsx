import { children, createUniqueId, Show, splitProps, type JSX } from 'solid-js';

import { Icon } from '../_index';
import { tw } from '../tw';
import { mergeDefaultProps } from '../utils';

import cssStyles from './segmented-button.module.css';

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
    <label class={tw(cssStyles.button, local.class)} style={local.style}>
      <input type="radio" id={id()} {...props} class={tw('sr-only')} />
      <div class={tw(cssStyles.iconWrapper)}>
        <Icon use="check" class={tw(cssStyles.icon)} />
        <Show when={icon()}>
          <span class={tw(cssStyles.customIcon)}>{icon()}</span>
        </Show>
      </div>
      <span class={cssStyles.label}>{label()}</span>
    </label>
  );
};

export { SegmentedButton };
