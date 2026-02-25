import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTokenInfoMap, getTokenInfoKey, type TokenInfoTarget } from './useTokenInfoMap'
import type { ContractTokenInfo } from '@/api/types'

vi.mock('@/api', () => ({
  rechargeApi: {
    getTokenInfo: vi.fn(),
  },
}))

import { rechargeApi } from '@/api'

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useTokenInfoMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not duplicate token info requests when rerendering with same targets', async () => {
    const deferred = createDeferred<ContractTokenInfo>()

    vi.mocked(rechargeApi.getTokenInfo).mockImplementation(() => deferred.promise)

    const initialTargets: TokenInfoTarget[] = [{ chain: 'BSC', address: '0xabc' }]
    const { result, rerender } = renderHook(
      ({ targets }: { targets: TokenInfoTarget[] }) => useTokenInfoMap(targets),
      { initialProps: { targets: initialTargets } },
    )

    const requestKey = getTokenInfoKey('BSC', '0xabc')
    expect(result.current.loadingMap[requestKey]).toBe(true)
    expect(rechargeApi.getTokenInfo).toHaveBeenCalledTimes(1)

    rerender({ targets: [{ chain: 'BSC', address: '0xAbC' }] })
    expect(rechargeApi.getTokenInfo).toHaveBeenCalledTimes(1)

    deferred.resolve({
      chain: 'BSC',
      address: '0xabc',
      decimals: 18,
      symbol: 'USDT',
    })

    await waitFor(() => {
      expect(result.current.tokenInfoMap[requestKey]?.decimals).toBe(18)
      expect(result.current.loadingMap[requestKey]).toBeUndefined()
    })
  })
})
