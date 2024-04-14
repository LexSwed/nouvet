import { Title } from '@solidjs/meta';
import { createAsync, type RouteDefinition } from '@solidjs/router';
import { Show, Suspense } from 'solid-js';
import { ButtonLink, Icon, Text, TextField } from '@nou/ui';

import { getFamilyMembers } from '~/server/api/family';
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
          <TextField
            value={user()?.family.name ?? undefined}
            placeholder={t('family.no-name')}
            suffix={<Icon use="pencil" size="sm" />}
          />
        </AppHeader>
        <div class="flex flex-col gap-6">
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
