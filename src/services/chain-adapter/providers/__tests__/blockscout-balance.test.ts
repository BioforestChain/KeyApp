/**
 * Blockscout/Etherscan Provider Balance Support Test
 * 
 * 验证 blockscout-v1 等 scan 类 provider 是否支持余额查询
 */

import { describe, it, expect } from 'vitest'
import { createChainProvider } from '../index'
import { isSupported } from '../types'
import { chainConfigStore } from '@/stores/chain-config'
import type { ChainConfig } from '@/services/chain-config'

const BLOCKSCOUT_TEST_CONFIG: ChainConfig = {
  id: 'ethereum-blockscout-test',
  version: '1.0',
  chainKind: 'evm',
  name: 'Ethereum (blockscout test)',
  symbol: 'ETH',
  icon: '',
  decimals: 18,
  enabled: true,
  source: 'manual',
  apis: [{ type: 'blockscout-v1', endpoint: 'https://eth.blockscout.com/api' }],
}

describe('Blockscout/Etherscan Provider Balance Support', () => {
  it('blockscout-v1 should support getNativeBalance or getTokenBalances', () => {
    // 注入测试配置
    chainConfigStore.setState((prev) => ({
      ...prev,
      snapshot: {
        ...prev.snapshot!,
        configs: [BLOCKSCOUT_TEST_CONFIG],
      },
    }))

    const provider = createChainProvider('ethereum-blockscout-test')
    
    // 至少要支持其中之一
    const hasBalanceSupport = provider.supportsNativeBalance || provider.supportsTokenBalances
    
    expect(hasBalanceSupport).toBe(true)
  })

  it('blockscout-v1 should return balance data (with working getNativeBalance call)', async () => {
    chainConfigStore.setState((prev) => ({
      ...prev,
      snapshot: {
        ...prev.snapshot!,
        configs: [BLOCKSCOUT_TEST_CONFIG],
      },
    }))

    const provider = createChainProvider('ethereum-blockscout-test')
    // Test address
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

    // 查询余额
    const balanceResult = await provider.getNativeBalance(address)
    
    // 应该返回 supported 结果（即使网络请求在测试环境下可能失败）
    expect(balanceResult).toBeDefined()
    expect(balanceResult.data).toBeDefined()
    expect(balanceResult.data.symbol).toBe('ETH')
    expect(balanceResult.data.amount).toBeDefined()
    expect(balanceResult.data.amount.decimals).toBe(18)
    
    // 余额应该 >= 0
    const value = balanceResult.data.amount.toNumber()
    expect(typeof value).toBe('number')
    expect(value).toBeGreaterThanOrEqual(0)

    // 查询 token 列表
    const tokensResult = await provider.getTokenBalances(address)
    expect(tokensResult).toBeDefined()
    expect(Array.isArray(tokensResult.data)).toBe(true)
  }, 30_000)
})
