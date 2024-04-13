import { createAsync, revalidate } from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Button, Icon, Text } from '@nou/ui';

import { getFamilyMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

import { WaitingFamilyConfirmation } from './waiting-family-confirmation';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('app');
  const familyMember = createAsync(async () => {
    const members = await getFamilyMembers();
    if (members)
      return members.find((user) => !user.isApproved) || members.at(-1);
    return null;
  });

  return (
    <div class="flex flex-col gap-6">
      <Suspense
        fallback={<div class="bg-on-surface/12 size-[300px] animate-pulse" />}
      >
        <Switch>
          <Match when={!familyMember()}>
            <div class="flex flex-col items-center justify-center gap-6">
              <Icon
                use="video-conference"
                size="lg"
                class="text-on-primary-container"
              />
              <Text class="text-balance text-center">
                {t('family-invite.waitlist-empty')}
              </Text>
            </div>
          </Match>
          <Match when={!familyMember()?.isApproved}>
            <Show when={familyMember()}>
              {(user) => <WaitingFamilyConfirmation user={user()} />}
            </Show>
          </Match>
        </Switch>
        <Button
          onClick={async () => {
            if (familyMember()) {
              revalidate(getUserFamily.key);
            }
            props.onNext();
          }}
        >
          {t('family-invite.waitlist-done')}
        </Button>
      </Suspense>
    </div>
  );
};
