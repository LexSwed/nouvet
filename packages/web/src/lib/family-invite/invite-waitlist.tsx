import { createAsync, revalidate } from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, Card, Icon, Text } from '@nou/ui';
import { differenceInMinutes } from 'date-fns';

import { getFamilyMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';
import { timeout } from '~/server/utils';

import { FamilyNameForm } from './family-name-form';
import { WaitingFamilyConfirmation } from './waiting-family-confirmation';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('family');

  const family = createAsync(async () => {
    'use server';
    const [members, user] = await Promise.all([
      getFamilyMembers(),
      getUserFamily(),
    ]);
    await timeout(1000);
    if (!members) return { ...user.family, familyMember: null };
    return {
      ...user.family,
      familyMember:
        members.find((user) => !user.isApproved) ||
        members.find(
          (user) => differenceInMinutes(new Date(), user.joinedAt) < 60,
        ),
    };
  });

  return (
    <div class="flex flex-col gap-6">
      <Suspense
        fallback={
          // TODO: Create Skeleton component
          <div class="bg-on-surface/12 h-[200px] w-full animate-pulse self-center rounded-3xl" />
        }
      >
        <Switch>
          <Match when={!family()?.familyMember}>
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
          <Match when={!family()?.familyMember?.isApproved}>
            <Show when={family()?.familyMember}>
              {(user) => <WaitingFamilyConfirmation user={user()} />}
            </Show>
          </Match>
          <Match when={family()?.familyMember?.isApproved}>
            <div class="flex flex-col gap-6">
              <FamilyNameForm familyName={family()?.name} />
              <Card
                variant="tonal"
                tone="primary-light"
                class="flex flex-col gap-2"
              >
                <div class="flex flex-row items-center justify-start gap-3">
                  <Avatar
                    avatarUrl={family()?.familyMember!.avatarUrl || ''}
                    name={family()?.familyMember!.name || ''}
                  />
                  <Text with="label-lg">{family()?.familyMember!.name}</Text>
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
          </Match>
        </Switch>
        <Button
          onClick={async () => {
            if (family()?.familyMember) {
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
