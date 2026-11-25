export type AuthNavigationState = {
  passwordReset?: boolean
  returnTo?: string
}

export function getAuthReturnTo(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'returnTo' in state &&
    typeof state.returnTo === 'string' &&
    /^\/(?:s|invite)\/[A-Za-z0-9_-]+$/.test(state.returnTo)
  ) {
    return state.returnTo
  }

  return '/dashboard'
}
