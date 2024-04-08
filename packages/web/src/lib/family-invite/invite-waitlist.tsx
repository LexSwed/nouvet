import { createAsync } from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, Card, Form, Icon, Text } from '@nou/ui';

import { getFamilyMembers } from '~/server/api/family';
import { moveUserFromTheWaitList } from '~/server/api/family-invite';
import { createTranslator } from '~/server/i18n';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('app');
  const waitList = createAsync(
    async () => {
      const members = await getFamilyMembers();
      return members ? members.filter((user) => !user.isApproved) : [];
    },
    { initialValue: [] },
  );
  const shownUser = () => waitList().at(0);

  return (
    <div class="flex flex-col gap-6">
      <Suspense
        fallback={<div class="bg-on-surface/12 size-[300px] animate-pulse" />}
      >
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
          <Match when={!shownUser()?.isApproved}>
            <Show when={shownUser()}>
              {(user) => (
                <Card
                  role="group"
                  variant="flat"
                  class="bg-on-surface/5 flex flex-col gap-4 rounded-3xl"
                >
                  <Text as="header" with="overline">
                    {t('family-invite.waitlist')}
                  </Text>
                  <div class="flex flex-row items-center justify-start gap-2">
                    <Avatar
                      avatarUrl={user().avatarUrl}
                      name={user().name || ''}
                    />
                    <Text with="label-lg">{user().name}</Text>
                  </div>
                  <Text as="p" with="body-sm">
                    {t('family-invite.info-consent')}
                  </Text>
                  <Form
                    class="flex flex-row gap-2"
                    action={moveUserFromTheWaitList}
                    method="post"
                  >
                    <input type="hidden" name="user-id" value={user().id} />
                    <Button
                      type="submit"
                      value="decline"
                      name="action"
                      size="sm"
                      variant="outline"
                      class="flex-1 gap-3"
                    >
                      <Icon use="x" class="-ml-3" />
                      {t('family-invite.waitlist-decline')}
                    </Button>
                    <Button
                      type="submit"
                      value="accept"
                      name="action"
                      size="sm"
                      variant="outline"
                      class="flex-1 gap-3"
                    >
                      <Icon use="check" class="-ml-2" />
                      {t('family-invite.waitlist-accept')}
                    </Button>
                  </Form>
                </Card>
              )}
            </Show>
          </Match>
        </Switch>
        <Button onClick={props.onNext}>
          {t('family-invite.waitlist-done')}
        </Button>
      </Suspense>
    </div>
  );
};
