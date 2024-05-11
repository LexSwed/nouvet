import { createAsync, revalidate, useMatch } from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, ButtonLink, Card, Icon, Text } from '@nou/ui';

import { getRecentMember } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

import { FamilyNameForm } from './family-name-form';
import { WaitingFamilyConfirmation } from './waiting-family-confirmation';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('family');

  const user = createAsync(() => getUserFamily());
  const isOwner = () => user()?.family?.role === 'owner';
  const recentMember = createAsync(async () =>
    isOwner() ? getRecentMember() : null,
  );

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
                  member={member()}
                />
              )}
            </Show>
          </Match>
        </Switch>
        <Button
          onClick={() => {
            if (recentMember()) {
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

const NewlyJoinedMember = (props: {
  familyName: string | null | undefined;
  member: {
    isApproved: boolean;
    id: number;
    name: string | null;
    avatarUrl: string | null;
  };
}) => {
  const t = createTranslator('family');
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
      <Card variant="outlined" tone="primary-light" class="bg-main">
        <div class="flex flex-col gap-2">
          <div class="flex flex-row items-center justify-start gap-3">
            <Avatar
              avatarUrl={props.member.avatarUrl || ''}
              name={props.member.name || ''}
            />
            <Text with="label-lg">{props.member.name}</Text>
          </div>
          <Button
            variant="ghost"
            tone="destructive"
            size="sm"
            class="-mb-1 self-end"
          >
            {t('invite.waitlist-joined-cancel')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
