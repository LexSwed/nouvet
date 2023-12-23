import { A } from '@solidjs/router';
import { type JSX } from 'solid-js';
import { Icon } from './ui/icon';
import { tw } from './ui/tw';

function LogoLink(props: {
  label: string;
  class?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>['class'];
}) {
  return (
    <A
      href="/"
      aria-label={props.label}
      title={props.label}
      class={tw('flex flex-row items-center gap-4', props.class)}
    >
      <Icon use="nouvet" class="h-14 w-14" />
      <span class="hidden text-lg sm:inline-block">{props.label}</span>
    </A>
  );
}

export { LogoLink };
