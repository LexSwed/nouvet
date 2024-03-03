import { createAsync } from '@solidjs/router';
import { createEffect } from 'solid-js';
import { Button } from '@nou/ui';
import QRCodeStyling from 'styled-qr-code';

import { createTranslator } from '~/server/i18n';
import { getFamilyInvite } from '~/api/family-invite';
import { getUserFamily } from '~/api/user';

export const FamilyInviteQRCode = () => {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamily());
  const inviteData = createAsync(() => getFamilyInvite());
  let containerRef: HTMLDivElement | null = null;

  createQRCode(() => inviteData()?.url, containerRef);

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
      <div class="stack size-[300px] self-center">
        <div ref={(el) => (containerRef = el)} class="peer" />
        <div class="bg-tertiary/12 hidden size-full animate-pulse rounded-2xl peer-empty:block" />
      </div>
      <Button variant="ghost" onClick={share}>
        {t('family-invite.cta-share')}
      </Button>
    </div>
  );
};

function createQRCode(
  data: () => string | undefined,
  containerRef: HTMLDivElement | null,
) {
  let qrImage: QRCodeStyling | null;
  createEffect(() => {
    if (data() && containerRef) {
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
      qrImage.append(containerRef);
    }
  });

  return {
    get qrImage() {
      return qrImage;
    },
  };
}
