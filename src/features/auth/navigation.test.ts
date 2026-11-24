import { describe, expect, it } from 'vitest'
import { getAuthReturnTo } from './navigation'

describe('getAuthReturnTo', () => {
  it('keeps a participant invitation as the post-authentication destination', () => {
    expect(getAuthReturnTo({ returnTo: '/s/invitation-token' })).toBe('/s/invitation-token')
  })

  it('preserves the entry invitation through login and registration', () => {
    const returnTo = '/invite/abc_DEF-123'
    expect(getAuthReturnTo({ returnTo: getAuthReturnTo({ returnTo }) })).toBe(returnTo)
  })

  it.each(['/invite/', '/invite/../dashboard', '/invite/%2f%2fevil.test', '/invite/token?next=https://evil.test', '/invite/token#fragment', '/invite/abc\\evil', 'https://evil.test/invite/token'])('rejects unsafe or unsupported destinations: %s', (returnTo) => {
    expect(getAuthReturnTo({ returnTo })).toBe('/dashboard')
  })

  it.each([undefined, null, {}, { returnTo: '/dashboard/groups/1' }, { returnTo: '//example.com' }])(
    'falls back to the dashboard for an unsupported state',
    (state) => {
      expect(getAuthReturnTo(state)).toBe('/dashboard')
    },
  )
})
