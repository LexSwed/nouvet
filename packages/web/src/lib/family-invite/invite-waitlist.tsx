import { createAsync, revalidate, useMatch } from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, ButtonLink, Card, Icon, Text } from '@nou/ui';

import { getFamilyAndRecentMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

import { FamilyNameForm } from './family-name-form';
import { WaitingFamilyConfirmation } from './waiting-family-confirmation';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('family');

  const family = createAsync(() => getFamilyAndRecentMembers());
  const isFamilyUrl = useMatch(() => '/app/family');

  return (
    <div class="flex flex-col gap-6">
      <Suspense
        fallback={
          // TODO: Create Skeleton component
          <div class="bg-on-surface/12 h-[200px] w-full animate-pulse self-center rounded-3xl" />
        }
      >
        <Switch>
          <Match when={!family()?.recentMember}>
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
          <Match when={!family()?.recentMember?.isApproved}>
            <Show when={family()?.recentMember}>
              {(user) => <WaitingFamilyConfirmation user={user()} />}
            </Show>
          </Match>
          <Match when={family()?.recentMember?.isApproved}>
            <div class="flex flex-col gap-6">
              <div class="flex flex-row items-end gap-4">
                <div class="flex-[2]">
                  <FamilyNameForm familyName={family()?.name} />
                </div>
                <Show when={!isFamilyUrl()}>
                  <ButtonLink href="/app/family" icon variant="ghost">
                    <Icon use="arrow-up-right" size="md" />
                  </ButtonLink>
                </Show>
              </div>
              <Card variant="outlined" tone="primary-light">
                <div class="flex flex-col gap-2">
                  <div class="flex flex-row items-center justify-start gap-3">
                    <Avatar
                      avatarUrl={family()?.recentMember!.avatarUrl || ''}
                      name={family()?.recentMember!.name || ''}
                    />
                    <Text with="label-lg">{family()?.recentMember!.name}</Text>
                  </div>
                  <Button
                    variant="ghost"
                    tone="destructive"
                    size="sm"
                    class="self-end"
                  >
                    {t('invite.waitlist-joined-cancel')}
                  </Button>
                </div>
              </Card>
            </div>
          </Match>
        </Switch>
        <Button
          onClick={() => {
            if (family()?.recentMember) {
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
