import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminService } from './admin'
import { defaultFilters } from '../features/admin/admin.schemas'

describe('admin service', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('sends only event filters, with cookie credentials and no HTTP cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ items: [], total: 0, page: 2, pageSize: 20 }))
    vi.stubGlobal('fetch', fetchMock)
    await adminService.events({ ...defaultFilters(), actorUserId: 'user&1', q: 'not an event filter' }, 2)
    const [url, options] = fetchMock.mock.calls[0]
    const params = new URL(url).searchParams
    expect(params.get('actorUserId')).toBe('user&1')
    expect(params.get('page')).toBe('2')
    expect(params.has('q')).toBe(false)
    expect(params.has('type')).toBe(false)
    expect(options).toMatchObject({ credentials: 'include', cache: 'no-store' })
  })
  it('preserves authorization failures rather than presenting empty data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ message: 'Acesso restrito.' }, { status: 403 })))
    await expect(adminService.users(defaultFilters(), 1)).rejects.toMatchObject({ status: 403 })
  })
})
