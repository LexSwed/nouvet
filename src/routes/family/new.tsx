import { Title } from '@solidjs/meta';
import { createTranslator } from '~/i18n';

function NewUserPage() {
  const t = createTranslator('family');

  return (
    <>
      <Title>{t('family.meta.title-new-user')}</Title>
      <section>Welcome</section>
    </>
  );
}

export default NewUserPage;
