import { Title } from '@solidjs/meta';
import {
  createAsync,
  useAction,
  useSubmission,
  type RouteDefinition,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import {
  Button,
  ButtonLink,
  Drawer,
  Form,
  Icon,
  Menu,
  MenuItem,
  Text,
  TextField,
} from '@nou/ui';

import { getFamilyMembers, updateFamily } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';
import { WaitingFamilyConfirmation } from '~/lib/family-invite/waiting-family-confirmation';

export const route = {
  load() {
    return Promise.all([
      cacheTranslations('app'),
      getUserFamily(),
      getFamilyMembers(),
    ]);
  },
} satisfies RouteDefinition;

function FamilyPage() {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const familyMembers = createAsync(async () => {
    const members = await getFamilyMembers();
    return members;
  });
  const isOwner = () => user()?.family.isOwner || false;
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
          <FamilyHeader familyName={user()?.family.name} isOwner={isOwner()} />
          <section class="container flex flex-col gap-8">
            <Suspense>
              <Show when={awaitingUser()}>
                {(user) => <WaitingFamilyConfirmation user={user()} />}
              </Show>
              <Switch>
                <Match when={members().length > 0}>Render users!</Match>
                {/* technically it's not possible for non-owners to not see other members */}
                <Match when={isOwner() && members().length === 0}>
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                    <div class="order-2 flex flex-1 flex-col gap-2 sm:order-none">
                      <Text with="headline-2" as="h2">
                        {t('family.no-members-header')}
                      </Text>
                      <Text as="p">{t('family.no-members-description')}</Text>
                    </div>
                    <img
                      src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg?w=600&format=webp&imagetools"
                      alt=""
                      class="bg-primary/5 flex-2 mb-4 w-full rounded-3xl object-cover sm:max-w-[60vw]"
                    />
                  </div>
                </Match>
              </Switch>
              <Show when={isOwner()}>
                <div class="flex flex-col gap-4">
                  <Button popoverTarget="family-invite-cta">
                    {t('family.invite')}
                  </Button>
                  <Suspense>
                    <FamilyInviteDialog id="family-invite-cta" />
                  </Suspense>
                  <Switch>
                    <Match when={members().length === 0}>
                      <Button variant="link" class="text-error">
                        {t('family.delete-family')}
                      </Button>
                    </Match>
                    <Match when={members().length > 0}>People are here</Match>
                  </Switch>
                </div>
              </Show>
            </Suspense>
          </section>
        </div>
      </div>
    </>
  );
}

function FamilyHeader(props: {
  familyName: string | null | undefined;
  isOwner: boolean;
}) {
  const t = createTranslator('family');
  return (
    <section class="container flex flex-col gap-4">
      <Text with="headline-1" as="h2">
        {props.familyName || t('family.no-name')}
      </Text>
      <Show when={props.isOwner}>
        <div class="flex flex-row gap-3">
          <Button class="gap-2" variant="tonal" size="sm">
            <Icon use="pencil" />
            Set a new name
          </Button>
          <Button
            class="gap-2"
            variant="tonal"
            size="sm"
            popoverTarget="family-invite"
          >
            <Icon use="user-circle-plus" />
            Add users
          </Button>
          <FamilyInviteDialog id="family-invite" />
          <Button size="sm" icon variant="tonal" popoverTarget="family-menu">
            <Icon use="dots-three-outline-vertical" />
          </Button>
          <Menu id="family-menu" placement="bottom-end">
            <MenuItem
              tone="destructive"
              popoverTarget="family-delete"
              as="button"
              type="button"
            >
              <Icon use="trash-simple" />
              Disassemble the family
            </MenuItem>
          </Menu>
          <Drawer id="family-delete" aria-labelledby="family-delete-headline">
            {(open) => (
              <Show when={open()}>
                <div class="flex flex-col gap-8">
                  <div class="flex flex-col gap-4">
                    <Text
                      with="headline-2"
                      as="header"
                      id="family-delete-headline"
                    >
                      {t('family.delete-family-headline')}
                    </Text>
                    <div class="border-outline bg-primary-container/20 overflow-hidden rounded-full border-2">
                      <img
                        src="/assets/images/family-breakup.png?w=300&format=webp"
                        class="max-w-full"
                        alt=""
                      />
                    </div>
                    <Text as="p">{t('family.delete-family-description')}</Text>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      popoverTarget="family-delete"
                      popoverTargetAction="hide"
                    >
                      {t('family.delete-family-cancel')}
                    </Button>
                    <Button variant="outline" tone="destructive">
                      {t('family.delete-family-cta')}
                    </Button>
                  </div>
                </div>
              </Show>
            )}
          </Drawer>
        </div>
      </Show>
    </section>
  );
}

const FamilyName = () => {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const updateFamilyAction = useAction(updateFamily);
  const updateFamilySubmission = useSubmission(updateFamily);
  return (
    <Form
      onFocusOut={async (e) => {
        const form = new FormData(e.currentTarget);
        const newName = form.get('family-name')?.toString().trim();
        if (newName !== user()?.family.name) {
          await updateFamilyAction(form);
        }
      }}
      autocomplete="off"
      validationErrors={updateFamilySubmission.result?.errors}
      aria-disabled={updateFamilySubmission.pending}
      class="md:max-w-[50svw]"
    >
      <TextField
        as="textarea"
        placeholder={t('family.no-name')}
        variant="ghost"
        class="[&_textarea]:placeholder:text-on-surface w-full [&_textarea]:resize-none [&_textarea]:text-3xl [&_textarea]:font-semibold"
        label={t('family.update-name-label')}
        aria-description={t('family.update-name-description')}
        name="family-name"
        aria-disabled={updateFamilySubmission.pending}
        suffix={<Icon use="pencil" size="sm" />}
      >
        {user()?.family.name ?? ''}
      </TextField>
    </Form>
  );
};

export default FamilyPage;
