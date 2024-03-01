import { createSignal, Match, Show, Switch } from 'solid-js';
import { Button, Icon, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

import { startViewTransition } from '~/lib/start-view-transition';

const FamilyInviteDialog = (props: { id: string }) => {
  const t = createTranslator('app');
  const tCommon = createTranslator('common');
  // TODO: scroll to a screen with generated QR code, or scan it

  const [step, setStep] = createSignal(0);
  const headlineId = () => `${props.id}-headline`;

  return (
    <Popover
      id={props.id}
      placement="center"
      aria-describedby={headlineId()}
      role="dialog"
      class="to-primary/12 from-surface flex w-[94svw] max-w-[420px] flex-col gap-6 bg-gradient-to-b p-6"
    >
      <header class="-m-4 flex flex-row items-center justify-between gap-2">
        <Show when={step() !== 0} fallback={<div />}>
          <Button
            variant="ghost"
            icon
            label={tCommon('back')}
            onClick={() =>
              startViewTransition(() => {
                setStep((current) => current - 1);
              })
            }
          >
            <Icon use="chevron-left" />
          </Button>
        </Show>
        <Button
          variant="ghost"
          popoverTarget={props.id}
          popoverTargetAction="hide"
          icon
          label={tCommon('close-dialog')}
        >
          <Icon use="x" />
        </Button>
      </header>
      <Switch>
        <Match when={step() === 0}>
          <div class="flex flex-col gap-6">
            <Text with="headline-2" as="h2" id={headlineId()}>
              {t('family-invite.headline')}
            </Text>
            <Text as="p">{t('family-invite.subheadline')}</Text>
            {/* TODO: insert screenshots of future features:
      - shared reminders and actions
      - shared notes
      - access to doctor visits and prescriptions */}
            <ul class="overflow-snap -mx-6 flex scroll-px-6 flex-row gap-4 px-6 [&>*]:snap-center">
              <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
              <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
              <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
            </ul>
          </div>
          <div class="flex flex-col gap-2">
            <Button
              onClick={() =>
                startViewTransition(() => {
                  setStep(1);
                })
              }
            >
              {t('family-invite.cta-invite')}
            </Button>
            <div class="self-center">
              <Button variant="link">{t('family-invite.join')}</Button>
            </div>
          </div>
        </Match>
        <Match when={step() === 1}>
          <div class="flex flex-col gap-4">
            <Text as="p" class="text-center">
              {t('family-invite.qr-description')}
            </Text>
            <div class="bg-tertiary/5 aspect-square w-full rounded-2xl" />
            <Button variant="ghost">{t('family-invite.cta-share')}</Button>
            <Button
              onClick={() =>
                startViewTransition(() => {
                  setStep(2);
                })
              }
            >
              {t('family-invite.cta-next')}
            </Button>
          </div>
        </Match>
        <Match when={step() === 2}>
          <div class="flex flex-col gap-6">
            <Button
              onClick={() =>
                startViewTransition(() => {
                  setStep(2);
                })
              }
            >
              done
            </Button>
          </div>
        </Match>
      </Switch>
    </Popover>
  );
};

export default FamilyInviteDialog;
