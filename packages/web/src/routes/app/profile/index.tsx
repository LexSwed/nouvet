import { Title } from '@solidjs/meta';
import { createAsync, type RouteDefinition } from '@solidjs/router';
import { Show, Suspense } from 'solid-js';
import { Avatar, Button, Card, Option, Picker, Text, TextField } from '@nou/ui';

import { getUserProfile } from '~/server/api/user';
import type { DatabaseUser } from '~/server/db/schema';
import { cacheTranslations, createTranslator } from '~/server/i18n';
import type { SupportedLocale } from '~/server/i18n/shared';

import { AppHeader } from '~/lib/app-header';

export const route = {
  load() {
    void cacheTranslations('profile');
    void getUserProfile();
  },
} satisfies RouteDefinition;

export default function ProfilePage() {
  const t = createTranslator('profile');

  const user = createAsync(() => getUserProfile());

  return (
    <>
      <Title>{t('meta.title')}</Title>
      <div class="bg-background min-h-full">
        <AppHeader backLink />
        <section class="container flex flex-col items-center gap-6">
          <Suspense>
            <Show when={user()}>
              {(user) => (
                <Card
                  variant="outlined"
                  class="flex w-full max-w-96 flex-col gap-12"
                  as="form"
                  aria-labelledby="heading-profile"
                >
                  <div class="flex flex-col gap-3">
                    <Text with="overline" id="heading-profile">
                      {t('section.profile')}
                    </Text>
                    <div class="flex flex-row items-center gap-8">
                      <TextField
                        label={t('setting.name')}
                        value={user().name ?? ''}
                        class="flex-[2]"
                        autocomplete="name"
                      />
                      <Avatar
                        avatarUrl={user().avatarUrl}
                        name={user().name || ''}
                        size="lg"
                      />
                    </div>
                  </div>

                  <fieldset class="grid grid-cols-2 gap-6">
                    <Text as="legend" with="overline" class="mb-3">
                      {t('section.locale')}
                    </Text>
                    <Picker
                      label={t('setting.measure-system.label')}
                      value={user().measurementSystem}
                    >
                      <Option
                        value={
                          'metrical' satisfies DatabaseUser['measurementSystem']
                        }
                        label="Metric"
                      >
                        <Text with="body-xs" tone="light">
                          {t('setting.measure-system.metric-example')}
                        </Text>
                      </Option>
                      <Option
                        value={
                          'imperial' satisfies DatabaseUser['measurementSystem']
                        }
                        label={t('setting.measure-system.imperial')}
                      >
                        <Text with="body-xs" tone="light">
                          {t('setting.measure-system.imperial-example')}
                        </Text>
                      </Option>
                    </Picker>

                    <Picker
                      label={t('setting.locale')}
                      value={user().locale}
                      autocomplete="language"
                      class="[&_[data-part=trigger]_[data-flag]]:block"
                    >
                      <Option
                        value={'en' satisfies SupportedLocale}
                        label={
                          <div class="flex w-full flex-row justify-between gap-4">
                            English
                            <span class="hidden" data-flag>
                              🏴󠁧󠁢󠁥󠁮󠁧󠁿
                            </span>
                          </div>
                        }
                      />
                      <Option
                        value={'es' satisfies SupportedLocale}
                        label={
                          <div class="flex w-full flex-row justify-between gap-4">
                            Español
                            <span class="hidden" data-flag>
                              🇪🇸
                            </span>
                          </div>
                        }
                      />
                    </Picker>
                  </fieldset>
                  <Button>{t('cta.save-profile')}</Button>
                </Card>
              )}
            </Show>
          </Suspense>
        </section>
      </div>
    </>
  );
}
