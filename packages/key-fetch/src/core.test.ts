/**
 * Key-Fetch Core Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { keyFetch, interval, deps, ttl, dedupe } from './index'

describe('keyFetch', () => {
  beforeEach(() => {
    keyFetch.clear()
    vi.restoreAllMocks()
  })

  describe('define', () => {
    it('should define a cache rule', () => {
      expect(() => {
        keyFetch.define({
          name: 'test.api',
          pattern: /\/api\/test/,
          use: [ttl(1000)],
        })
      }).not.toThrow()
    })
  })

  describe('fetch', () => {
    it('should fetch data from URL', async () => {
      const mockData = { success: true, result: { height: 123 } }
      
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await keyFetch<typeof mockData>('https://api.example.com/test')
      
      expect(result).toEqual(mockData)
    })

    it('should throw on HTTP error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(keyFetch('https://api.example.com/test')).rejects.toThrow('HTTP 500')
    })
  })

  describe('ttl plugin', () => {
    it('should cache response for TTL duration', async () => {
      keyFetch.define({
        name: 'test.cached',
        pattern: /\/cached/,
        use: [ttl(10000)],
      })

      const mockData = { value: 'cached' }
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as Response)

      // First fetch
      const result1 = await keyFetch('https://api.example.com/cached')
      expect(result1).toEqual(mockData)
      expect(fetchSpy).toHaveBeenCalledTimes(1)

      // Second fetch should use cache
      const result2 = await keyFetch('https://api.example.com/cached')
      expect(result2).toEqual(mockData)
      expect(fetchSpy).toHaveBeenCalledTimes(1) // Still 1, used cache
    })
  })

  describe('invalidate', () => {
    it('should invalidate cache by rule name', async () => {
      keyFetch.define({
        name: 'test.invalidate',
        pattern: /\/invalidate/,
        use: [ttl(10000)],
      })

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ value: 'data' }),
      } as Response)

      await keyFetch('https://api.example.com/invalidate')
      expect(fetchSpy).toHaveBeenCalledTimes(1)

      // Invalidate
      keyFetch.invalidate('test.invalidate')

      // Should fetch again
      await keyFetch('https://api.example.com/invalidate')
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })
  })
})
