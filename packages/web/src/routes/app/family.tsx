import { Title } from '@solidjs/meta';
import {
  createAsync,
  useSubmission,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { For, Match, Show, Suspense, Switch } from 'solid-js';
import {
  Avatar,
  Button,
  ButtonLink,
  Card,
  Divider,
  Drawer,
  Form,
  Icon,
  Image,
  Menu,
  MenuItem,
  Text,
} from '@nou/ui';

import { cancelFamilyJoin, getFamilyMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator, T } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
import { FamilyNameForm } from '~/lib/family-invite/family-name-form';
import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';
import { WaitingFamilyConfirmation } from '~/lib/family-invite/waiting-family-confirmation';

export const route = {
  load() {
    void cacheTranslations('family');
    void getUserFamily();
    void getFamilyMembers();
  },
} satisfies RouteDefinition;

function FamilyPage(props: RouteSectionProps) {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const isOwner = () => user()?.family?.role === 'owner' || false;
  const familyMembers = createAsync(() => getFamilyMembers());
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
            <Match when={user()?.family}>
              {(family) => (
                <div class="flex flex-col gap-6">
                  <FamilyHeader />
                  <Suspense>
                    <section class="container flex flex-col gap-8">
                      <Switch>
                        <Match when={family()!.role === 'waiting'}>
                          <WaitingApproval />
                        </Match>
                        <Match
                          when={
                            familyMembers()
                              ? familyMembers()!.length > 0
                              : false
                          }
                        >
                          <For each={familyMembers()}>
                            {(member) => (
                              <Switch>
                                <Match when={member.role === 'waiting'}>
                                  <Suspense>
                                    <div class="sm:max-w-[400px]">
                                      <WaitingFamilyConfirmation
                                        user={member}
                                      />
                                    </div>
                                  </Suspense>
                                </Match>
                                <Match when={member.role === 'member'}>
                                  <Card>
                                    <Avatar
                                      name={member.name || ''}
                                      avatarUrl={member.avatarUrl}
                                    />
                                    {member.name}
                                  </Card>
                                </Match>
                              </Switch>
                            )}
                          </For>
                          <Show
                            when={props.params.userId}
                            children={props.children}
                            fallback={'Render users activity timeline'}
                          />
                        </Match>
                        <Match
                          when={
                            isOwner() &&
                            familyMembers() &&
                            familyMembers()!.length === 0
                          }
                        >
                          <EmptyFamily />
                        </Match>
                      </Switch>
                    </section>
                  </Suspense>
                </div>
              )}
            </Match>
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

function FamilyHeader() {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const isOwner = () => user()?.family?.role === 'owner' || false;
  return (
    <section class="container">
      <Switch>
        <Match when={isOwner()}>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
            <FamilyNameForm familyName={user()?.family?.name} />
            <div class="mb-1 flex flex-row gap-2">
              <Button
                variant="tonal"
                size="sm"
                popoverTarget="family-invite"
                class="gap-2"
              >
                <Icon use="user-circle-plus" />
                {t('action-add-users')}
              </Button>
              <Button
                variant="ghost"
                icon
                size="sm"
                label={t('action-more')}
                popoverTarget="family-owner-menu"
                class="gap-2"
              >
                <Icon use="dots-three-outline-vertical" />
              </Button>
              <Menu
                id="family-owner-menu"
                placement="top-to-bottom right-to-right"
              >
                <MenuItem
                  tone="destructive"
                  popoverTarget="family-delete"
                  as="button"
                  type="button"
                >
                  <Icon use="trash-simple" />
                  {t('action-disassemble')}
                </MenuItem>
              </Menu>
              <DeleteFamilyDialog />
            </div>
          </div>
        </Match>
        <Match when={!isOwner()}>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Text with="headline-1">
              {user()?.family?.name || t('no-name')}
            </Text>
            <Show when={user()?.family?.role === 'member'}>
              <ul>
                <li>
                  <Button
                    size="sm"
                    variant="ghost"
                    popoverTarget="family-menu"
                    class="gap-2"
                    icon
                    label="Actions on family"
                  >
                    <Icon use="dots-three-outline-vertical" />
                  </Button>
                </li>
              </ul>
              <Menu id="family-menu" placement="top-to-bottom right-to-right">
                <MenuItem
                  tone="destructive"
                  popoverTarget="family-leave"
                  as="button"
                  type="button"
                >
                  <Icon use="sign-out" />
                  {t('member.leave-family')}
                </MenuItem>
              </Menu>
              <Drawer id="family-leave" placement="center">
                {(open) => <Show when={open()}>Are you sure?</Show>}
              </Drawer>
            </Show>
          </div>
        </Match>
      </Switch>
    </section>
  );
}

const DeleteFamilyDialog = () => {
  const t = createTranslator('family');

  return (
    <Drawer
      placement="center"
      id="family-delete"
      aria-labelledby="family-delete-headline"
      class="md:max-w-[600px]"
    >
      {(open) => (
        <Show when={open()}>
          <div class="flex flex-col gap-8">
            <Text
              with="headline-2"
              as="header"
              id="family-delete-headline"
              class="text-center md:text-start"
            >
              {t('delete-family-headline')}
            </Text>
            <div class="grid items-center gap-8 md:grid-cols-[1fr,2fr]">
              <div class="border-outline bg-primary-container/20 max-w-[200px] justify-self-center overflow-hidden rounded-full border-2">
                <Image
                  src="/assets/images/family-breakup.png"
                  width={300}
                  aspectRatio="1/1"
                  alt=""
                />
              </div>
              <div class="flex flex-col gap-8">
                <Text as="p">{t('delete-family-description')}</Text>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    popoverTarget="family-delete"
                    popoverTargetAction="hide"
                  >
                    {t('delete-family-cancel')}
                  </Button>
                  <Button variant="outline" tone="destructive">
                    {t('delete-family-cta')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Show>
      )}
    </Drawer>
  );
};

function WaitingApproval() {
  const t = createTranslator('family');
  const cancelJoinSubmission = useSubmission(cancelFamilyJoin);
  return (
    <>
      <Card class="bg-main flex flex-col items-center gap-4 p-8 sm:flex-row">
        <div class="flex flex-col gap-6">
          <Text as="h2" with="headline-2">
            {t('waiting.headline')}
          </Text>
          <Text as="p">{t('waiting.description')}</Text>
          <div class="self-end">
            <Button
              variant="tonal"
              tone="destructive"
              popoverTarget="cancel-join-drawer"
            >
              {t('waiting.cancel-join-cta')}
            </Button>
          </div>
        </div>
        <div class="-mx-4 -mb-4 min-h-0 sm:-my-4 sm:mx-0 sm:-me-4 sm:mb-0 sm:max-w-[50%] sm:self-stretch">
          <Image
            src="/assets/images/barthelemy-de-mazenod-iw0SowaRxeY-unsplash.jpg"
            width={300}
            aspectRatio="4/3"
            alt={t('waiting.image')!}
            class="h-full max-h-[400px] w-auto rounded-3xl md:max-w-full"
          />
        </div>
      </Card>
      <Drawer
        id="cancel-join-drawer"
        placement="center"
        aria-labelledby="cancel-join-headline"
        class="max-w-[500px]"
      >
        {(open) => (
          <Show when={open()}>
            <div class="flex flex-col gap-4">
              <Text with="headline-3" as="header" id="cancel-join-headline">
                {t('waiting.cancel-join-popup-headline')}
              </Text>
              <Text as="p">{t('waiting.cancel-join-popup-description')}</Text>
              <Form
                action={cancelFamilyJoin}
                method="post"
                class="mt-4 grid grid-cols-2 gap-4 md:self-end"
              >
                <Button
                  variant="ghost"
                  popoverTargetAction="hide"
                  popoverTarget="cancel-join-drawer"
                  class="rounded-full"
                >
                  {t('waiting.cancel-join-popup-close')}
                </Button>
                <Button
                  variant="outline"
                  tone="destructive"
                  type="submit"
                  loading={cancelJoinSubmission.pending}
                >
                  {t('waiting.cancel-join-popup-confirm')}
                </Button>
              </Form>
            </div>
          </Show>
        )}
      </Drawer>
    </>
  );
}

function EmptyFamily() {
  const t = createTranslator('family');
  return (
    <div class="grid grid-flow-row gap-6 sm:grid-flow-col sm:grid-cols-[1fr,2fr] sm:items-center">
      <div class="row-[2] flex flex-col gap-4 sm:row-auto">
        <Text with="headline-2" as="h2">
          {t('no-members-header')}
        </Text>
        <Text as="p">{t('no-members-description')}</Text>
        <Button popoverTarget="family-invite">{t('invite-cta')}</Button>
      </div>
      <div class="row-[1]">
        <Image
          src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg"
          alt=""
          aspectRatio="5/3"
          width={500}
          class="bg-primary/5 max-h-[300px] rounded-3xl"
        />
      </div>
    </div>
  );
}

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
