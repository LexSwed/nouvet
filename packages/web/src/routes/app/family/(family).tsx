import { Title } from '@solidjs/meta';
import {
  createAsync,
  useAction,
  useSubmission,
  type RouteDefinition,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { ButtonLink, Form, Icon, Text, TextField } from '@nou/ui';

import { getFamilyMembers, updateFamily } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
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
  const updateFamilyAction = useAction(updateFamily);
  const updateFamilySubmission = useSubmission(updateFamily);
  const awaitingUser = () =>
    // The API also filters non-approved users from non-owners, but just in case
    user()?.family.isOwner
      ? familyMembers()?.find((user) => !user.isApproved)
      : null;
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
          <Switch>
            <Match when={user()?.family.isOwner}>
              <Form
                class="container -mt-4"
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
            </Match>
            <Match when={!user()?.family.isOwner}>
              <Text with="headline-1">
                {user()?.family.name || t('family.no-name')}
              </Text>
            </Match>
          </Switch>
          <section class="container flex flex-col gap-8">
            <Suspense>
              <Show when={awaitingUser()}>
                {(user) => <WaitingFamilyConfirmation user={user()} />}
              </Show>
              <Switch>
                <Match when={members().length > 0}>Render users!</Match>
                <Match when={members().length === 0}>No users, invite</Match>
              </Switch>
            </Suspense>
          </section>
        </div>
      </div>
    </>
  );
}

export default FamilyPage;
