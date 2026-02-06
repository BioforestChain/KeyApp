import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkDwebUpdate, resolveDwebMetadataUrl, resolveInstallUrl } from '../dweb-update'

type FetchResponse = {
  ok: boolean
  status: number
  json: () => Promise<unknown>
}

function stubGlobals() {
  vi.stubGlobal('__KEYAPP_SITE_ORIGIN__', 'https://example.com/KeyApp/')
  vi.stubGlobal('__KEYAPP_BASE_URL__', './')
  vi.stubGlobal('__DEV_MODE__', false)
  vi.stubGlobal('__APP_VERSION__', '1.2.3')
  Object.defineProperty(window, '__native_close_watcher_kit__', {
    value: {},
    configurable: true,
  })
}

describe('dweb update', () => {
  beforeEach(() => {
    stubGlobals()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('resolves stable metadata url', () => {
    const url = resolveDwebMetadataUrl()
    expect(url).toBe('https://example.com/KeyApp/dweb/metadata.json')
  })

  it('resolves dev metadata url', () => {
    vi.stubGlobal('__DEV_MODE__', true)
    const url = resolveDwebMetadataUrl()
    expect(url).toBe('https://example.com/KeyApp/dweb-dev/metadata.json')
  })

  it('resolves metadata url with base url when origin has no path', () => {
    vi.stubGlobal('__KEYAPP_SITE_ORIGIN__', 'https://example.com')
    vi.stubGlobal('__KEYAPP_BASE_URL__', '/KeyApp/')
    const url = resolveDwebMetadataUrl()
    expect(url).toBe('https://example.com/KeyApp/dweb/metadata.json')
  })

  it('resolves metadata url with CD environment variables', () => {
    vi.stubGlobal('__KEYAPP_SITE_ORIGIN__', 'https://bioforestchain.github.io')
    vi.stubGlobal('__KEYAPP_BASE_URL__', '/KeyApp/')
    const url = resolveDwebMetadataUrl()
    expect(url).toBe('https://bioforestchain.github.io/KeyApp/dweb/metadata.json')
  })

  it('builds install url', () => {
    const url = resolveInstallUrl('https://example.com/KeyApp/dweb/metadata.json')
    expect(url).toBe('dweb://install?url=https%3A%2F%2Fexample.com%2FKeyApp%2Fdweb%2Fmetadata.json')
  })

  it('returns update available when remote version is higher', async () => {
    const response: FetchResponse = {
      ok: true,
      status: 200,
      json: async () => ({ version: '1.2.4', change_log: 'fix' }),
    }
    const fetchSpy = vi.fn(async () => response)
    vi.stubGlobal('fetch', fetchSpy)

    const result = await checkDwebUpdate()
    expect(result.status).toBe('update-available')
    expect(result.latestVersion).toBe('1.2.4')
  })

  it('checks update with correct metadata url under CD env', async () => {
    vi.stubGlobal('__KEYAPP_SITE_ORIGIN__', 'https://bioforestchain.github.io')
    vi.stubGlobal('__KEYAPP_BASE_URL__', '/KeyApp/')

    const response: FetchResponse = {
      ok: true,
      status: 200,
      json: async () => ({ version: '1.2.4' }),
    }
    const fetchSpy = vi.fn(async () => response)
    vi.stubGlobal('fetch', fetchSpy)

    const result = await checkDwebUpdate()

    expect(fetchSpy).toHaveBeenCalledWith('https://bioforestchain.github.io/KeyApp/dweb/metadata.json', {
      cache: 'no-store',
    })
    expect(result.status).toBe('update-available')
    expect(result.metadataUrl).toBe('https://bioforestchain.github.io/KeyApp/dweb/metadata.json')
  })
})
