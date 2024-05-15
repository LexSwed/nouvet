import type { RouteSectionProps } from '@solidjs/router';

function FamilyUserPage(props: RouteSectionProps) {
  return <>{props.params['userId']}</>;
}

export default FamilyUserPage;
