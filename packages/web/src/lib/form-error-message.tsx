import { Card, Text, tw } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

const FormErrorMessage = (props: { class?: string }) => {
  const t = createTranslator('pet-forms');

  return (
    <Card
      variant="tonal"
      tone="primary-light"
      id="error-message"
      aria-live="polite"
      class={tw(
        'bg-error-container text-on-error-container rounded-lg p-2',
        props.class,
      )}
    >
      <Text with="body-sm">{t('failure.title')}</Text>
    </Card>
  );
};

export { FormErrorMessage };
