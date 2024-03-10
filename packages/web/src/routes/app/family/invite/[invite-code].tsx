import { Title } from '@solidjs/meta';
import {
  A,
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Match, Switch } from 'solid-js';
import { ButtonLink, Icon, Text } from '@nou/ui';

import { checkFamilyInvite } from '~/server/api/family-invite';
import { cacheTranslations, createTranslator } from '~/server/i18n';

export const route = {
  load(route) {
    const code = route.params['invite-code'];
    return Promise.all([cacheTranslations('invited'), checkFamilyInvite(code)]);
  },
} satisfies RouteDefinition;

const InviteAcceptPage = (props: RouteSectionProps) => {
  const code = props.params['invite-code'];
  const t = createTranslator('invited');
  const invite = createAsync(() => checkFamilyInvite(code), {
    deferStream: false,
  });
  return (
    <>
      <Title>{t('meta.title')}</Title>
      <div class="bg-main grid min-h-full grid-cols-[1fr] grid-rows-[auto,1fr] gap-4 p-4">
        <header class="container z-10 col-[1] row-[1] flex flex-col gap-4">
          <div class="flex flex-row items-center">
            <A href="/app" class="group -m-4 flex items-center gap-4 p-4">
              <Icon
                use="nouvet"
                class="size-14 duration-200 group-hover:-rotate-6"
              />
              <Text with="body-lg">{t('logo-label')}</Text>
            </A>
          </div>
        </header>
        <main class="col-[1] flex flex-col md:row-[1/-1] md:grid md:grid-cols-12 md:grid-rows-subgrid md:items-center">
          <Switch>
            <Match when={!invite()}>
              <div class="bg-background bg-main z-10 col-start-2 row-[2] flex w-[clamp(320px,100%,380px)] flex-col gap-6 rounded-3xl p-4 [background-attachment:fixed]">
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

              <div class="col-span-7 col-end-[-1] row-[1/-1] ms-auto w-[clamp(320px,100%,90svw)] self-start rounded-3xl md:mt-24">
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
