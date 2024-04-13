import { createSignal, Match, Show, Suspense, Switch } from 'solid-js';
import { Button, Card, Icon, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

import { startViewTransition } from '~/lib/utils/start-view-transition';
import { FamilyInviteBenefits } from '../family-invite-benefits';

import { FamilyInviteQRCode } from './invite-qrcode';
import { InviteWaitlist } from './invite-waitlist';
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

type Step = 'initial' | 'qrcode' | 'waitlist' | 'join' | 'join-success';
const InviteDialogContent = (props: { id: string }) => {
  const t = createTranslator('family');
  const [step, setStep] = createSignal<Step>('initial');
  const update = (newStep: Step) =>
    startViewTransition(() => {
      setStep(newStep);
    });

  const closePopover = () => {
    const popover = document.getElementById(props.id);
    popover?.hidePopover();
  };

  return (
    <>
      <header class="-m-4 flex flex-row items-center justify-between gap-2">
        <Show
          when={!new Set<Step>(['initial', 'join-success']).has(step())}
          fallback={<div />}
        >
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
        <Match when={step() === 'join'}>
          <JoinFamily
            onCancel={() => update('initial')}
            onSuccess={() => update('join-success')}
          />
        </Match>
        <Match when={step() === 'waitlist'}>
          <InviteWaitlist onNext={closePopover} />
        </Match>
        <Match when={step() === 'join-success'}>
          <div class="animate-in fade-in duration-500">
            <Card variant="filled" class="absolute inset-0" />
            <div class="text-on-secondary-container relative flex flex-col items-center gap-8">
              <div class="flex flex-col items-center gap-6">
                <Icon use="check-fat" size="lg" />
                <Text class="text-balance text-center">
                  {t('family-invite.join-success')}
                </Text>
              </div>
              <Button
                variant="outline"
                popoverTarget={props.id}
                popoverTargetAction="hide"
              >
                {t('family-invite.join-success-done')}
              </Button>
            </div>
          </div>
        </Match>
      </Switch>
    </>
  );
};

export default FamilyInviteDialog;
