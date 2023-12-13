import {
  createAsync,
  Navigate,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Match, Switch } from 'solid-js';
import { getDictionary } from '~/i18n';
import { getIsEmptyUser } from '~/server/api/family';

export const route = {
  async load() {
    getDictionary('family');
  },
} satisfies RouteDefinition;

function FamilyLayout(props: RouteSectionProps) {
  const isNewUser = createAsync(() => getIsEmptyUser());
  console.log(props.location.pathname);
  const newUserAndNotOnNewFlow = () =>
    isNewUser() && props.location.pathname !== '/family/new';

  return (
    <Switch fallback={props.children}>
      <Match when={newUserAndNotOnNewFlow()}>
        <Navigate href="/family/new" />
      </Match>
    </Switch>
  );
}

export default FamilyLayout;
