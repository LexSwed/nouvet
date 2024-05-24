import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Show } from 'solid-js';
import { Card } from '@nou/ui';

import { getFamilyMember } from '~/server/api/family';
import { cacheTranslations } from '~/server/i18n';

export const route = {
  load({ params }) {
    void cacheTranslations('family');
    void getFamilyMember(params.memberId);
  },
} satisfies RouteDefinition;

function FamilyUserPage(props: RouteSectionProps) {
  const member = createAsync(() => getFamilyMember(props.params.memberId));
  return (
    <Card variant="flat">
      <Show when={member()}>{(member) => <>{member().name}</>}</Show>
    </Card>
  );
}

export default FamilyUserPage;
