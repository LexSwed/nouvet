import { createSignal, Match, Show, Suspense, Switch } from 'solid-js';
import { Button, Icon, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

import { FamilyInviteQRCode } from '~/lib/family-invite-qrcode';
import { startViewTransition } from '~/lib/start-view-transition';

const FamilyInviteDialog = (props: { id: string }) => {
  return (
    <Popover
      id={props.id}
      placement="center"
      aria-labelledby={`${props.id}-headline`}
      role="dialog"
      class="to-primary/10 via-surface from-surface flex w-[94svw] max-w-[420px] flex-col gap-6 bg-gradient-to-b via-65% p-6"
    >
      {(open) => (
        <Show when={open()}>
          <Suspense>
            <InviteDialogContent id={props.id} />
          </Suspense>
        </Show>
      )}
    </Popover>
  );
};

const InviteDialogContent = (props: { id: string }) => {
  const t = createTranslator('app');
  const tCommon = createTranslator('common');
  // TODO: scroll to a screen with generated QR code, or scan it

  const [step, setStep] = createSignal(0);
  return (
    <>
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
            <Text with="headline-2" as="h2" id={`${props.id}-headline`}>
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
            <Suspense>
              <FamilyInviteQRCode />
            </Suspense>
            <Button popoverTarget={props.id} popoverTargetAction="hide">
              {t('family-invite.cta-done')}
            </Button>
          </div>
        </Match>
      </Switch>
    </>
  );
};

export default FamilyInviteDialog;
