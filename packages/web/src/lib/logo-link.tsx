import { A } from '@solidjs/router';
import { type JSX } from 'solid-js';
import { Icon, tw } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

function LogoLink(props: {
  class?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>['class'];
}) {
  const t = createTranslator('common');
  const label = t('link-home');
  return (
    <A
      href="/"
      aria-label={label}
      title={label}
      class={tw('flex flex-row items-center gap-4', props.class)}
    >
      <Icon use="nouvet" class="size-14" />
      <span class="hidden text-lg sm:inline-block">{label}</span>
    </A>
  );
}

export { LogoLink };
