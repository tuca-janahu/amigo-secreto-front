import { http } from '../lib/http'

export type Credentials = {
  email: string
  password: string
}

export type Registration = Credentials & {
  name: string
}

export type AuthenticatedUser = {
  id: string
  name: string
  email: string
}

type AuthResponse = { user: AuthenticatedUser }

export const authService = {
  register: (credentials: Registration) =>
    http<AuthResponse>('/auth/register', {
      method: 'POST',
      body: credentials,
    }),
  login: (credentials: Credentials) =>
    http<AuthResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
    }),
  me: async () => (await http<AuthResponse>('/auth/me')).user,
  logout: () =>
    http<void>('/auth/logout', {
      method: 'POST',
    }),
}
