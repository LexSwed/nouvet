import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import {
  createUniqueId,
  For,
  lazy,
  Match,
  Show,
  Suspense,
  Switch,
} from 'solid-js';
import { Button, Card, Icon } from '@nou/ui';

import { getUserPets } from '~/server/api/pet';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';
import { PetHomeCard } from '~/lib/pet-home-card';

const CreateNewPetForm = lazy(() => import('~/lib/create-new-pet-form'));
const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

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
  const t = createTranslator('app');

  const user = createAsync(() => getUserFamily());

  return (
    <div class="bg-background min-h-full">
      <AppHeader>Go back?</AppHeader>
      <Suspense>{props.children}</Suspense>
    </div>
  );
};

export default PetPage;
