import { createAsync, revalidate, useSubmission } from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, Card, Form, Icon, Text } from '@nou/ui';

import { getFamilyMembers } from '~/server/api/family';
import { moveUserFromTheWaitList } from '~/server/api/family-invite';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('app');
  const familyMember = createAsync(async () => {
    const members = await getFamilyMembers();
    if (members)
      return members.find((user) => !user.isApproved) || members.at(-1);
    return null;
  });
  const userWaitListSubmission = useSubmission(moveUserFromTheWaitList);

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
              {(user) => (
                <Card
                  role="group"
                  variant="flat"
                  class="from-on-surface/5 flex flex-col gap-4 rounded-3xl bg-transparent bg-gradient-to-br via-transparent via-60% to-transparent"
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
                    <input
                      type="hidden"
                      name="user-id"
                      value={user().id}
                      readOnly
                    />
                    <Button
                      type="submit"
                      value="decline"
                      name="action"
                      size="sm"
                      variant="outline"
                      class="flex-1 gap-3"
                      aria-disabled={userWaitListSubmission.pending}
                      loading={
                        userWaitListSubmission.pending &&
                        userWaitListSubmission.input[0].get('action') ===
                          'decline'
                      }
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
                      aria-disabled={userWaitListSubmission.pending}
                      loading={
                        userWaitListSubmission.pending &&
                        userWaitListSubmission.input[0].get('action') ===
                          'accept'
                      }
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
