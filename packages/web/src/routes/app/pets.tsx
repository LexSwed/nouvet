import { type RouteDefinition, type RouteSectionProps } from '@solidjs/router';
import { Suspense } from 'solid-js';

import { getUserPets } from '~/server/api/pet';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';

export const route = {
  load() {
    return Promise.all([
      cacheTranslations('app'),
      getUserPets(),
      getUserFamily(),
    ]);
  },
} satisfies RouteDefinition;

const PetPage = (props: RouteSectionProps) => {
  return (
    <div class="bg-background min-h-full">
      <AppHeader>Go back?</AppHeader>
      <Suspense>{props.children}</Suspense>
    </div>
  );
};

export default PetPage;
