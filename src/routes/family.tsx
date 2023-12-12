import { createAsync, Navigate, type RouteDefinition } from '@solidjs/router';
import { Show, type ParentProps } from 'solid-js';
import { getDictionary } from '~/i18n';
import { getUserFamilyAndPets } from '~/server/api/family';

export const route = {
  load() {
    getDictionary('family');
  },
} satisfies RouteDefinition;

function FamilyLayout(props: ParentProps) {
  const isNewUser = createAsync(async () => {
    const family = await getUserFamilyAndPets();
    // TODO: Make a query specifically for this visit, gotta be super fast as it'll be called on every family page visit
    // add familyId to user.locals
    // Get family pets count > 0 or not
    if (family.pets.length === 0) return true;
    return false;
  });
  return (
    <>
      <Show when={isNewUser()}>
        <>
          <Navigate href="/family/new" />
        </>
      </Show>
      <Show when={!isNewUser()}>
        <>{props.children}</>
      </Show>
    </>
  );
}

export default FamilyLayout;
