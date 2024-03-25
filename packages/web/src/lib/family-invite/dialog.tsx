import { createSignal, Match, Show, Suspense, Switch } from 'solid-js';
import { Button, Icon, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

import { startViewTransition } from '~/lib/utils/start-view-transition';
import { FamilyInviteBenefits } from '../family-invite-benefits';

import { FamilyInviteQRCode } from './invite-qrcode';
import JoinFamily from './join-family';

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

type Step = 'initial' | 'qrcode' | 'waitlist' | 'join';
const InviteDialogContent = (props: { id: string }) => {
  const t = createTranslator('app');
  const [step, setStep] = createSignal<Step>('initial');
  const update = (newStep: Step) =>
    startViewTransition(() => {
      setStep(newStep);
    });

  return (
    <>
      <header class="-m-4 flex flex-row items-center justify-between gap-2">
        <Show when={step() !== 'initial'} fallback={<div />}>
          <Button
            variant="ghost"
            icon
            label={t('family-invite.back')}
            onClick={() => {
              switch (step()) {
                case 'qrcode':
                  return update('initial');
                case 'join':
                  return update('initial');
                case 'waitlist':
                  return update('qrcode');
                default:
                  return null;
              }
            }}
          >
            <Icon use="chevron-left" />
          </Button>
        </Show>
        <Text as="p" class="text-center font-medium">
          <Switch>
            <Match when={step() === 'waitlist'}>
              {t('family-invite.step-3')}
            </Match>
          </Switch>
        </Text>
        <Button
          variant="ghost"
          popoverTarget={props.id}
          popoverTargetAction="hide"
          icon
          label={t('family-invite.close')}
        >
          <Icon use="x" />
        </Button>
      </header>
      <Switch>
        <Match when={step() === 'initial'}>
          <div class="flex flex-col gap-6">
            <Text with="headline-2" as="h2" id={`${props.id}-headline`}>
              {t('family-invite.headline')}
            </Text>
            <Text as="p">{t('family-invite.subheadline')}</Text>
            <FamilyInviteBenefits class="-mx-6 scroll-px-6 px-6" />
          </div>
          <div class="flex flex-col gap-4">
            <Button onClick={() => update('qrcode')}>
              {t('family-invite.cta-invite')}
            </Button>
            <div class="self-center">
              <Button
                variant="link"
                onClick={() => {
                  update('join');
                }}
              >
                {t('family-invite.join')}
              </Button>
            </div>
          </div>
        </Match>
        <Match when={step() === 'qrcode'}>
          <FamilyInviteQRCode onNext={() => update('waitlist')} />
        </Match>
        <Match when={step() === 'waitlist'}>
          <div class="flex flex-col gap-4">
            <Text as="p" class="text-balance text-center">
              {t('family-invite.waiting-people')}
            </Text>
            <Button popoverTarget={props.id} popoverTargetAction="hide">
              {t('family-invite.cta-later')}
            </Button>
          </div>
        </Match>
        <Match when={step() === 'join'}>
          <JoinFamily
            onCancel={() => update('initial')}
            popoverTarget={props.id}
          />
        </Match>
      </Switch>
    </>
  );
};

export default FamilyInviteDialog;
