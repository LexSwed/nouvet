import { Title } from '@solidjs/meta';
import ArrowCircleUpRight from '~/assets/icons/arrow-circle-up-right.svg';
import { T, createTranslator } from '~/i18n';
import { ButtonLink } from '~/lib/ui/button';
import { Card } from '~/lib/ui/card';

import { Icon } from '~/lib/ui/icon';

export default function WWW() {
  const t = createTranslator('www');

  return (
    <>
      <Title>{t('www.meta.main-title')}</Title>
      <section>
        <div class="flex flex-col gap-12">
          <h1 class="text-6xl font-bold">
            <T>{t('www.headline')}</T>
          </h1>
          <div class="flex flex-row sm:gap-8">
            <ButtonLink
              href="/family"
              size="cta"
              class="relative -me-12 mt-16 flex items-center gap-4 self-start text-lg sm:me-0"
            >
              {t('www.cta-start')}
              <Icon icon={ArrowCircleUpRight} class="h-8 w-8 shrink-0" />
            </ButtonLink>
            <div class="-mb-36 h-full w-[85%] min-w-[320px] overflow-hidden rounded-2xl sm:top-36 sm:w-full lg:absolute lg:right-4 lg:top-4 lg:max-h-[calc(100%-theme(spacing.8))] lg:w-[40%]">
              <img
                src="https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                class="aspect-[9/12] h-full w-full bg-primary/5 object-cover"
                alt={t('www.hero-image')}
              />
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="features" class="">
        <h2 class="sr-only" id="features">
          {t('www.heading-features')}
        </h2>
        <ul class="spacing-bleed -mx-4 flex snap-x snap-mandatory scroll-p-2 flex-row gap-4 overflow-x-auto p-2 scrollbar-none">
          <li class="min-w-[16rem]">
            <Card
              variant="flat"
              class="snap-start rounded-md border-2 border-background bg-surface/80 bg-gradient-to-tl from-secondary-container/10 to-tertiary-container/10 p-12 backdrop-blur-sm"
            >
              {t('www.feature-medical-history')}
            </Card>
          </li>
          <li class="min-w-[16rem]">
            <Card
              variant="flat"
              class="snap-start rounded-md border-2 border-background bg-surface/80 bg-gradient-to-tl from-secondary-container/10 to-tertiary-container/10 p-12 backdrop-blur-sm"
            >
              {t('www.feature-share-reminders')}
            </Card>
          </li>
          <li class="min-w-[16rem]">
            <Card
              variant="flat"
              class="snap-start rounded-md border-2 border-background bg-surface/80 bg-gradient-to-tl from-secondary-container/10 to-tertiary-container/10 p-12 backdrop-blur-sm"
            >
              {t('www.feature-connect-veterinaries')}
            </Card>
          </li>
        </ul>
      </section>
    </>
  );
}
