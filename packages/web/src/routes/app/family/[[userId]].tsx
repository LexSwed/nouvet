import type { RouteSectionProps } from '@solidjs/router';
import { Card } from '@nou/ui';

function FamilyUserPage(props: RouteSectionProps) {
  return <Card variant="flat">{props.params['userId']}</Card>;
}

export default FamilyUserPage;
