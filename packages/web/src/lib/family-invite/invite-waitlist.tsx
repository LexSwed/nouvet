import { createAsync } from '@solidjs/router';
import { Match, Switch } from 'solid-js';
import { Button, Icon, Text } from '@nou/ui';

import { allFamilyUsers } from '~/server/api/family';
import { createTranslator } from '~/server/i18n';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('app');
  const waitList = createAsync(async () => {
    const members = await allFamilyUsers();
    return members ? members.waiting : null;
  });

  return (
    <div class="flex flex-col gap-6">
      <Switch>
        <Match when={waitList() === null}>
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
      </Switch>
      <Button onClick={props.onNext}>{t('family-invite.waitlist-done')}</Button>
    </div>
  );
};
