import { Title } from '@solidjs/meta';
import {
  createAsync,
  useSubmission,
  type RouteDefinition,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import {
  Button,
  ButtonLink,
  Card,
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
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
import { FamilyNameForm } from '~/lib/family-invite/family-name-form';
import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';
import { WaitingFamilyConfirmation } from '~/lib/family-invite/waiting-family-confirmation';

export const route = {
  load() {
    return Promise.all([
      cacheTranslations('family'),
      getUserFamily(),
      getFamilyMembers(),
    ]);
  },
} satisfies RouteDefinition;

function FamilyPage() {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const isOwner = () => user()?.family?.isOwner || false;
  const familyMembers = createAsync(async () => getFamilyMembers());
  const awaitingUser = () =>
    // The API also filters non-approved users from non-owners, but just in case
    isOwner() ? familyMembers()?.find((user) => !user.isApproved) : null;
  const members = () =>
    familyMembers()?.filter((user) => user.isApproved) ?? [];
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
        <div class="flex flex-col gap-6">
          <Suspense>
            <FamilyHeader />
            <section class="container flex flex-col gap-8">
              <Show when={awaitingUser()}>
                {(user) => (
                  <div class="sm:max-w-[400px]">
                    <WaitingFamilyConfirmation user={user()} />
                  </div>
                )}
              </Show>
              <Switch>
                <Match when={!user()?.family?.isApproved}>
                  <WaitingApproval />
                </Match>
                <Match when={members().length > 0}>Render users!</Match>
                {/* technically it's not possible for non-owners to not see other members */}
                <Match
                  when={isOwner() && members().length === 0 && !awaitingUser()}
                >
                  <EmptyFamily />
                </Match>
              </Switch>
            </section>
          </Suspense>
          <Suspense>
            <FamilyInviteDialog id="family-invite" />
          </Suspense>
        </div>
      </div>
    </>
  );
}

export default FamilyPage;

function FamilyHeader() {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const isOwner = () => user()?.family?.isOwner || false;
  return (
    <section class="container">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Switch>
          <Match when={isOwner()}>
            <>
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
                <Menu id="family-owner-menu" placement="bottom-end">
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
            </>
          </Match>
          <Match when={!isOwner()}>
            <>
              <Text with="headline-1">
                {user()?.family?.name || t('no-name')}
              </Text>
              <Show when={user()?.family?.isApproved}>
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
                <Menu id="family-menu" placement="bottom-end">
                  <MenuItem
                    tone="destructive"
                    popoverTarget="family-leave"
                    as="button"
                    type="button"
                  >
                    <Icon use="sign-out" />
                    Leave family
                  </MenuItem>
                </Menu>
                <Drawer id="family-leave" placement="center">
                  {(open) => <Show when={open()}>Are you sure?</Show>}
                </Drawer>
              </Show>
            </>
          </Match>
        </Switch>
      </div>
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
    <div class="flex flex-col items-start gap-4 md:flex-row">
      <Card class="max-w-[400px]">
        <Text as="p" with="headline-3">
          {t('waiting.headline')}
        </Text>
        <Text as="p">{t('waiting.description')}</Text>
        <div class="self-end">
          <Button
            variant="ghost"
            tone="destructive"
            size="sm"
            popoverTarget="cancel-join-drawer"
          >
            {t('waiting.cancel-join-cta')}
          </Button>
        </div>
      </Card>
      <Image
        src="/assets/images/barthelemy-de-mazenod-iw0SowaRxeY-unsplash.jpg"
        width={300}
        aspectRatio="4/3"
        alt={t('waiting.image')!}
        class="w-[400px] self-end rounded-3xl md:w-[600px]"
      />
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
    </div>
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
      <div class="row-[1] grid place-content-center">
        <Image
          src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg"
          alt=""
          aspectRatio="4/3"
          width={600}
          class="bg-primary/5 w-full max-w-[600px] rounded-3xl"
        />
      </div>
    </div>
  );
}
