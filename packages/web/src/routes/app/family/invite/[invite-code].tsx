import { Title } from '@solidjs/meta';
import {
  A,
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Button, ButtonLink, Icon, Text } from '@nou/ui';

import { checkFamilyInvite } from '~/server/api/family-invite';
import { getUserProfile } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AccountMenu } from '~/lib/account-menu';
import { FamilyInviteBenefits } from '~/lib/family-invite-benefits';
import { HeroImage } from '~/lib/hero-image';

export const route = {
  load(route) {
    const code = route.params['invite-code'];
    return Promise.all([
      cacheTranslations('invited'),
      getUserProfile(),
      checkFamilyInvite(code),
    ]);
  },
} satisfies RouteDefinition;

const InviteAcceptPage = (props: RouteSectionProps) => {
  const code = props.params['invite-code'];
  const t = createTranslator('invited');
  const user = createAsync(() => getUserProfile());
  const invite = createAsync(() => checkFamilyInvite(code));
  return (
    <>
      <Title>{t('meta.title')}</Title>
      <div class="bg-main grid min-h-full grid-cols-12 grid-rows-[auto,1fr] gap-6 p-6">
        <header class="z-10 col-start-1 col-end-[-1] row-[1] flex flex-row items-center justify-between gap-8 md:col-start-1 md:col-end-6">
          <div class="flex flex-row items-center">
            <A href="/app" class="group -m-4 flex items-center gap-4 p-4">
              <Icon
                use="nouvet"
                class="size-14 duration-200 group-hover:-rotate-6"
              />
              <Text with="body-lg">{t('logo-label')}</Text>
            </A>
          </div>
          <Suspense>
            <Show when={user()}>
              {(user) => (
                <AccountMenu
                  name={user().name || ''}
                  avatarUrl={user().avatarUrl}
                />
              )}
            </Show>
          </Suspense>
        </header>
        <main class="col-start-1 col-end-[-1] flex flex-col gap-8 md:row-[1/-1] md:grid md:grid-cols-12 md:grid-rows-subgrid md:items-center">
          <Switch>
            <Match when={invite()}>
              <div class="bg-background bg-main z-10 col-span-6 col-start-1 row-[2] flex flex-col gap-6 rounded-3xl [background-attachment:fixed] sm:p-6 lg:col-span-5 lg:col-start-2">
                <Text with="headline-1">
                  {invite()!.inviterName
                    ? t('accept-invite.heading', {
                        inviterName: invite()!.inviterName!,
                      })
                    : t('accept-invite.heading.no-name')}
                </Text>
                <Text as="p">{t('accept-invite.description')}</Text>
                <FamilyInviteBenefits class="flex-col overflow-auto *:w-full" />
                <div class="flex items-stretch justify-between gap-2 sm:flex-row">
                  <ButtonLink
                    href="/app"
                    class="shrink-0 gap-2"
                    variant="outline"
                  >
                    <Icon use="chevron-left" class="-ms-2" />{' '}
                    {t('accept-invite.cta-cancel')}
                  </ButtonLink>
                  <Button class="w-full rounded-full">
                    {t('accept-invite.cta-join')}
                  </Button>
                </div>
              </div>

              <div class="col-span-7 col-end-[-1] row-[1/-1] ms-auto hidden h-full max-h-[500px] overflow-hidden rounded-3xl md:block md:max-h-[calc(100vh-theme(spacing.6)*2)]">
                <HeroImage
                  alt=""
                  class="ms-auto size-full max-w-[400px] rounded-3xl object-cover object-center md:max-w-full"
                />
              </div>
            </Match>
            <Match when={!invite()}>
              <div class="bg-background bg-main z-10 col-span-5 col-start-1 row-[2] flex flex-col gap-6 rounded-3xl p-4 [background-attachment:fixed] sm:w-[clamp(340px,100%,480px)] lg:col-start-2">
                <Text with="headline-1">{t('expired.heading')}</Text>
                <Text as="p">{t('expired.description')}</Text>
                <ButtonLink
                  href="/app"
                  class="gap-2 self-end"
                  variant="outline"
                >
                  <Icon use="chevron-left" class="-ms-2" /> {t('expired.cta')}
                </ButtonLink>
              </div>

              <div class="col-span-7 col-end-[-1] row-[1/-1] ms-auto w-[clamp(320px,100%,90svw)] self-start rounded-3xl">
                <img
                  src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg?w=600&format=webp&imagetools"
                  alt=""
                  class="bg-primary/5 w-full rounded-3xl object-cover"
                />
              </div>
            </Match>
          </Switch>
        </main>
      </div>
    </>
  );
};

export default InviteAcceptPage;
