import { Title } from '@solidjs/meta';
import { createAsync, type RouteSectionProps } from '@solidjs/router';
import { Button, Text } from '@nou/ui';

import { checkFamilyInvite } from '~/server/api/family-invite.server';
import { createTranslator } from '~/server/i18n';

const InviteAcceptPage = (props: RouteSectionProps) => {
  const code = props.params['invite-code'];
  const t = createTranslator('app');
  const invite = createAsync(() => checkFamilyInvite(code), {
    deferStream: false,
  });
  const headlineId = `invite-${code}`;

  return (
    <>
      <Title>TODO: Add title</Title>
      <section class="bg-on-surface/5 fixed inset-0 grid place-content-center backdrop-blur-md">
        <div
          class="bg-surface text-on-surface flex w-[94svw] max-w-[420px] flex-col gap-6 rounded-3xl p-6"
          role="dialog"
          aria-describedby={headlineId}
        >
          <Text with="headline-2" as="h2" id={headlineId}>
            {t('accept-invite.heading', {
              inviterName: invite()?.inviterName || '',
            })}
          </Text>
          <Text as="p">
            {t('accept-invite.description', {
              inviterName: invite()?.inviterName || '',
            })}
          </Text>
          <div class="flex w-full flex-row justify-stretch gap-4">
            <Button variant="ghost" name="cancel" class="flex-[2]">
              {t('accept-invite.cta-cancel')}
            </Button>
            <Button name="join" class="flex-[3]">
              {t('accept-invite.cta-join')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default InviteAcceptPage;
