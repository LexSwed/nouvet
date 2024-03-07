import { createAsync, type RouteSectionProps } from '@solidjs/router';

import { parseFamilyInvite } from '~/server/api/family-invite';

const InviteAcceptPage = (props: RouteSectionProps) => {
  const code = props.params['invite-code'];
  const parsedCode = createAsync(() => parseFamilyInvite(code), {
    deferStream: false,
  });

  return <div>{parsedCode()}</div>;
};

export default InviteAcceptPage;
