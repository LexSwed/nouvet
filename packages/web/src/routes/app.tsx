import { type RouteDefinition, type RouteSectionProps } from '@solidjs/router';

import { getDictionary } from '~/server/i18n';

export const route = {
  async load() {
    getDictionary('app');
  },
} satisfies RouteDefinition;

function MainAppLayout(props: RouteSectionProps) {
  return <>{props.children}</>;
}

export default MainAppLayout;
