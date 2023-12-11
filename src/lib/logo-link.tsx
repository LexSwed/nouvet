import { A } from '@solidjs/router';
import { type JSX } from 'solid-js';
import { Icon } from './ui/icon';
import { tw } from './ui/tw';
import nouvetIcon from '~/assets/icons/nouvet.svg';

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
      <Icon icon={nouvetIcon} class="h-14 w-14" />
      <span class="hidden text-lg sm:inline-block">{props.label}</span>
    </A>
  );
}

export { LogoLink };
