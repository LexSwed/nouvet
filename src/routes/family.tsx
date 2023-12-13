import { createAsync, Navigate, type RouteDefinition } from '@solidjs/router';
import { type ParentProps } from 'solid-js';
import { getDictionary } from '~/i18n';
import { getCurrentUserHasPets } from '~/server/api/family';

export const route = {
  load() {
    getDictionary('family');
  },
} satisfies RouteDefinition;

function FamilyLayout(props: ParentProps) {
  const isNewUser = createAsync(() => getCurrentUserHasPets());
  if (isNewUser()) return <Navigate href="/family/new" />;
  return <>{props.children}</>;
}

export default FamilyLayout;
