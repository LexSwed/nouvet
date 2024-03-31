import { A } from '@solidjs/router';
import { Show, type JSX } from 'solid-js';
import { Icon, tw } from '@nou/ui';

function LogoLink(props: {
  class?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>['class'];
  label?: string;
}) {
  return (
    <A
      href="/"
      aria-label={props.label}
      title={props.label}
      class={tw('flex flex-row items-center gap-4', props.class)}
    >
      <Icon use="nouvet" class="size-14" />
      <Show when={props.label}>
        <span class="hidden text-lg sm:inline-block">{props.label}</span>
      </Show>
    </A>
  );
}

export { LogoLink };
