import { type RouteDefinition, type RouteSectionProps } from '@solidjs/router';

import { getDictionaryCached } from '~/server/i18n';

export const route = {
  async load() {
    getDictionaryCached('app');
  },
} satisfies RouteDefinition;

function MainAppLayout(props: RouteSectionProps) {
  return <>{props.children}</>;
}

export default MainAppLayout;
