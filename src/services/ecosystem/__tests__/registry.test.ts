import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ecosystemStore } from '@/stores/ecosystem'
import { resetEcosystemStorageForTests } from '../storage'
import {
  getSources,
  refreshSources,
  getApps,
  getAppById,
  searchCachedApps,
  getFeaturedApps,
} from '../registry'

describe('Miniapp Registry (Subscription v2)', () => {
  beforeEach(async () => {
    localStorage.clear()
    await resetEcosystemStorageForTests()

    ecosystemStore.setState(() => ({
      permissions: [],
      sources: [
        {
          url: '/ecosystem.json',
          name: 'Bio 官方生态',
          enabled: true,
          lastUpdated: new Date().toISOString(),
        },
      ],
    }))
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('reads sources from ecosystemStore', () => {
    const sources = getSources()
    expect(sources).toHaveLength(1)
    expect(sources[0]?.url).toBe('/ecosystem.json')
  })

  it('fetches and caches apps from enabled sources', async () => {
    const mockApps = [
      {
        id: 'xin.dweb.teleport',
        name: 'Teleport',
        url: '/miniapps/teleport/',
        icon: '/miniapps/teleport/icon.svg',
        description: 'Test',
        version: '1.0.0',
      },
    ]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['ETag', '"v1"']]),
      json: () => Promise.resolve({ name: 'x', version: '1', updated: '2025-01-01', apps: mockApps }),
    })

    const apps = await refreshSources()

    expect(apps).toHaveLength(1)
    expect(getApps()).toHaveLength(1)
    expect(getAppById('xin.dweb.teleport')?.name).toBe('Teleport')
  })

  it('searches cached apps by keyword', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () =>
        Promise.resolve({
          name: 'x',
          version: '1',
          updated: '2025-01-01',
          apps: [
            { id: 'xin.dweb.teleport', name: 'Teleport', url: '/', icon: '', description: 'hello', version: '1.0.0' },
          ],
        }),
    })

    await refreshSources()
    const results = await searchCachedApps('tele')
    expect(results.map((r) => r.id)).toEqual(['xin.dweb.teleport'])
  })

  it('ranks featured apps by featuredScore', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () =>
        Promise.resolve({
          name: 'x',
          version: '1',
          updated: '2025-01-01',
          apps: [
            {
              id: 'xin.dweb.a',
              name: 'A',
              url: '/',
              icon: '',
              description: '',
              version: '1.0.0',
              officialScore: 100,
              communityScore: 0,
            },
            {
              id: 'xin.dweb.b',
              name: 'B',
              url: '/',
              icon: '',
              description: '',
              version: '1.0.0',
              officialScore: 0,
              communityScore: 100,
            },
          ],
        }),
    })

    await refreshSources()
    const featured = await getFeaturedApps(1, new Date('2025-01-05T00:00:00.000Z'))
    expect(featured).toHaveLength(1)
    expect(featured[0]?.id).toBe('xin.dweb.b')
  })
})
