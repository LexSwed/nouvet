import { type RouteDefinition } from '@solidjs/router';
import { type ParentProps } from 'solid-js';
import { getDictionary } from '~/i18n';

export const route = {
  load() {
    getDictionary('family');
  },
} satisfies RouteDefinition;

function FamilyLayout(props: ParentProps) {
  return <>{props.children}</>;
}

export default FamilyLayout;
