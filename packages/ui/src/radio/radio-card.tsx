import { children, createUniqueId, Show, splitProps, type JSX } from 'solid-js';

import { Text } from '../text';
import { tw } from '../tw';

import * as cssStyle from './radio-card.module.css';

interface RadioCardProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  name: string;
  label: JSX.Element;
  icon?: JSX.Element;
  children?: JSX.Element;
}

const RadioCard = (ownProps: RadioCardProps) => {
  const [local, props] = splitProps(ownProps, [
    'class',
    'style',
    'id',
    'label',
    'icon',
    'children',
  ]);
  const localId = createUniqueId();
  const id = () => local.id || localId;
  const icon = children(() => local.icon);
  const label = children(() => local.label);
  const child = children(() => local.children);
  return (
    <div class={tw(cssStyle.card, local.class)} style={local.style}>
      <input type="radio" id={id()} {...props} class={'sr-only'} />
      <label class={cssStyle.wrapper} for={id()}>
        <Show when={icon.toArray().length > 0}>
          <div class={cssStyle.icon}>{icon()}</div>
        </Show>
        <Text with="label" class={cssStyle.label}>
          {label()}
        </Text>
      </label>
      {child()}
    </div>
  );
};

export { RadioCard };
