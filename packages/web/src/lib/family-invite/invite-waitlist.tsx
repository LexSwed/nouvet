import { createAsync, revalidate } from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, Card, Icon, Text } from '@nou/ui';
import { differenceInMinutes } from 'date-fns';

import { getFamilyMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

import { WaitingFamilyConfirmation } from './waiting-family-confirmation';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('family');
  const familyMember = createAsync(async () => {
    'use server';
    const members = await getFamilyMembers();
    if (!members) return;
    return (
      members.find((user) => !user.isApproved) ||
      members.find(
        (user) => differenceInMinutes(new Date(), user.joinedAt) < 60,
      )
    );
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
                {t('invite.waitlist-empty')}
              </Text>
            </div>
          </Match>
          <Match when={!familyMember()?.isApproved}>
            <Show when={familyMember()}>
              {(user) => <WaitingFamilyConfirmation user={user()} />}
            </Show>
          </Match>
          <Match when={familyMember()?.isApproved}>
            <Show when={familyMember()}>
              {(user) => (
                <div class="flex flex-col gap-6">
                  <Text as="p" with="headline-2">
                    Newly joined
                  </Text>
                  <Card class="flex flex-col gap-2">
                    <div class="flex flex-row items-center justify-start gap-3">
                      <Avatar
                        avatarUrl={user().avatarUrl}
                        name={user().name || ''}
                      />
                      <Text with="label-lg">{user().name}</Text>
                    </div>
                    <Button
                      variant="ghost"
                      tone="destructive"
                      size="sm"
                      class="self-end"
                    >
                      Remove
                    </Button>
                  </Card>
                </div>
              )}
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
          {t('invite.waitlist-done')}
        </Button>
      </Suspense>
    </div>
  );
};
