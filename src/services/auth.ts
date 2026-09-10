import { http } from '../lib/http'

export type Credentials = {
  email: string
  password: string
}

export type AuthenticatedUser = {
  id: string | number
  name?: string
  email: string
}

export const authService = {
  register: (credentials: Credentials) =>
    http<void>('/auth/register', {
      method: 'POST',
      body: credentials,
    }),
  login: (credentials: Credentials) =>
    http<void>('/auth/login', {
      method: 'POST',
      body: credentials,
    }),
  me: () => http<AuthenticatedUser>('/auth/me'),
  logout: () =>
    http<void>('/auth/logout', {
      method: 'POST',
    }),
}
