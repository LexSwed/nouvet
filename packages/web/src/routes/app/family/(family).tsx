import { Title } from '@solidjs/meta';
import {
  createAsync,
  useAction,
  useSubmission,
  type RouteDefinition,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { ButtonLink, Form, Icon, Stack, Text, TextField } from '@nou/ui';

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
          <section class="container flex flex-col gap-8">
            <Suspense>
              <NewNameInput
                name={user()?.family.name || ''}
                isOwner={user()?.family.isOwner || false}
              />
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

const NewNameInput = (props: { isOwner: boolean; name: string }) => {
  const t = createTranslator('family');
  const updateFamilyAction = useAction(updateFamily);
  const updateFamilySubmission = useSubmission(updateFamily);

  let inputWidthTextRef: HTMLDivElement | null = null;

  return (
    <Switch>
      <Match when={props.isOwner}>
        <Form
          class="container -mt-4"
          onFocusOut={async (e) => {
            const form = new FormData(e.currentTarget);
            const newName = form.get('family-name')?.toString().trim();
            if (newName !== props.name) {
              await updateFamilyAction(form);
            }
          }}
          autocomplete="off"
          validationErrors={updateFamilySubmission.result?.errors}
          aria-disabled={updateFamilySubmission.pending}
        >
          <Stack class="inline-grid">
            <Text
              as="div"
              with="headline-1"
              aria-hidden
              class="pe-12 opacity-0"
              ref={(el: HTMLDivElement) => (inputWidthTextRef = el)}
            >
              {props.name}
            </Text>
            <TextField
              value={props.name ?? ''}
              data-initial={props.name ?? ''}
              placeholder={t('family.no-name')}
              variant="ghost"
              class="[&_input]:placeholder:text-on-surface [&_input]:text-3xl [&_input]:font-semibold"
              label={t('family.update-name-label')}
              aria-description={t('family.update-name-description')}
              name="family-name"
              aria-disabled={updateFamilySubmission.pending}
              suffix={<Icon use="pencil" size="sm" />}
              onInput={(e) => {
                if (inputWidthTextRef) {
                  inputWidthTextRef.textContent = e.target.value;
                }
              }}
            />
          </Stack>
        </Form>
      </Match>
      <Match when={!props.isOwner}>
        <Text with="headline-1">{props.name || t('family.no-name')}</Text>
      </Match>
    </Switch>
  );
};

export default FamilyPage;
