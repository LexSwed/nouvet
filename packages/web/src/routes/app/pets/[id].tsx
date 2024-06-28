/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsync, type RouteDefinition } from '@solidjs/router';
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

const PetPage = () => {
  const t = createTranslator('app');

  const pets = createAsync(() => getUserPets());

  const user = createAsync(() => getUserFamily());

  const hasPets = () => (pets()?.length ?? 0) > 0;

  return <section class="container flex flex-col gap-8">Hello world</section>;
};

export default PetPage;
