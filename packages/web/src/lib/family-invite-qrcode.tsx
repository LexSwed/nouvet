import { createAsync } from '@solidjs/router';
import { createEffect, createSignal, type Accessor } from 'solid-js';
import { Button, Text } from '@nou/ui';
import QRCodeStyling from 'styled-qr-code';

import { getFamilyInvite } from '~/server/api/family-invite';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

import { createFormattedDate } from './utils/format-date';

export const FamilyInviteQRCode = () => {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamily());
  const inviteData = createAsync(() => getFamilyInvite());
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(
    null,
  );

  createQRCode(() => inviteData()?.url, containerRef);
  const expiresAt = createFormattedDate(() =>
    inviteData()?.expirationUnix
      ? new Date(inviteData()!.expirationUnix)
      : undefined,
  );

  async function share() {
    const shareData = {
      url: inviteData()?.url,
      title: user()?.name
        ? t('family-invite.invite-share-title-user', {
            userName: user()!.name!,
          })
        : t('family-invite.invite-share-title-no-name'),
      text: t('family-invite.invite-share-text'),
    } satisfies ShareData;
    await navigator.share(shareData);
  }

  return (
    <div class="flex flex-col gap-6">
      <div class="flex w-full flex-col items-center justify-center gap-2">
        <div class="stack size-[300px]">
          <div ref={setContainerRef} class="peer" />
          <div class="bg-tertiary/12 hidden size-full animate-pulse rounded-2xl peer-empty:block" />
        </div>
        <Text with="body-sm" tone="light">
          {t('family-invite.expires-in', { expiresAt: expiresAt() || '' })}
        </Text>
      </div>
      <Button variant="ghost" onClick={share}>
        {t('family-invite.cta-share')}
      </Button>
    </div>
  );
};

function createQRCode(
  data: Accessor<string | undefined>,
  containerRef: Accessor<HTMLDivElement | null>,
) {
  let qrImage: QRCodeStyling | null;
  createEffect(() => {
    if (data() && containerRef()) {
      qrImage = new QRCodeStyling({
        width: 300,
        height: 300,
        type: 'svg',
        data: data(),
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
      qrImage.append(containerRef()!);
    }
  });

  return {
    get qrImage() {
      return qrImage;
    },
  };
}
