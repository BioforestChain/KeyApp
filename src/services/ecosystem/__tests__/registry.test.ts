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


  it('marks source as error when refresh falls back to cache after fetch failure', async () => {
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

    const fetchMock = vi
      .fn<
        [RequestInfo | URL],
        Promise<{
          ok: boolean;
          status: number;
          headers: Map<string, string>;
          json: () => Promise<unknown>;
        }>
      >()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['ETag', '"v1"']]),
        json: () => Promise.resolve({ name: 'x', version: '1', updated: '2025-01-01', apps: mockApps }),
      })
      .mockRejectedValueOnce(new Error('network down'))

    global.fetch = fetchMock as unknown as typeof fetch

    await refreshSources({ force: true })

    expect(ecosystemStore.state.sources[0]?.status).toBe('success')

    const apps = await refreshSources({ force: true })

    expect(apps).toHaveLength(1)
    expect(getApps()).toHaveLength(1)
    expect(ecosystemStore.state.sources[0]?.status).toBe('error')
    expect(ecosystemStore.state.sources[0]?.errorMessage).toBe('network down')
  })

  it('prefers the later source when duplicate app id exists', async () => {
    ecosystemStore.setState(() => ({
      permissions: [],
      sources: [
        {
          url: '/ecosystem-primary.json',
          name: 'Primary',
          enabled: true,
          lastUpdated: new Date().toISOString(),
        },
        {
          url: '/ecosystem-override.json',
          name: 'Override',
          enabled: true,
          lastUpdated: new Date().toISOString(),
        },
      ],
    }))

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

      if (requestUrl.includes('/ecosystem-primary.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Map(),
          json: () =>
            Promise.resolve({
              name: 'primary',
              version: '1',
              updated: '2025-01-01',
              apps: [
                {
                  id: 'xin.dweb.rwahub',
                  name: 'RWA Hub',
                  url: 'https://legacy.example/',
                  icon: '/legacy-icon.svg',
                  description: 'legacy runtime',
                  version: '1.0.0',
                  runtime: 'wujie',
                },
              ],
            }),
        })
      }

      if (requestUrl.includes('/ecosystem-override.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Map(),
          json: () =>
            Promise.resolve({
              name: 'override',
              version: '1',
              updated: '2025-01-01',
              apps: [
                {
                  id: 'xin.dweb.rwahub',
                  name: 'RWA Hub',
                  url: 'https://latest.example/',
                  icon: '/latest-icon.svg',
                  description: 'iframe runtime',
                  version: '1.0.0',
                  runtime: 'iframe',
                },
              ],
            }),
        })
      }

      return Promise.resolve({
        ok: false,
        status: 404,
        headers: new Map(),
        json: () => Promise.resolve({}),
      })
    }) as unknown as typeof fetch

    await refreshSources()

    const app = getAppById('xin.dweb.rwahub')
    expect(app?.runtime).toBe('iframe')
    expect(app?.url).toBe('https://latest.example/')
    expect(app?.sourceUrl).toBe('/ecosystem-override.json')
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
    ecosystemStore.setState(() => ({
      permissions: [],
      sources: [
        {
          url: '/ecosystem-featured.json',
          name: 'Featured',
          enabled: true,
          lastUpdated: new Date().toISOString(),
        },
      ],
    }))

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      if (!requestUrl.includes('/ecosystem-featured.json')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          headers: new Map(),
          json: () => Promise.resolve({}),
        })
      }

      return Promise.resolve({
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
    }) as unknown as typeof fetch

    await refreshSources()
    const featured = await getFeaturedApps(1, new Date('2025-01-05T00:00:00.000Z'))
    expect(featured).toHaveLength(1)
    expect(featured[0]?.id).toBe('xin.dweb.b')
  })
})
