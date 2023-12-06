import { createTranslator } from '~/i18n';
import { Button } from '~/lib/ui/button';

function FamilyPage() {
  const t = createTranslator('family');
  return (
    <div>
      <Button>{t('family.login')}</Button>
    </div>
  );
}

export default FamilyPage;
