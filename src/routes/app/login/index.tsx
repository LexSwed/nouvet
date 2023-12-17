import { Title } from '@solidjs/meta';
import { createSignal, onCleanup } from 'solid-js';

import chevronLeft from '~/assets/icons/chevron-left.svg';
import { createTranslator } from '~/i18n';
import { HeroImage } from '~/lib/hero-image';
import { LogoLink } from '~/lib/logo-link';
import { ButtonLink } from '~/lib/ui/button';
import { Icon } from '~/lib/ui/icon';

function AppLoginPage() {
  const t = createTranslator('login');
  const [loading, setLoading] = createSignal(false);

  const onClick = () => {
    setLoading(true);
    onCleanup(() => {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1000);
      clearTimeout(timeout);
    });
  };

  return (
    <>
      <Title>{t('login.meta.title')}</Title>
      <div class="flex min-h-full flex-col gap-12 bg-main pb-8 pt-4">
        <header class="container">
          <LogoLink label={t('common.link-home')!} />
        </header>
        <section class="container flex h-full flex-[2] flex-col items-center gap-12">
          <div class="flex max-w-2xl flex-col gap-8">
            {/* TODO: Replace with carousel of app features with screenshots */}
            <HeroImage
              alt={t('login.hero-image')}
              class="aspect-square w-full rounded-2xl"
            />
            <ButtonLink
              href="/api/auth/facebook"
              class="flex items-center gap-3 !bg-[#1877F2]"
              size="lg"
              link={false}
              loading={!loading()}
              onClick={onClick}
            >
              <img src="/assets/facebook.svg" class="h-8 w-8" alt="" />
              {t('login.with-facebook')}
            </ButtonLink>
          </div>
          <ButtonLink
            href="/"
            class="mt-auto h-16 w-16 rounded-full border-2 border-outline p-0"
            variant="ghost"
          >
            <Icon icon={chevronLeft} size="xl" />
          </ButtonLink>
        </section>
      </div>
    </>
  );
}

export default AppLoginPage;
