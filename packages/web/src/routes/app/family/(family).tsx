import { Title } from '@solidjs/meta';
import {
  createAsync,
  useAction,
  useSubmission,
  type RouteDefinition,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Button, ButtonLink, Form, Icon, Text, TextField } from '@nou/ui';

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
          <section class="container">
            <FamilyName />
          </section>
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
                  <Button popoverTarget="family-invite">
                    {t('family.invite')}
                  </Button>
                  <Suspense>
                    <FamilyInviteDialog id="family-invite" />
                  </Suspense>
                </div>
              </Show>
            </Suspense>
          </section>
        </div>
      </div>
    </>
  );
}

const FamilyName = () => {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const updateFamilyAction = useAction(updateFamily);
  const updateFamilySubmission = useSubmission(updateFamily);
  return (
    <Switch>
      <Match when={user()?.family.isOwner}>
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
      </Match>
      <Match when={!user()?.family.isOwner}>
        <Text with="headline-1">
          {user()?.family.name || t('family.no-name')}
        </Text>
      </Match>
    </Switch>
  );
};

export default FamilyPage;
