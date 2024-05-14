import { createAsync, revalidate, useMatch } from '@solidjs/router';
import { Match, onMount, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, ButtonLink, Card, Icon, Text } from '@nou/ui';
import { UTCDate } from '@date-fns/utc';
import { differenceInMinutes } from 'date-fns/differenceInMinutes';

import { getFamilyMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

import { FamilyNameForm } from './family-name-form';
import { WaitingFamilyConfirmation } from './waiting-family-confirmation';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('family');

  const user = createAsync(() => getUserFamily());

  // ensure we call update
  onMount(() => {
    revalidate(getFamilyMembers.key);
  });

  const recentMember = createAsync(async () => {
    const members = await getFamilyMembers();
    return (
      members.find((member) => !member.isApproved) ||
      members.find((member) => {
        return (
          differenceInMinutes(new UTCDate(), new UTCDate(member.joinedAt)) < 60
        );
      })
    );
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
          <Match when={!recentMember()}>
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
          <Match when={!recentMember()?.isApproved}>
            <Show when={recentMember()}>
              {(user) => <WaitingFamilyConfirmation user={user()} />}
            </Show>
          </Match>
          <Match when={recentMember()?.isApproved}>
            <Show when={recentMember()}>
              {(member) => (
                <NewlyJoinedMember
                  familyName={user()?.family?.name}
                  user={member()}
                />
              )}
            </Show>
          </Match>
        </Switch>
        <Button
          onClick={() => {
            props.onNext();
          }}
        >
          {t('invite.waitlist-done')}
        </Button>
      </Suspense>
    </div>
  );
};

const NewlyJoinedMember = (props: {
  familyName: string | null | undefined;
  user: {
    isApproved: boolean;
    id: number;
    name: string | null;
    avatarUrl: string | null;
  };
}) => {
  const isFamilyUrl = useMatch(() => '/app/family');

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-row items-end gap-4">
        <div class="flex-[2]">
          <FamilyNameForm familyName={props.familyName} />
        </div>
        <Show when={!isFamilyUrl()}>
          <ButtonLink href="/app/family" icon variant="ghost">
            <Icon use="arrow-up-right" size="md" />
          </ButtonLink>
        </Show>
      </div>
      <Card
        variant="outlined"
        class="flex flex-row items-center gap-6 p-4"
        style={{ 'view-transition-name': `family-invite-${props.user.id}` }}
      >
        <Avatar
          avatarUrl={props.user.avatarUrl || ''}
          name={props.user.name || ''}
        />
        <Text with="label-lg">{props.user.name}</Text>
      </Card>
    </div>
  );
};
