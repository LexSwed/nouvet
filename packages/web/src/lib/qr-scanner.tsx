import { useAction, useSubmission } from '@solidjs/router';
import { createEffect, createSignal, Match, onCleanup, Switch } from 'solid-js';
import { Spinner } from '@nou/ui';
import QrScanner from 'qr-scanner';

import { joinFamily } from '~/server/api/family-invite';

const QRCodeScannerPage = () => {
  const join = useAction(joinFamily);
  const joinSubmission = useSubmission(joinFamily);

  const onScanSuccess = async (url: string) => {
    const form = new FormData();
    form.set('invite-code', url.split('/family/invite/').at(-1) || '');
    try {
      const res = await join(form);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Switch>
      <Match when={joinSubmission.pending}>
        <div class="grid size-full place-content-center">
          <Spinner size="base" />
        </div>
      </Match>
      <Match when={!joinSubmission.pending}>
        <QRCodeScanner onSuccess={onScanSuccess} />
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
        if (URL.canParse(result.data)) {
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
