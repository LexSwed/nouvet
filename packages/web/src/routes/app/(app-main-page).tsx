import { Title } from '@solidjs/meta';
import { A, createAsync, type RouteDefinition } from '@solidjs/router';
import { For, lazy, Match, Show, Suspense, Switch } from 'solid-js';
import { Button, ButtonLink, Card, Icon, Text } from '@nou/ui';

import { getUserFamily, getUserPets } from '~/api/user';
import { AccountMenu } from '~/lib/account-menu';
import { createTranslator, getDictionary } from '~/server/i18n';

const CreateNewPetForm = lazy(() => import('~/lib/create-new-pet-form'));

export const route = {
  load() {
    getDictionary('app');
    getUserFamily();
  },
} satisfies RouteDefinition;

function AppMainPage() {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamily());

  return (
    <Show when={user()}>
      {(user) => (
        <>
          <Title>
            <Show
              when={user().family?.name}
              children={t('app.meta.title', {
                familyName: user().family!.name!,
              })}
              fallback={t('app.meta.title-new-user')}
            />
          </Title>
          <div class="bg-background min-h-full">
            <header class="align-center flex justify-between p-4">
              <Show
                when={user().family}
                children={
                  <ButtonLink href={`/app/${user().family?.id}`} variant="link">
                    {user().family?.name}
                  </ButtonLink>
                }
                fallback={
                  <ButtonLink href={`/app/family`} variant="link">
                    {t('app.my-family-cta')}
                  </ButtonLink>
                }
              />
              <AccountMenu
                name={user().name || ''}
                avatarUrl={user().avatarUrl}
              />
            </header>
            <div class="flex flex-col gap-6">
              <section class="container">
                <Suspense>
                  <UserPets familyId={user().family?.id} />
                </Suspense>
              </section>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}

const UserPets = (props: { familyId: number | undefined }) => {
  const t = createTranslator('app');
  const pets = createAsync(() => getUserPets());
  return (
    <Switch>
      <Match when={pets()?.length ?? 0 > 0}>
        <>
          <ul class="scrollbar-none -mx-3 grid snap-x snap-mandatory scroll-p-3 grid-flow-col grid-cols-[repeat(auto-fit,100%)] gap-2 overflow-auto px-3 py-2 [&>*]:snap-start">
            <For each={pets()}>
              {(pet) => (
                <Card
                  role="listitem"
                  variant="flat"
                  class="flex w-full flex-col gap-4"
                >
                  <A
                    href={`/app/pet/${pet.id}/`}
                    class="-m-4 flex flex-row items-start gap-4 p-4"
                  >
                    <div class="bg-tertiary/10 text-tertiary grid size-24 shrink-0 place-content-center rounded-md">
                      <Show
                        when={pet.pictureUrl}
                        children={
                          <img
                            src={pet.pictureUrl!}
                            class="aspect-square w-full"
                            alt=""
                          />
                        }
                        fallback={<Icon use="camera-plus" size="md" />}
                      />
                    </div>
                    <div class="flex flex-row items-center gap-2">
                      <Text with="body-xl">{pet.name}</Text>
                      <Button
                        icon
                        variant="ghost"
                        size="sm"
                        aria-hidden
                        tabIndex={-1}
                      >
                        <Icon use="pencil" size="sm" />
                      </Button>
                    </div>
                  </A>
                  <div class="flex flex-col">
                    <ul class="overflow-snap -mx-4 grid scroll-p-4 grid-flow-col justify-start gap-2 px-4 py-2 [grid-auto-columns:min-content]">
                      <li class="contents">
                        <Button
                          variant="outline"
                          size="sm"
                          class="gap-2 text-nowrap"
                        >
                          <Icon use="calendar-plus" size="sm" />
                          <Text with="label-sm">
                            {t('app.animal-shortcut.birth-date')}
                          </Text>
                        </Button>
                      </li>
                      <li class="contents">
                        <Button
                          variant="outline"
                          size="sm"
                          class="gap-2 text-nowrap"
                        >
                          <Icon use="scales" size="sm" />
                          <Text with="label-sm">
                            {t('app.animal-shortcut.weight')}
                          </Text>
                        </Button>
                      </li>
                      <li class="contents">
                        <Button
                          variant="outline"
                          size="sm"
                          class="gap-2 text-nowrap"
                        >
                          <Icon use="carrot" size="sm" />
                          <Text with="label-sm">
                            {t('app.animal-shortcut.nutrition')}
                          </Text>
                        </Button>
                      </li>
                    </ul>
                  </div>
                </Card>
              )}
            </For>
          </ul>
          <Button variant="ghost" class="w-full">
            Add More
          </Button>
        </>
      </Match>
      <Match when={pets()?.length === 0}>
        <CreateNewPetForm minimal>
          <Show when={!props.familyId}>
            <A
              href="/app/join"
              class="bg-surface-container-high flex flex-row items-center justify-between gap-2 text-balance rounded-[inherit] p-4"
            >
              <h3 class="text-primary text-sm">
                {t('app.invite-card-heading')}
              </h3>
              <Icon
                use="arrow-circle-up-right"
                class="text-primary"
                size="sm"
              />
            </A>
          </Show>
        </CreateNewPetForm>
      </Match>
    </Switch>
  );
};

export default AppMainPage;
