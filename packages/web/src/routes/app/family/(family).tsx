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
    user()?.family.isOwner
      ? familyMembers()?.find((user) => !user.isApproved)
      : null;
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
                  value={user()?.family.name ?? ''}
                  data-initial={user()?.family.name ?? ''}
                  placeholder={t('family.no-name')}
                  variant="ghost"
                  class="[&_input]:placeholder:text-on-surface w-full [&_input]:text-3xl [&_input]:font-semibold"
                  label="Update name"
                  aria-description="Press Enter to save"
                  name="family-name"
                  aria-disabled={updateFamilySubmission.pending}
                  suffix={<Icon use="pencil" size="sm" />}
                />
              </Form>
            </Match>
            <Match when={!user()?.family.isOwner}>
              <Text with="headline-1">
                {user()?.family.name || t('family.no-name')}
              </Text>
            </Match>
          </Switch>
          <section class="container">
            <Suspense>
              <Show when={awaitingUser()}>
                {(user) => <WaitingFamilyConfirmation user={user()} />}
              </Show>
            </Suspense>
          </section>
        </div>
      </div>
    </>
  );
}

export default FamilyPage;
