import { Title } from '@solidjs/meta';
import { ButtonLink, Card, Icon } from '@nou/ui';

import { createTranslator, T } from '~/i18n';
import { HeroImage } from '~/lib/hero-image';

export default function WWW() {
  const t = createTranslator('www');

  return (
    <>
      <Title>{t('www.meta.main-title')}</Title>
      <section>
        <div class="flex flex-col items-start md:gap-12">
          <h1 class="bg-background bg-main z-10 rounded-2xl py-4 pe-4 text-6xl font-bold [background-attachment:fixed] md:h-[calc(theme(fontSize.6xl)+theme(spacing.4)*2)]">
            <T>{t('www.headline')}</T>
          </h1>
          <div class="flex w-full flex-row sm:gap-8">
            <ButtonLink
              href="/app"
              size="cta"
              link={false}
              class="relative -me-12 mt-16 flex shrink-0 items-center gap-4 self-start text-lg sm:me-0"
            >
              {t('www.cta-start')}
              <Icon use="arrow-circle-up-right" class="h-8 w-8 shrink-0" />
            </ButtonLink>
            <div class="h-full w-[85%] min-w-[320px] overflow-hidden rounded-2xl sm:top-36 sm:w-full lg:absolute lg:right-4 lg:top-4 lg:max-h-[calc(100%-theme(spacing.8))] lg:w-[65%] xl:w-[45%]">
              <HeroImage alt={t('www.hero-image')} />
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="features" class="relative -mt-32 lg:mt-12">
        <h2 class="sr-only" id="features">
          {t('www.heading-features')}
        </h2>
        <ul class="spacing-bleed scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-p-2 flex-row gap-4 overflow-x-auto px-3">
          <li class="min-w-64">
            <Card
              variant="flat"
              class="border-primary-container/20 snap-start rounded-md border-2 p-8"
            >
              {t('www.feature-medical-history')}
            </Card>
          </li>
          <li class="min-w-64">
            <Card
              variant="flat"
              class="border-primary-container/20 snap-start rounded-md border-2 p-8"
            >
              {t('www.feature-share-reminders')}
            </Card>
          </li>
          <li class="min-w-64">
            <Card
              variant="flat"
              class="border-primary-container/20 snap-start rounded-md border-2 p-8"
            >
              {t('www.feature-connect-veterinaries')}
            </Card>
          </li>
        </ul>
      </section>
    </>
  );
}
