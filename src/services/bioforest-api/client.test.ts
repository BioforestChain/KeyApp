import { describe, expect, it } from 'vitest'

import { BioForestApiClient, BioForestApiError } from './client'

describe('BioForestApiClient.getBalance', () => {
  it('uses the provided magic from genesisBlock after trim', async () => {
    const requests: Array<{ url: string; init: RequestInit | undefined }> = []
    const fetchFn: typeof fetch = async (input, init) => {
      requests.push({ url: String(input), init })
      return new Response(
        JSON.stringify({
          success: true,
          result: { amount: '100' },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const client = new BioForestApiClient({
      rpcUrl: 'https://walletapi.bfmeta.info',
      chainId: 'bfm',
      fetch: fetchFn,
    })

    await client.getBalance('b-test', 'BFM', '  LLLQL  ')
    const request = requests[0]
    expect(request?.url).toBe('https://walletapi.bfmeta.info/wallet/bfm/address/balance')
    expect(request?.init?.method).toBe('POST')
    expect(request?.init?.body).toBe(
      JSON.stringify({
        address: 'b-test',
        magic: 'LLLQL',
        assetType: 'BFM',
      }),
    )
  })

  it('throws when magic is empty', async () => {
    let called = false
    const fetchFn: typeof fetch = async () => {
      called = true
      return new Response(JSON.stringify({ success: true, result: { amount: '0' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const client = new BioForestApiClient({
      rpcUrl: 'https://walletapi.bfmeta.info',
      chainId: 'bfm',
      fetch: fetchFn,
    })

    await expect(client.getBalance('b-test', 'BFM', '   ')).rejects.toBeInstanceOf(BioForestApiError)
    expect(called).toBe(false)
  })
})
