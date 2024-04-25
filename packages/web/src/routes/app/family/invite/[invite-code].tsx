import { Title } from '@solidjs/meta';
import {
  A,
  createAsync,
  useSubmission,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Button, ButtonLink, Card, Form, Icon, Image, Text } from '@nou/ui';

import {
  checkFamilyInvite,
  joinFamilyWithLink,
} from '~/server/api/family-invite';
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
  const userInvite = createAsync(() => checkFamilyInvite(code));
  // TODO: user is already part of a family

  const joinSubmission = useSubmission(joinFamilyWithLink);
  const invite = () => {
    const invite = userInvite();
    return invite && 'invite' in invite ? invite.invite : null;
  };
  const alreadyInFamily = () => {
    const invite = userInvite();
    return invite && 'reason' in invite ? invite.reason === 100 : false;
  };
  const failed = () => {
    const invite = userInvite();
    return invite && 'failed' in invite && invite.failed;
  };

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
          <Suspense>
            <Switch>
              <Match when={alreadyInFamily()}>
                <div class="bg-background bg-main z-10 col-span-5 col-start-1 row-[2] flex flex-col gap-6 rounded-3xl p-4 [background-attachment:fixed] sm:w-[clamp(340px,100%,480px)] lg:col-start-2">
                  <Text with="headline-1">
                    {t('already-in-family.heading')}
                  </Text>
                  <Text as="p">{t('already-in-family.description')}</Text>
                  <ButtonLink
                    href="/app/family"
                    class="gap-2 self-end"
                    variant="outline"
                  >
                    <Icon use="chevron-left" class="-ms-2" />{' '}
                    {t('already-in-family.cta')}
                  </ButtonLink>
                </div>

                <div class="col-span-7 col-end-[-1] row-[1/-1] ms-auto w-[clamp(320px,100%,90svw)] self-start rounded-3xl">
                  <Image
                    src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg"
                    width={600}
                    aspectRatio=""
                    alt=""
                    class="bg-primary/5 w-full rounded-3xl object-cover"
                  />
                </div>
              </Match>
              <Match when={invite()}>
                {(invite) => (
                  <>
                    <Form
                      method="post"
                      action={joinFamilyWithLink}
                      class="bg-background bg-main z-10 col-span-6 col-start-1 row-[2] flex flex-col gap-6 rounded-3xl [background-attachment:fixed] sm:p-6 lg:col-span-5 lg:col-start-2"
                    >
                      <Text with="headline-1">
                        {invite()!.inviterName
                          ? t('accept-invite.heading', {
                              inviterName: invite()!.inviterName!,
                            })
                          : t('accept-invite.heading.no-name')}
                      </Text>
                      <Text as="p">{t('accept-invite.description')}</Text>
                      <div class="flex items-stretch justify-between gap-2 sm:flex-row">
                        <ButtonLink
                          href="/app"
                          class="shrink-0 gap-2"
                          variant="outline"
                        >
                          <Icon use="chevron-left" class="-ms-2" />
                          {t('accept-invite.cta-cancel')}
                        </ButtonLink>
                        <input type="hidden" value={code} name="invite-code" />
                        <Button
                          class="w-full rounded-full"
                          type="submit"
                          loading={joinSubmission.pending}
                        >
                          {t('accept-invite.cta-join')}
                        </Button>
                      </div>
                    </Form>

                    <div class="col-span-7 col-end-[-1] row-[1/-1] ms-auto hidden h-full max-h-[500px] overflow-hidden rounded-3xl md:block md:max-h-[calc(100vh-theme(spacing.6)*2)]">
                      <HeroImage
                        alt=""
                        class="ms-auto size-full max-w-[400px] rounded-3xl object-cover object-center md:max-w-full"
                      />
                    </div>

                    <div class="md:bg-background md:bg-main bg-surface col-start-8 col-end-[-1] row-[2] w-full max-w-[340px] self-end justify-self-end overflow-hidden overscroll-contain rounded-3xl p-3 [background-attachment:fixed] md:mb-3 md:me-3">
                      <FamilyInviteBenefits class="-mx-6 px-6 *:w-full" />
                    </div>

                    <Show when={joinSubmission.error}>
                      <Card
                        aria-live="polite"
                        variant="filled"
                        tone="failure"
                        class="col-span-4 col-start-1 row-[2] flex max-w-[320px] flex-col gap-6 self-end rounded-3xl [background-attachment:fixed] md:mb-4 lg:col-span-5 lg:col-start-2"
                      >
                        {t('acceptInvite.failed')}
                      </Card>
                    </Show>
                  </>
                )}
              </Match>
              <Match when={failed()}>
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
          </Suspense>
        </main>
      </div>
    </>
  );
};

export default InviteAcceptPage;
