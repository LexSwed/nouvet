import { createPermission } from '@solid-primitives/permission';
import { createAsync } from '@solidjs/router';
import {
  createSignal,
  createUniqueId,
  lazy,
  Match,
  Show,
  Suspense,
  Switch,
} from 'solid-js';
import { Button, Icon, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

import { FamilyInviteQRCode } from '~/lib/family-invite-qrcode';
import { startViewTransition } from '~/lib/utils/start-view-transition';

import { FamilyInviteBenefits } from './family-invite-benefits';

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
          <JoinFamily onCancel={() => update('initial')} />
        </Match>
      </Switch>
    </>
  );
};

const QRCodeScanner = lazy(() => import('./qr-scanner'));
const JoinFamily = (props: { onCancel: () => void }) => {
  const t = createTranslator('app');
  const supportsCamera = createAsync(async () => {
    try {
      const devices = await navigator.mediaDevices?.enumerateDevices();
      return devices?.some((device) => device.kind === 'videoinput');
    } catch (error) {
      return false;
    }
  });
  const camera = createPermission('camera');
  const disabledId = createUniqueId();
  // we can do this only because we know it's not SSRed
  const orText = new Intl.ListFormat(navigator.language, {
    style: 'short',
    type: 'disjunction',
  })
    .format(['a', 'b'])
    .split(' ')
    .at(1);
  return (
    <div class="flex flex-col items-center gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="bg-on-surface/5 grid size-20 shrink-0 place-content-center self-center rounded-full">
          <Icon use="qr-code" size="md" />
        </div>
        <Text class="text-balance text-center">
          {t('family-invite.join-instruction')}
        </Text>
      </div>
      <Switch>
        <Match when={camera() === 'denied'}>
          <div class="flex flex-col items-center gap-2">
            <Button aria-disabled={true} aria-describedby={disabledId}>
              {t('family-invite.join-scan-cta')}
            </Button>
            <Text
              tone="light"
              as="label"
              id={disabledId}
              with="body-xs"
              class="text-balance text-center"
            >
              {t('family-invite.scan-denied')}
            </Text>
          </div>
        </Match>
        <Match when={camera() === 'granted'}>
          <div class="bg-on-surface/5 size-[300px] rounded-2xl empty:animate-pulse">
            <Suspense>
              <QRCodeScanner />
            </Suspense>
          </div>
        </Match>
        <Match when={camera() !== 'granted'}>
          <div class="flex flex-col items-center gap-4">
            <Show when={supportsCamera()}>
              <Button
                onClick={() =>
                  navigator.mediaDevices.getUserMedia({ video: true })
                }
              >
                {t('family-invite.join-scan-cta')}
              </Button>
              <Text with="body-sm">{orText}</Text>
            </Show>
            <Text class="text-balance text-center">
              {t('family-invite.join-link')}
            </Text>
          </div>
        </Match>
      </Switch>
      <Button variant="ghost" onClick={props.onCancel}>
        {t('family-invite.cta-cancel')}
      </Button>
    </div>
  );
};

export default FamilyInviteDialog;
