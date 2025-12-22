import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Mock @number-flow/react for tests (doesn't work in JSDOM)
vi.mock('@number-flow/react', () => ({
  default: ({ value, format }: { value: number; format?: Intl.NumberFormatOptions }) => {
    const formatted = value.toLocaleString('en-US', format)
    return formatted
  },
}))

// Mock ResizeObserver for tests
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock

const dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultChainsJsonText = readFileSync(
  path.resolve(dirname, '../../public/configs/default-chains.json'),
  'utf8'
)
const realFetch: typeof fetch | undefined = typeof fetch === 'undefined' ? undefined : fetch.bind(globalThis)

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  if (url.includes('/configs/default-chains.json')) {
    return new Response(defaultChainsJsonText, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!realFetch) {
    throw new Error('fetch is not available in this environment')
  }

  return realFetch(input, init)
}) satisfies typeof fetch

afterEach(() => {
  cleanup()
})
