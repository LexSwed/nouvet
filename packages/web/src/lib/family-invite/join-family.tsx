import { createPermission } from '@solid-primitives/permission';
import { createAsync } from '@solidjs/router';
import { createUniqueId, lazy, Match, Show, Suspense, Switch } from 'solid-js';
import { Button, Icon, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

const QRCodeScanner = lazy(() => import('./qr-scanner'));
const JoinFamily = (props: { onCancel: () => void; onSuccess: () => void }) => {
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
    <div class="-mt-8 flex flex-col items-center gap-6">
      <div class="bg-on-surface/5 grid size-20 shrink-0 place-content-center self-center rounded-full">
        <Icon use="qr-code" size="md" />
      </div>
      <Text class="text-balance text-center">
        {t('family-invite.join-instruction')}
      </Text>
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
              <QRCodeScanner onSuccess={props.onSuccess} />
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

export default JoinFamily;
