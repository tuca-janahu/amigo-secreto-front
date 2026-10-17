import { describe, expect, it } from 'vitest'
import { getAuthReturnTo } from './navigation'

describe('getAuthReturnTo', () => {
  it('keeps a participant invitation as the post-authentication destination', () => {
    expect(getAuthReturnTo({ returnTo: '/s/invitation-token' })).toBe('/s/invitation-token')
  })

  it.each([undefined, null, {}, { returnTo: '/dashboard/groups/1' }, { returnTo: '//example.com' }])(
    'falls back to the dashboard for an unsupported state',
    (state) => {
      expect(getAuthReturnTo(state)).toBe('/dashboard')
    },
  )
})
