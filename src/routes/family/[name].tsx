import { type RouteSectionProps } from '@solidjs/router';

function FamilyPage(props: RouteSectionProps) {
  return <>{props.params.name}</>;
}

export default FamilyPage;
