import { Page } from '@playwright/test'

const RPC_URL = 'https://walletapi.bfmeta.info'
const TEST_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx'

interface MockConfig {
  balance?: string
  hasSecondPublicKey?: boolean
  blockHeight?: number
  transactions?: Array<{
    height: number
    type: string
    amount: string
    senderId: string
    recipientId: string
    fee: string
    timestamp: number
    signature: string
  }>
  onBroadcast?: (tx: unknown) => void
}

const DEFAULT_CONFIG: MockConfig = {
  balance: '100000000000', // 1000 BFM
  hasSecondPublicKey: true,
  blockHeight: 1275000,
  transactions: [
    {
      height: 1274900,
      type: 'BFM-AST-02',
      amount: '10000000',
      senderId: TEST_ADDRESS,
      recipientId: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
      fee: '222',
      timestamp: 21951000,
      signature: 'mock-tx-signature-001',
    },
    {
      height: 1274800,
      type: 'BFM-AST-02',
      amount: '5000000',
      senderId: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
      recipientId: TEST_ADDRESS,
      fee: '222',
      timestamp: 21950000,
      signature: 'mock-tx-signature-002',
    },
  ],
}

/**
 * 设置 BioForest API Mock
 * 拦截所有 BioForest API 请求并返回模拟数据
 */
export async function setupBioforestMock(page: Page, config: MockConfig = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  // Mock: 获取最新区块高度
  await page.route(`${RPC_URL}/wallet/*/lastblock`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: {
          height: cfg.blockHeight,
          timestamp: Date.now(),
        },
      }),
    })
  })

  // Mock: 查询账户余额
  await page.route(`${RPC_URL}/wallet/*/address/balance`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: {
          amount: cfg.balance,
        },
      }),
    })
  })

  // Mock: 查询账户资产 (asset service 使用)
  await page.route(`${RPC_URL}/wallet/*/address/asset`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: {
          address: TEST_ADDRESS,
          assets: {
            nxOGQ: {
              BFM: {
                assetNumber: cfg.balance,
                assetType: 'BFM',
                sourceChainMagic: 'nxOGQ',
                sourceChainName: 'BFMeta',
              },
            },
          },
        },
      }),
    })
  })

  // Mock: 查询账户信息
  await page.route(`${RPC_URL}/wallet/*/address/info`, async (route) => {
    const response = {
      success: true,
      result: {
        address: TEST_ADDRESS,
        ...(cfg.hasSecondPublicKey ? { secondPublicKey: 'mock-second-public-key' } : {}),
      },
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })

  // Mock: 查询交易历史
  await page.route(`${RPC_URL}/wallet/*/transactions/query`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: {
          trs: (cfg.transactions || []).map((tx) => ({
            height: tx.height,
            signature: tx.signature + '-block',
            tIndex: 0,
            transaction: {
              signature: tx.signature,
              senderId: tx.senderId,
              recipientId: tx.recipientId,
              fee: tx.fee,
              timestamp: tx.timestamp,
              type: tx.type,
              asset: {
                transferAsset: {
                  amount: tx.amount,
                  assetType: 'BFM',
                },
              },
            },
          })),
          count: (cfg.transactions || []).length,
        },
      }),
    })
  })

  // Mock: 查询 Pending 交易
  await page.route(`${RPC_URL}/wallet/*/pendingTr`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: [],
      }),
    })
  })

  // Mock: 获取最低手续费
  await page.route(`${RPC_URL}/wallet/*/fee/transfer`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: {
          minFee: '222',
        },
      }),
    })
  })

  // Mock: 广播交易
  await page.route(`${RPC_URL}/wallet/*/broadcast`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        result: {
          signature: 'mock-broadcast-signature-' + Date.now(),
        },
      }),
    })
  })
}

/**
 * 清除 BioForest API Mock
 */
export async function clearBioforestMock(page: Page) {
  await page.unrouteAll()
}
