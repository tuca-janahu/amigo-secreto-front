import { describe, expect, it } from 'vitest'
import { adminFiltersSchema, defaultFilters } from './admin.schemas'

describe('admin filters', () => {
  it('uses the São Paulo date across the UTC day boundary', () => {
    expect(defaultFilters(new Date('2026-11-20T01:00:00Z'))).toMatchObject({ from: '2026-10-21', to: '2026-11-19' })
  })
  it('accepts an inclusive 90-day period but rejects 91 days and reversed dates', () => {
    const filters = defaultFilters()
    expect(adminFiltersSchema.safeParse({ ...filters, from: '2026-01-01', to: '2026-03-31' }).success).toBe(true)
    expect(adminFiltersSchema.safeParse({ ...filters, from: '2026-01-01', to: '2026-04-01' }).success).toBe(false)
    expect(adminFiltersSchema.safeParse({ ...filters, from: '2026-04-01', to: '2026-03-31' }).success).toBe(false)
  })
  it('rejects invalid dates and unsupported event types', () => {
    expect(adminFiltersSchema.safeParse({ ...defaultFilters(), to: '2026-02-30' }).success).toBe(false)
    expect(adminFiltersSchema.safeParse({ ...defaultFilters(), type: 'LOGIN' }).success).toBe(false)
  })
})
