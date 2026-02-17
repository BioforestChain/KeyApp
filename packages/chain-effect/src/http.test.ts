import { afterEach, describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { httpFetch } from './http'

describe('httpFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serializes bigint body values before POST', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    await Effect.runPromise(
      httpFetch({
        url: 'https://example.test/api',
        method: 'POST',
        body: { amount: 1000000000n },
      }),
    )

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const requestInit = fetchSpy.mock.calls[0]?.[1]
    expect(requestInit?.body).toBe('{"amount":"1000000000"}')
  })
})
