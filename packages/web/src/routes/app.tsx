import { type RouteDefinition, type RouteSectionProps } from '@solidjs/router';

import { cacheTranslations } from '~/server/i18n';

export const route = {
  async load() {
    return Promise.all([cacheTranslations('app')]);
  },
} satisfies RouteDefinition;

function MainAppLayout(props: RouteSectionProps) {
  return <>{props.children}</>;
}

export default MainAppLayout;
