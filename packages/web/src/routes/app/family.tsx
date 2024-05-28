import { Title } from '@solidjs/meta';
import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Button, ButtonLink, Card, Divider, Icon, Image, Text } from '@nou/ui';

import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator, T } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';

export const route = {
  load() {
    void cacheTranslations('family');
    void getUserFamily();
  },
} satisfies RouteDefinition;

function FamilyPage(props: RouteSectionProps) {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  return (
    <>
      <Title>
        <Show when={user()?.family?.name} fallback={t('meta.title-new-user')}>
          {(familyName) => (
            <>
              {t('meta.title', {
                familyName: familyName(),
              })}
            </>
          )}
        </Show>
      </Title>
      <div class="bg-background min-h-full">
        <AppHeader>
          <ButtonLink href="/app" icon variant="ghost">
            <Icon use="chevron-left" />
          </ButtonLink>
        </AppHeader>
        <Suspense>
          <Switch>
            <Match when={user()?.family}>{props.children}</Match>
            <Match when={user() && !user()!.family}>
              <DiscoveredFamilyFeature />
            </Match>
          </Switch>
        </Suspense>
        <Suspense>
          <FamilyInviteDialog id="family-invite" />
        </Suspense>
      </div>
    </>
  );
}

export default FamilyPage;

function DiscoveredFamilyFeature() {
  const t = createTranslator('family');
  return (
    <>
      <section aria-labelledby="no-family-headline" class="container">
        <Card class="bg-main flex flex-col gap-12 sm:p-8 md:flex-row">
          <div class="flex h-full max-w-[700px] flex-col justify-between gap-6">
            <Text as="h1" with="headline-1" id="no-family-headline">
              {t('family-feature.headline')}
            </Text>
            <Text as="p">{t('family-feature.description')}</Text>
            <ul class="bg-surface flex flex-col gap-3 rounded-2xl p-3">
              <Text as="li">
                <T>{t('family-feature.1')}</T>
              </Text>
              <Divider />
              <Text as="li">
                <T>{t('family-feature.2')}</T>
              </Text>
              <Divider />
              <Text as="li">
                <T>{t('family-feature.3')}</T>
              </Text>
              <Divider />
              <Text as="li">
                <T>{t('family-feature.4')}</T>
              </Text>
            </ul>
            <Button class="w-[300px] self-center" popoverTarget="family-invite">
              {t('invite-cta')}
            </Button>
          </div>
          <Image
            src="/assets/images/alec-favale-Ivzo69e18nk-unsplash.jpg"
            alt=""
            aspectRatio="auto"
            width={600}
            class="-my-4 -me-4 hidden rounded-2xl md:block"
          />
        </Card>
      </section>
    </>
  );
}
