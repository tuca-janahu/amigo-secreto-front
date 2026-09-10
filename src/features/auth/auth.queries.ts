import { queryOptions, useQuery } from '@tanstack/react-query'
import { authService } from '../../services/auth'

export const authQueryKey = ['auth', 'me'] as const

export const authQueryOptions = queryOptions({
  queryKey: authQueryKey,
  queryFn: () => authService.me(),
  retry: false,
  staleTime: 5 * 60 * 1000,
})

export function useAuth() {
  return useQuery(authQueryOptions)
}
