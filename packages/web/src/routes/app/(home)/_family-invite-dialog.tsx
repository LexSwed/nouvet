import { Button, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

export const FamilyInviteDialog = (props: { id: string }) => {
  const t = createTranslator('app');

  return (
    <Popover
      id={props.id}
      placement="center"
      role="dialog"
      class="flex w-[94svw] max-w-[420px] flex-col gap-6 p-6"
    >
      <Text with="headline-2" as="header">
        {t('family-invite.headline')}
      </Text>
      <Text as="p">{t('family-invite.subheadline')}</Text>
      <ul>
        <li>Bullet point 1 with an icon</li>
        <li>Bullet point 2 with an icon</li>
        <li>Bullet point 3 with an icon</li>
        <li>Bullet point 4 with an icon</li>
      </ul>
      <Button>{t('family-invite.cta')}</Button>
    </Popover>
  );
};
