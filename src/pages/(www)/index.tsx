import { Title } from '@solidjs/meta';
import ArrowCircleUpRight from '~/assets/icons/arrow-circle-up-right.svg';
import { T, createTranslator } from '~/i18n';
import { HeroImage } from '~/lib/hero-image';
import { ButtonLink } from '~/lib/ui/button';
import { Card } from '~/lib/ui/card';

import { Icon } from '~/lib/ui/icon';

export default function WWW() {
  const t = createTranslator('www');

  return (
    <>
      <Title>{t('www.meta.main-title')}</Title>
      <section>
        <div class="flex flex-col items-start md:gap-12">
          <h1 class="z-10 rounded-2xl bg-background bg-main py-4 pe-4 text-6xl font-bold [background-attachment:fixed] md:h-[calc(theme(fontSize.6xl)+theme(spacing.4)*2)]">
            <T>{t('www.headline')}</T>
          </h1>
          <div class="flex flex-row sm:gap-8">
            <ButtonLink
              href="/family"
              size="cta"
              link={false}
              class="relative -me-12 mt-16 flex items-center gap-4 self-start text-lg sm:me-0"
            >
              {t('www.cta-start')}
              <Icon icon={ArrowCircleUpRight} class="h-8 w-8 shrink-0" />
            </ButtonLink>
            <div class="-mb-36 h-full w-[85%] min-w-[320px] overflow-hidden rounded-2xl sm:top-36 sm:w-full lg:absolute lg:right-4 lg:top-4 lg:max-h-[calc(100%-theme(spacing.8))] lg:w-[65%] xl:w-[45%]">
              <HeroImage alt={t('www.hero-image')} />
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
