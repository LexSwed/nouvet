import { Title } from '@solidjs/meta';
import { createTranslator } from '~/i18n';

function NewUserPage() {
  const t = createTranslator('app');

  return (
    <>
      <Title>{t('app.meta.title-new-user')}</Title>
      <section>Welcome</section>
    </>
  );
}

export default NewUserPage;
