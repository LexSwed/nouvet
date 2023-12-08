import { Title } from '@solidjs/meta';
import { createTranslator } from '~/i18n';

export default function Privacy() {
  const t = createTranslator('www');
  return (
    <>
      <Title>{t('www.meta.main-title')}</Title>
    </>
  );
}
