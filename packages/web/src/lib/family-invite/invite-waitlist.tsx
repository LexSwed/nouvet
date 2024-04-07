import { createAsync } from '@solidjs/router';
import { For, Match, Switch } from 'solid-js';
import { Avatar, Button, Card, Icon, Text } from '@nou/ui';

import { allFamilyUsers } from '~/server/api/family';
import { createTranslator } from '~/server/i18n';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('app');
  const waitList = createAsync(
    async () => {
      const members = await allFamilyUsers();
      return members ? members.filter((user) => !user.isApproved) : [];
    },
    { initialValue: [] },
  );

  return (
    <div class="flex flex-col gap-6">
      <Switch>
        <Match when={waitList().length === 0}>
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
        <Match when={waitList().length > 0}>
          <div class="flex flex-col gap-6">
            <For each={waitList()}>
              {(user) => (
                <Card
                  role="group"
                  variant="outlined"
                  class="flex flex-col gap-4 rounded-3xl"
                >
                  <div class="flex flex-row items-center justify-between gap-2">
                    <Text with="label-lg">{user.name}</Text>
                    <Avatar avatarUrl={user.avatarUrl} name={user.name || ''} />
                  </div>
                  <div class="flex flex-row gap-2">
                    <Button size="sm" variant="outline" class="flex-1 gap-3">
                      <Icon use="x" class="-ml-3" />
                      Decline
                    </Button>
                    <Button size="sm" variant="outline" class="flex-1 gap-3">
                      <Icon use="check" class="-ml-2" />
                      Approve
                    </Button>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </Match>
      </Switch>
      <Button onClick={props.onNext}>{t('family-invite.waitlist-done')}</Button>
    </div>
  );
};
