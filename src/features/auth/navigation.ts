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
    state.returnTo.startsWith('/s/')
  ) {
    return state.returnTo
  }

  return '/dashboard'
}
