import { Button, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

export const FamilyInviteDialog = (props: { id: string }) => {
  const t = createTranslator('app');

  return (
    <Popover
      id={props.id}
      placement="center"
      role="dialog"
      class="to-primary/12 from-surface  flex w-[94svw] max-w-[420px] flex-col gap-6 bg-gradient-to-b p-6"
    >
      <Text with="headline-2" as="header">
        {t('family-invite.headline')}
      </Text>
      <Text as="p">{t('family-invite.subheadline')}</Text>
      {/* TODO: insert screenshots of future features:
      - shared reminders and actions
      - shared notes
      - access to doctor visits and prescriptions */}
      <ul class="overflow-snap -mx-6 flex scroll-px-6 flex-row gap-4 px-6 py-2">
        <li class="bg-tertiary/15 h-24 w-[95%] rounded-2xl" />
        <li class="bg-tertiary/15 h-24 w-[95%] rounded-2xl" />
        <li class="bg-tertiary/15 h-24 w-[95%] rounded-2xl" />
      </ul>
      <div class="flex flex-col gap-2">
        <Button>{t('family-invite.cta')}</Button>
        <Button variant="link" class="self-center">
          {t('family-invite.join')}
        </Button>
      </div>
    </Popover>
  );
};
