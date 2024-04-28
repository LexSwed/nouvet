import { useSubmission } from '@solidjs/router';
import { Avatar, Button, Card, Form, Icon, Text } from '@nou/ui';

import { moveUserFromTheWaitList } from '~/server/api/family-invite';
import { createTranslator } from '~/server/i18n';

export function WaitingFamilyConfirmation(props: {
  user: { name: string | null; id: number; avatarUrl: string | null };
}) {
  const t = createTranslator('family');

  const userWaitListSubmission = useSubmission(moveUserFromTheWaitList);

  return (
    <Card
      role="group"
      variant="flat"
      class="from-on-surface/5 border-on-surface/2 to-on-surface/2 flex flex-col gap-4 rounded-3xl border bg-transparent bg-gradient-to-br via-transparent via-60%"
    >
      <Text as="header" with="overline">
        {t('invite.waitlist')}
      </Text>
      <div class="flex flex-row items-center justify-start gap-2">
        <Avatar avatarUrl={props.user.avatarUrl} name={props.user.name || ''} />
        <Text with="label-lg">{props.user.name}</Text>
      </div>
      <Text as="p" with="body-sm">
        {t('invite.info-consent')}
      </Text>
      <Form
        class="flex flex-row gap-2"
        action={moveUserFromTheWaitList}
        method="post"
      >
        <input type="hidden" name="user-id" value={props.user.id} readOnly />
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
            userWaitListSubmission.input[0].get('action') === 'decline'
          }
        >
          <Icon use="x" class="-ml-3" />
          {t('invite.waitlist-decline')}
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
            userWaitListSubmission.input[0].get('action') === 'accept'
          }
        >
          <Icon use="check" class="-ml-2" />
          {t('invite.waitlist-accept')}
        </Button>
      </Form>
    </Card>
  );
}
