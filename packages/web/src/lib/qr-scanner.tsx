import { createEffect, createSignal, onCleanup } from 'solid-js';
import QrScanner from 'qr-scanner';

const QRCodeScanner = () => {
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
          // send the URL to the BE?
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

export default QRCodeScanner;
