import { ApiError } from './http'

export function getErrorMessage(
  error: unknown,
  fallback: string,
  statusMessages: Partial<Record<number, string>> = {},
) {
  if (error instanceof ApiError) {
    return statusMessages[error.status] ?? fallback
  }

  return fallback
}
