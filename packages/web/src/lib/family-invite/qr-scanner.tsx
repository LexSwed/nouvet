import { useAction, useSubmission } from '@solidjs/router';
import {
  createEffect,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from 'solid-js';
import { Button, Icon, Spinner, Text } from '@nou/ui';
import QrScanner from 'qr-scanner';

import { joinFamilyWithQRCode } from '~/server/api/family-invite';
import { createTranslator } from '~/server/i18n';

import { startViewTransition } from '../utils/start-view-transition';

const QRCodeScannerPage = (props: { onSuccess: () => void }) => {
  const t = createTranslator('app');
  const join = useAction(joinFamilyWithQRCode);
  const joinSubmission = useSubmission(joinFamilyWithQRCode);
  const [imageData, setImageData] = createSignal<string | null>(null);

  const onScanSuccess = async (inviteCode: string, imageData: string) => {
    try {
      setImageData(imageData);
      const res = await join(inviteCode);
      if (res.familyId) {
        startViewTransition(() => {
          props.onSuccess();
        });
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  onCleanup(joinSubmission.clear);

  return (
    <Switch>
      <Match when={joinSubmission.error}>
        <div class="stack">
          <Show when={imageData()}>
            {(src) => (
              <div class="animate-in fill-mode-both fade-in size-full rounded-2xl blur-sm duration-300 [clip-path:border-box]">
                <img
                  src={src()}
                  alt=""
                  class="h-full -scale-x-100 rounded-2xl object-cover object-center"
                />
              </div>
            )}
          </Show>
          <div class="animate-in bg-surface/90 zoom-in-95 fill-mode-both fade-in flex size-full flex-col items-center justify-center gap-8 rounded-2xl p-4 duration-300">
            <Text with="label-lg" class="text-balance text-center">
              {t('family-invite.expired-heading')}
            </Text>
            <Text class="text-balance text-center">
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
  onSuccess: (url: string, image: string) => void;
}) => {
  const [videoEl, setVideoElement] = createSignal<HTMLVideoElement | null>(
    null,
  );
  let canvas: HTMLCanvasElement | null = null;

  createEffect(() => {
    const ref = videoEl();
    if (!ref) return;

    const qrScanner = new QrScanner(
      ref,
      (result) => {
        if (result.data) {
          props.onSuccess(result.data, qrScanner.$canvas.toDataURL());
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
    <div class="stack">
      <canvas ref={(el) => (canvas = el)} class="size-[300px] rounded-2xl" />
      <video
        ref={setVideoElement}
        class="size-[300px] rounded-2xl object-cover"
      />
    </div>
  );
};
