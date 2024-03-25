import { useAction, useSubmission } from '@solidjs/router';
import { createEffect, createSignal, Match, onCleanup, Switch } from 'solid-js';
import { Spinner } from '@nou/ui';
import QrScanner from 'qr-scanner';

import { joinFamilyWithQRCode } from '~/server/api/family-invite';

const QRCodeScannerPage = (props: { onSuccess: () => void }) => {
  const join = useAction(joinFamilyWithQRCode);
  const joinSubmission = useSubmission(joinFamilyWithQRCode);

  const onScanSuccess = async (inviteCode: string) => {
    await join(inviteCode);
    props.onSuccess();
  };

  return (
    <Switch>
      {/* TODO: Error handling */}
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
        console.log(result.data);
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
