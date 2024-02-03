import { Title } from '@solidjs/meta';

import { createTranslator } from '~/server/i18n';

export default function Privacy() {
  const t = createTranslator('www');
  return (
    <>
      <Title>{t('meta.main-title')}</Title>
    </>
  );
}
