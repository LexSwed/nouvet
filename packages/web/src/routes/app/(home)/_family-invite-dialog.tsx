import { Button, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

export const FamilyInviteDialog = (props: { id: string }) => {
  const t = createTranslator('app');

  return (
    <Popover
      id={props.id}
      placement="center"
      role="dialog"
      class="w-[94svw] max-w-[420px]"
    >
      <header>{t('Sharing is carying')}</header>
      <Text as="p">{t('Share the care for your pets with a partner.')}</Text>
      <ul>
        <li>Bullet point 1 with an icon</li>
        <li>Bullet point 2 with an icon</li>
        <li>Bullet point 3 with an icon</li>
        <li>Bullet point 4 with an icon</li>
      </ul>
      <Button>{t('invite')}</Button>
    </Popover>
  );
};
