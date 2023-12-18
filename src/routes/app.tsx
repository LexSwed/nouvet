import { type RouteDefinition, type RouteSectionProps } from '@solidjs/router';
import { getDictionary } from '~/i18n';

export const route = {
  async load() {
    getDictionary('app');
  },
} satisfies RouteDefinition;

function MainAppLayout(props: RouteSectionProps) {
  return <div class="min-h-full">{props.children}</div>;
}

export default MainAppLayout;
