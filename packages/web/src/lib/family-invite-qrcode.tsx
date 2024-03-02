import { createAsync } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import { Button } from '@nou/ui';

import { createTranslator } from '~/server/i18n';
import { createFamilyInvite } from '~/api/family-invite';

export const FamilyInviteQRCode = () => {
  const t = createTranslator('app');
  const inviteData = createAsync(async () => {
    const { url, image } = await createFamilyInvite();
    return {
      url,
      image: image ? URL.createObjectURL(await image.blob()) : null,
    };
  });
  const [error, setError] = createSignal(false);
  return (
    <div class="flex flex-col gap-6">
      <div class="size-[300px] self-center">
        <Show
          when={inviteData()}
          children={
            <img
              src={inviteData()!.image}
              onError={() => setError(true)}
              alt=""
            />
          }
          fallback={
            <div class="bg-tertiary/5 size-[300px] animate-pulse rounded-2xl" />
          }
        />
      </div>
      <Button variant="ghost">{t('family-invite.cta-share')}</Button>
    </div>
  );
};
