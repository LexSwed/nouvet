import { type RouteDefinition } from '@solidjs/router';
import { For, Show, type ParentProps } from 'solid-js';
import { Icon, NavCard, type SvgIcons } from '@nou/ui';

import { cacheTranslations, createTranslator } from '~/server/i18n';

import { LogoLink } from '~/lib/logo-link';

export const route = {
  load() {
    cacheTranslations('www');
  },
} satisfies RouteDefinition;

export default function WWWLayout(props: ParentProps) {
  const t = createTranslator('www');

  const items: Array<{ label: string; icon: SvgIcons; href: string }> = [
    {
      href: '/#features',
      label: t('features')!,
      icon: 'package',
    },
    {
      href: '/about',
      label: t('link-about-the-project')!,
      icon: 'nouvet',
    },
    // {
    //   href: '/privacy',
    //   label: t('link-privacy-policy')!,
    //   icon: scrollIcon,
    // },
  ];
  return (
    <div class="bg-main min-h-full pb-8 pt-4">
      <header class="container flex flex-col gap-4">
        <div class="flex flex-row items-center">
          <LogoLink class="-m-4 p-4" />
        </div>
        <nav>
          <ul class="scrollbar-none -mx-4 flex snap-x snap-mandatory flex-row gap-2 overflow-x-auto p-2 sm:-mx-2">
            <For each={items}>
              {(item) => (
                <li class="shrink-0">
                  <NavCard
                    href={item.href}
                    class="flex min-w-32 flex-col place-items-start gap-2 p-3"
                  >
                    <Icon size="sm" use={item.icon} class="text-primary" />
                    {item.label}
                  </NavCard>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </header>
      <main class="container mt-8 flex flex-col gap-8">{props.children}</main>
    </div>
  );
}
