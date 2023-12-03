import { As } from '@kobalte/core';
import { A, type RouteSectionProps } from '@solidjs/router';
import { For } from 'solid-js';

import nouvetIcon from '~/assets/icons/nouvet.svg';
import packageIcon from '~/assets/icons/package.svg';
import scrollIcon from '~/assets/icons/scroll.svg';

import { Button } from '~/lib/ui/button';
import { Icon } from '~/lib/ui/icon';
import { NavCard } from '~/lib/ui/nav-card';
import { createTranslator } from '~/lib/utils/t';

export default function Home(props: RouteSectionProps) {
  const t = createTranslator('www');

  const items: Array<{ label: string; icon: string; href: string }> = [
    {
      href: '/#features',
      label: t('www.features')!,
      icon: packageIcon,
    },
    {
      href: '/about',
      label: t('www.link-about-the-project')!,
      icon: nouvetIcon,
    },
    {
      href: '/privacy',
      label: t('www.link-privacy-policy')!,
      icon: scrollIcon,
    },
  ];
  return (
    <div class="min-h-full bg-gradient-to-br from-primary/5 to-tertiary/5 pb-8 pt-4">
      <header class="container flex flex-col gap-4">
        <div class="flex flex-row items-center justify-between">
          <A
            href="/"
            aria-label={t('www.link-home')}
            title={t('www.link-home')}
            class="-m-4 p-4"
          >
            <Icon icon={nouvetIcon} class="h-12 w-12" />
          </A>
          <Button asChild>
            <As component={A} href="/family">
              {t('www.open-family-app')}
            </As>
          </Button>
        </div>
        <nav>
          <ul class="spacing-bleed flex snap-x snap-mandatory flex-row gap-2 overflow-x-auto p-2 scrollbar-none">
            <For each={items}>
              {(item) => (
                <li class="shrink-0">
                  <NavCard
                    href={item.href}
                    class="flex min-w-[8rem] flex-col place-items-start gap-2 font-medium"
                  >
                    <Icon size="lg" icon={item.icon} class="text-primary" />
                    {item.label}
                  </NavCard>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </header>
      <main class="container mt-8 flex flex-col gap-8">TODO</main>
    </div>
  );
}
