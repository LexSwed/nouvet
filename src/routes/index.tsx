import { As } from '@kobalte/core';
import { resolveTemplate, translator } from '@solid-primitives/i18n';
import { A, type RouteSectionProps, createAsync } from '@solidjs/router';
import { getDictionary } from '~/i18n/i18n';
import { Button } from '~/lib/ui/button';

const createTranslator = (props: RouteSectionProps) => {
  const dict = createAsync(() => getDictionary('en', 'www'));

  return translator(dict, resolveTemplate);
};

export default function Home(props: RouteSectionProps) {
  const t = createTranslator(props);
  return (
    <main class="min-h-full bg-gradient-to-br from-primary/5 to-tertiary/5 pb-8 pt-4">
      <h1 class="max-6-xs my-16 text-6xl font-thin uppercase text-sky-700">
        Hello world!
      </h1>
      <p class="mt-8">{t('common.meta.title')}</p>
      <p class="my-4">
        <span>Home</span>
        {' - '}
        <Button size="cta" class="text-lg" asChild>
          <As component={A} href="/about">
            {t('www.cta-start')}
          </As>
        </Button>
      </p>
    </main>
  );
}
