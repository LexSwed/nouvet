import { Title } from '@solidjs/meta';
import { A, action, createAsync, type RouteDefinition } from '@solidjs/router';
import { Show } from 'solid-js';
import {
  Avatar,
  Button,
  ButtonLink,
  Card,
  Form,
  Icon,
  Text,
  TextField,
} from '@nou/ui';

import { createTranslator, getDictionary } from '~/i18n';
import { AnimalTypeSelect } from '~/lib/animal-type';

import { getUserFamilyAndPets } from './_queries';

export const route = {
  load() {
    getDictionary('app');
    getUserFamilyAndPets();
  },
} satisfies RouteDefinition;

const createPet = action(async (formData) => {
  'use server';
  console.log(formData);
  // validate
  // db query
  // return data
}, 'createPet');

function AppMainPage() {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamilyAndPets());

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
                <Card class="flex flex-col gap-6 p-4">
                  <Form
                    aria-labelledby="new-pet"
                    class="flex flex-col gap-6"
                    action={createPet}
                    method="post"
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
                    <AnimalTypeSelect typeName="type" genderName="gender" />

                    <Button type="submit">Create</Button>
                  </Form>
                  <Show when={!user().family && user().pets.length === 0}>
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
