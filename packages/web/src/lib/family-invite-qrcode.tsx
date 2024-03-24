import { createAsync } from '@solidjs/router';
import { createEffect, createSignal, Match, Suspense, Switch } from 'solid-js';
import { Button, Card, Spinner, Text } from '@nou/ui';

import { getFamilyInvite } from '~/server/api/family-invite';
import { createTranslator } from '~/server/i18n';

export const FamilyInviteQRCode = (props: { onNext: () => void }) => {
  const t = createTranslator('app');
  // TODO: error handling
  const inviteData = createAsync(() => getFamilyInvite());
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(
    null,
  );
  const [consentShown, setConsentShown] = createSignal(true);

  async function share() {
    const shareData = {
      url: inviteData()?.url,
      title: t('family-invite.invite-share-title-no-name'),
      text: t('family-invite.invite-share-text'),
    } satisfies ShareData;
    await navigator.share(shareData);
  }

  createEffect(() => {
    const url = inviteData()?.url;
    const container = containerRef();
    if (url && container && !consentShown()) {
      createQRCode(url, container);
    }
  });

  return (
    <div class="flex flex-col gap-6">
      <div class="flex w-full flex-col items-center justify-center gap-2">
        <Switch>
          <Match when={consentShown()}>
            <Card
              class="flex w-full flex-col justify-stretch gap-4"
              variant="outlined"
            >
              <Text with="body">{t('family-invite.info-consent')}</Text>
              <Button
                size="sm"
                variant="link"
                onClick={() => {
                  setConsentShown(false);
                }}
              >
                {t('family-invite.info-consent-accept')}
              </Button>
            </Card>
          </Match>
          <Match when={!consentShown()}>
            <Text as="p" class="text-balance text-center">
              {t('family-invite.qr-description')}
            </Text>
            <div class="stack size-[300px]">
              <div ref={setContainerRef} class="peer" />
              <div class="bg-tertiary/12 hidden size-full animate-pulse place-content-center rounded-2xl peer-empty:grid">
                <Spinner size="sm" variant="tertiary" />
              </div>
            </div>
            <Suspense fallback={<div class="h-5" />}>
              <Text with="body-sm" tone="light">
                {t('family-invite.expires-in', {
                  expiresIn: inviteData()?.expiresIn || '',
                })}
              </Text>
            </Suspense>
          </Match>
        </Switch>
      </div>
      <Button variant="ghost" onClick={share}>
        {t('family-invite.cta-share')}
      </Button>
      <Button onClick={props.onNext}>{t('family-invite.cta-ready')}</Button>
    </div>
  );
};

async function createQRCode(data: string, containerRef: HTMLDivElement) {
  const QRCodeStyling = await import('styled-qr-code').then(
    (bundle) => bundle.default,
  );
  const qrImage = new QRCodeStyling({
    data,
    width: 300,
    height: 300,
    type: 'svg',
    image: `/icons/icon.svg`,
    dotsOptions: {
      color: 'var(--nou-on-surface)',
      type: 'rounded',
    },
    cornersSquareOptions: {
      color: 'var(--nou-on-surface)',
      type: 'extra-rounded',
    },
    backgroundOptions: {
      color: '#ffffff00',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 0,
    },
  });
  qrImage.append(containerRef);
  return qrImage;
}
