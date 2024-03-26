import { useAction, useSubmission } from '@solidjs/router';
import { createEffect, createSignal, Match, onCleanup, Switch } from 'solid-js';
import { Button, Icon, Spinner, Text } from '@nou/ui';
import QrScanner from 'qr-scanner';

import { joinFamilyWithQRCode } from '~/server/api/family-invite';
import { createTranslator } from '~/server/i18n';

import { startViewTransition } from '../utils/start-view-transition';

const QRCodeScannerPage = (props: { onSuccess: () => void }) => {
  const t = createTranslator('app');
  const join = useAction(joinFamilyWithQRCode);
  const joinSubmission = useSubmission(joinFamilyWithQRCode);

  const onScanSuccess = async (inviteCode: string) => {
    try {
      const res = await join(inviteCode);
      console.log(res, joinSubmission.error);
      if (res.familyId) {
        startViewTransition(() => {
          props.onSuccess();
        });
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  onCleanup(() => {
    joinSubmission.clear();
  });

  return (
    <Switch>
      <Match when={joinSubmission.error}>
        <div class="animate-in bg-primary/12 zoom-in-95 fill-mode-both fade-in flex size-full flex-col items-center justify-center gap-8 rounded-[inherit] p-4 delay-300 duration-300">
          <Text with="label-lg" class="text-balance text-center">
            {t('family-invite.expired-heading')}
          </Text>
          <Text with="body-sm" class="text-balance text-center">
            {t('family-invite.expired-description')}
          </Text>
          <Button
            variant="outline"
            onClick={() => joinSubmission.clear()}
            class="gap-2"
          >
            <Icon use="arrows-clockwise" />
            {t('family-invite.expired-cta')}
          </Button>
        </div>
      </Match>
      <Match when={joinSubmission.pending}>
        <div class="grid size-full place-content-center">
          <Spinner size="base" />
        </div>
      </Match>
      <Match when={!joinSubmission.pending && !joinSubmission.error}>
        <div class="bg-on-surface/5 size-[300px] rounded-2xl empty:animate-pulse">
          <QRCodeScanner onSuccess={onScanSuccess} />
        </div>
      </Match>
    </Switch>
  );
};

export default QRCodeScannerPage;

const QRCodeScanner = (props: {
  /**
   * A callback that's executed when a valid URL is recognized.
   */
  onSuccess: (url: string) => void;
}) => {
  const [videoEl, setVideoElement] = createSignal<HTMLVideoElement | null>(
    null,
  );

  createEffect(() => {
    const ref = videoEl();
    if (!ref) return;

    const qrScanner = new QrScanner(
      ref,
      (result) => {
        if (result.data) {
          props.onSuccess(result.data);
        }
      },
      {
        preferredCamera: 'environment',
        maxScansPerSecond: 5,
        onDecodeError: () => null,
      },
    );
    qrScanner.start();
    onCleanup(() => {
      qrScanner.stop();
      qrScanner.destroy();
    });
  });

  return (
    <video
      ref={setVideoElement}
      class="size-[300px] rounded-2xl object-cover"
    />
  );
};
