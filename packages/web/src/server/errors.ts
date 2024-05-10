export class IncorrectFamilyInvite extends Error {}

export class UserAlreadyInFamily extends Error {}

export class InviteeNotInWaitList extends Error {}

export class NotAllowedToPerformFamilyAction extends Error {}

export class IncorrectFamilyId extends Error {}

/**
 * Allows matching Server errors on the client after serialization.
 * Only supports { error: Error } shape.
 */
export function isErrorResponse<
  T extends
    | typeof IncorrectFamilyInvite
    | typeof UserAlreadyInFamily
    | typeof InviteeNotInWaitList
    | typeof NotAllowedToPerformFamilyAction
    | typeof IncorrectFamilyId
    | typeof Error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(
  response: undefined | { error: unknown } | unknown,
  matchingError: T,
): boolean {
  if (typeof response !== 'object' || response === null) return false;

  return (
    'error' in response &&
    response.error instanceof Error &&
    // passing generic Error should match any errors
    (matchingError.name === 'Error' ||
      response.error.name === matchingError.name)
  );
}
