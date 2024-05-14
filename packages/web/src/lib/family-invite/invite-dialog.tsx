import { Style } from '@solidjs/meta';
import { createSignal, Match, Show, Suspense, Switch } from 'solid-js';
import { Button, Icon, mergeDefaultProps, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

import { startViewTransition } from '~/lib/utils/start-view-transition';
import { FamilyInviteBenefits } from '../family-invite-benefits';

import { FamilyInviteQRCode } from './invite-qrcode';
import { InviteWaitlist } from './invite-waitlist';
import JoinFamily from './join-family';
import { Joined } from './joined';

type Step = 'initial' | 'qrcode' | 'waitlist' | 'join' | 'join-success';
const FamilyInviteDialog = (props: { id: string; initialScreen?: Step }) => {
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
            <InviteDialogContent
              id={props.id}
              initialScreen={props.initialScreen}
            />
          </Suspense>
        </Show>
      )}
    </Popover>
  );
};

/**
 * The component is separated to ensure the `step` is reset after the dialog is closed.
 */
const InviteDialogContent = (ownProps: {
  id: string;
  initialScreen?: Step;
}) => {
  const t = createTranslator('family');
  const props = mergeDefaultProps(ownProps, { initialScreen: 'initial' });
  const [step, setStep] = createSignal<Step>(props.initialScreen);
  const update = async (newStep: Step) => {
    await startViewTransition(() => {
      setStep(newStep);
    });
    const popover = document.getElementById(props.id);
    popover?.focus();
  };

  const closePopover = () => {
    const popover = document.getElementById(props.id);
    popover?.hidePopover();
  };

  return (
    <>
      <Style>``</Style>
      <header class="-m-4 flex flex-row items-center justify-between gap-2">
        <Show
          when={!new Set<Step>(['initial', 'join-success']).has(step())}
          fallback={<div />}
        >
          <Button
            variant="ghost"
            icon
            label={t('invite.back')}
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
        <Text
          aria-hidden
          class="sr-only"
          id={`${props.id}-headline`}
          aria-live="polite"
        >
          <Switch>
            <Match when={step() === 'initial'}>
              {t('invite.step-aria-initial')}
            </Match>
            <Match when={step() === 'qrcode'}>
              {t('invite.step-aria-qrcode')}
            </Match>
            <Match when={step() === 'waitlist'}>
              {t('invite.step-aria-waitlist')}
            </Match>
            <Match when={step() === 'join'}>{t('invite.step-aria-join')}</Match>
            <Match when={step() === 'join-success'}>
              {t('invite.step-aria-join-success')}
            </Match>
          </Switch>
        </Text>
        <Button
          variant="ghost"
          popoverTarget={props.id}
          popoverTargetAction="hide"
          icon
          label={t('invite.close')}
        >
          <Icon use="x" />
        </Button>
      </header>
      <Switch>
        <Match when={step() === 'initial'}>
          <div class="flex flex-col gap-6">
            <Text with="headline-2" as="h2">
              {t('invite.headline')}
            </Text>
            <Text as="p">{t('invite.subheadline')}</Text>
            <FamilyInviteBenefits class="-mx-6 scroll-px-6 px-6" />
          </div>
          <div class="flex flex-col gap-4">
            <Button onClick={() => update('qrcode')}>
              {t('invite.cta-invite')}
            </Button>
            <div class="self-center">
              <Button
                variant="link"
                onClick={() => {
                  update('join');
                }}
              >
                {t('invite.join')}
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
          <Joined popoverTarget={props.id} />
        </Match>
      </Switch>
    </>
  );
};

export default FamilyInviteDialog;
