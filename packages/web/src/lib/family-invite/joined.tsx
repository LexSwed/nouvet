import { Button, Card, Icon, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

export function Joined(props: { popoverTarget?: string | undefined }) {
  const t = createTranslator('family');
  return (
    <div class="animate-in fade-in duration-500">
      <Card variant="tonal" tone="primary" class="absolute inset-0" />
      <div class="text-on-secondary-container relative flex flex-col items-center gap-8">
        <div class="flex flex-col items-center gap-6">
          <Icon use="check-fat" size="lg" />
          <Text class="text-balance text-center">
            {t('invite.join-success')}
          </Text>
        </div>
        <Button
          variant="outline"
          popoverTarget={props.popoverTarget}
          popoverTargetAction="hide"
        >
          {t('invite.join-success-done')}
        </Button>
      </div>
    </div>
  );
}
