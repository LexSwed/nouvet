import { createAsync, type RouteSectionProps } from '@solidjs/router';

import { checkFamilyInvite } from '~/server/api/family-invite.server';

const InviteAcceptPage = (props: RouteSectionProps) => {
  const code = props.params['invite-code'];
  const invite = createAsync(() => checkFamilyInvite(code), {
    deferStream: false,
  });

  return <div>{invite()?.inviterName}</div>;
};

export default InviteAcceptPage;
