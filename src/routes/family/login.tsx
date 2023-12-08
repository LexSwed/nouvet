import { Title } from '@solidjs/meta';
import { createTranslator } from '~/i18n';
import { ButtonLink } from '~/lib/ui/button';

function FamilyPage() {
  const t = createTranslator('family');

  return (
    <>
      <Title>{t('family.meta.title')}</Title>
      <section>
        <ButtonLink href="/api/auth/facebook">{t('family.login')}</ButtonLink>
      </section>
    </>
  );
}

export default FamilyPage;
