import { expect, vi } from 'vitest'
import type { PlaocAdapter } from '../dweb'

type CapturedResponse = Readonly<{
  bodyText: string
  init: ResponseInit | undefined
}>

export function makeFetchEvent({
  url,
  body,
  manifest,
  headers,
  method,
}: {
  url: string
  body?: string
  headers?: Readonly<Record<string, string>>
  method?: string
  manifest?: Readonly<{
    mmid: `${string}.dweb` | string
    name: string
    icons?: Array<{ src: string }>
    homepage_url?: string
  }>
}) {
  let init: RequestInit | undefined
  if (body !== undefined || headers !== undefined || method !== undefined) {
    const i: RequestInit = { method: method ?? 'POST' }
    if (body !== undefined) i.body = body
    if (headers !== undefined) i.headers = headers
    init = i
  }

  const request = new Request(url, init)
  const captured: CapturedResponse[] = []

  const event = {
    request,
    async respondWith(bodyInit?: BodyInit | null, init?: ResponseInit) {
      const bodyText = await new Response(bodyInit ?? null).text()
      captured.push({ bodyText, init })
    },
    async getRemoteManifest() {
      return (
        manifest ?? {
          mmid: 'example.dweb',
          name: 'Example DApp',
          icons: [{ src: '/icon.png' }],
          homepage_url: 'https://example.invalid',
        }
      )
    },
  }

  return {
    event,
    getLastResponse: () => captured[captured.length - 1],
    getAllResponses: () => captured,
  }
}

export function parseHashParams(hash: string): URLSearchParams {
  const idx = hash.indexOf('?')
  if (idx === -1) return new URLSearchParams()
  return new URLSearchParams(hash.slice(idx + 1))
}

export function assertNonNull<T>(
  value: T | null | undefined,
  message = 'Expected value to be defined'
): asserts value is T {
  if (value === null || value === undefined) throw new Error(message)
}

export async function flushAsync(): Promise<void> {
  await new Promise((r) => setTimeout(r, 0))
}

export function expectJsonEnvelope(bodyText: string, expectedData: unknown): void {
  expect(JSON.parse(bodyText)).toEqual({ data: expectedData })
}

export function getContentType(init: ResponseInit | undefined): string | null {
  const headers = new Headers(init?.headers)
  return headers.get('Content-Type')
}

export async function setupDwebAdapter(): Promise<{
  adapter: PlaocAdapter
  addEventListener: ReturnType<typeof vi.fn>
  getFetchListener: () => ((event: unknown) => void) | null
}> {
  vi.resetModules()
  window.location.hash = ''

  let fetchListener: ((event: unknown) => void) | null = null
  const addEventListener = vi.fn((type: string, listener: (event: unknown) => void) => {
    if (type === 'fetch') fetchListener = listener
  })

  vi.doMock('@plaoc/plugins', () => ({
    dwebServiceWorker: { addEventListener },
  }))

  const mod = await import('../dweb')
  const adapter = new mod.PlaocAdapter()

  return {
    adapter,
    addEventListener,
    getFetchListener: () => fetchListener,
  }
}
