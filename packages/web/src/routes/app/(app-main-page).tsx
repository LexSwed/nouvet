import { Title } from '@solidjs/meta';
import { A, createAsync, type RouteDefinition } from '@solidjs/router';
import { For, Show } from 'solid-js';
import {
  Avatar,
  Button,
  ButtonLink,
  Card,
  Form,
  Icon,
  RadioCard,
  Text,
  TextField,
  type SvgIcons,
} from '@nou/ui';

import { createTranslator, getDictionary } from '~/i18n';

import { getUserFamilyAndPets } from './_queries';

export const route = {
  load() {
    getDictionary('app');
    getUserFamilyAndPets();
  },
} satisfies RouteDefinition;

function AppMainPage() {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamilyAndPets());

  const animalTypes: Array<{ value: string; label: string; icon: SvgIcons }> = [
    {
      value: 'dog',
      label: t('app.animal-type.dog')!,
      icon: 'dog',
    },
    {
      value: 'cat',
      label: t('app.animal-type.cat')!,
      icon: 'cat',
    },
    {
      value: 'bird',
      label: t('app.animal-type.bird')!,
      icon: 'bird',
    },
    {
      value: 'fish',
      label: t('app.animal-type.fish')!,
      icon: 'fish',
    },
    {
      value: 'rabbit',
      label: t('app.animal-type.rabbit')!,
      icon: 'rabbit',
    },
    {
      value: 'horse',
      label: t('app.animal-type.horse')!,
      icon: 'horse',
    },
    {
      value: 'other',
      label: t('app.animal-type.other')!,
      icon: 'alien',
    },
  ];
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
              <Avatar name={user().name || ''} avatarUrl={user().avatarUrl} />
            </header>
            <div class="flex flex-col gap-6">
              <section class="container">
                <Card class="p-0">
                  <Form
                    aria-labelledby="new-pet"
                    class="group/form flex flex-col gap-4 p-4"
                    method="get"
                    action="/new"
                  >
                    <Text with="headline-2" as="h3" id="new-pet">
                      {t('app.new-pet-heading')}
                    </Text>
                    <TextField
                      label={t('app.new-pet-text-field-label')}
                      placeholder={t('app.new-pet-text-field-placeholder')}
                      name="name"
                      required
                    />
                    <div class="scrollbar-none -mx-2 flex snap-mandatory snap-start scroll-px-2 flex-row gap-2 overflow-auto px-2 pb-2 pt-0">
                      <For each={animalTypes}>
                        {(item, index) => (
                          <RadioCard
                            class="w-[8rem] snap-x"
                            name="animal-type"
                            value={item.value}
                            label={item.label}
                            icon={<Icon size="sm" use={item.icon} />}
                            checked={index() === 0}
                          />
                        )}
                      </For>
                    </div>
                    <TextField
                      name="animal-type-other"
                      label={t('app.animal-type-other.label')}
                      placeholder={t('app.animal-type-other.placeholder')}
                      description={t('app.animal-type-other.placeholder')}
                      class="hidden group-has-[input[name=animal-type][value=other]:checked]/form:flex"
                    />
                    <Button type="submit">Create</Button>
                  </Form>
                  <Show when={!user().family && user().pets.length === 0}>
                    <>
                      <hr class="border-outline/20" />
                      <A
                        href="/app/join"
                        class="flex flex-row items-center justify-between gap-2 text-balance rounded-b-[inherit] p-4"
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
                    </>
                  </Show>
                </Card>
              </section>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}

export default AppMainPage;
