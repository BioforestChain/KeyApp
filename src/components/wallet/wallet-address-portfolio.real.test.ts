import { beforeEach, describe, expect, it, vi } from "vitest"
import { clearProviderCache, createChainProvider } from "@/services/chain-adapter"
import type { ChainConfig } from "@/services/chain-config"

const mockGetChainById = vi.fn<(id: string) => ChainConfig | null>()

vi.mock("@/stores/chain-config", () => ({
  chainConfigStore: {
    state: {},
  },
  chainConfigSelectors: {
    getChainById: (_state: unknown, id: string) => mockGetChainById(id),
  },
}))

async function firstSuccess<T>(options: {
  chainId: string
  method: "getNativeBalance" | "getTransactionHistory"
  args: unknown[]
}): Promise<{ providerType: string; result: T }> {
  const provider = createChainProvider(options.chainId)
  const providers = provider.getProviders()

  let lastError: unknown = null

  for (const candidate of providers) {
    const fn = (candidate as any)[options.method]
    if (typeof fn !== "function") continue

    try {
      const result = (await fn.apply(candidate, options.args)) as T
      return { providerType: candidate.type, result }
    } catch (error) {
      lastError = error
    }
  }

  throw new Error(
    `All providers failed for ${options.chainId}:${options.method}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  )
}

describe.skipIf(!process.env.TEST_REAL_API)("WalletAddressPortfolio Real Provider Sanity", () => {
  const configs: Record<string, ChainConfig> = {
    ethereum: {
      id: "ethereum",
      version: "1.0",
      chainKind: "evm",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      enabled: true,
      source: "default",
      apis: [
        { type: "blockscout-v1", endpoint: "https://eth.blockscout.com/api" },
        { type: "ethereum-rpc", endpoint: "https://ethereum-rpc.publicnode.com" },
        { type: "ethwallet-v1", endpoint: "https://walletapi.bfmeta.info/wallet/eth" },
      ],
    },
    tron: {
      id: "tron",
      version: "1.0",
      chainKind: "tron",
      name: "Tron",
      symbol: "TRX",
      decimals: 6,
      enabled: true,
      source: "default",
      apis: [
        { type: "tron-rpc", endpoint: "https://api.trongrid.io" },
        { type: "tron-rpc-pro", endpoint: "https://api.trongrid.io", config: { apiKeyEnv: "VITE_TRONGRID_API_KEY" } },
        { type: "tronwallet-v1", endpoint: "https://walletapi.bfmeta.info/wallet/tron" },
      ],
    },
    bitcoin: {
      id: "bitcoin",
      version: "1.0",
      chainKind: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 8,
      enabled: true,
      source: "default",
      apis: [
        { type: "mempool-v1", endpoint: "https://mempool.space/api" },
        { type: "btcwallet-v1", endpoint: "https://walletapi.bfmeta.info/wallet/btc/blockbook" },
      ],
    },
  }

  beforeEach(() => {
    clearProviderCache()
    mockGetChainById.mockImplementation((id) => configs[id] ?? null)
  })

  it(
    "ethereum should return balance>0 and txs>0",
    async () => {
      const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

      const balance = await firstSuccess<{ amount: { raw: bigint } }>({
        chainId: "ethereum",
        method: "getNativeBalance",
        args: [address],
      })
      expect(balance.result.amount.raw).toBeGreaterThan(0n)
      console.log(`[real] ethereum balance provider: ${balance.providerType}`)

      const history = await firstSuccess<unknown[]>({
        chainId: "ethereum",
        method: "getTransactionHistory",
        args: [address, 10],
      })
      expect(history.result.length).toBeGreaterThan(0)
      console.log(`[real] ethereum txHistory provider: ${history.providerType}`)
    },
    30_000,
  )

  it(
    "tron should return balance>0 and txs>0",
    async () => {
      const address = "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9"

      const balance = await firstSuccess<{ amount: { raw: bigint } }>({
        chainId: "tron",
        method: "getNativeBalance",
        args: [address],
      })
      expect(balance.result.amount.raw).toBeGreaterThan(0n)
      console.log(`[real] tron balance provider: ${balance.providerType}`)

      const history = await firstSuccess<unknown[]>({
        chainId: "tron",
        method: "getTransactionHistory",
        args: [address, 10],
      })
      expect(history.result.length).toBeGreaterThan(0)
      console.log(`[real] tron txHistory provider: ${history.providerType}`)
    },
    30_000,
  )

  it(
    "bitcoin should return balance>0 and txs>0",
    async () => {
      const address = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"

      const balance = await firstSuccess<{ amount: { raw: bigint } }>({
        chainId: "bitcoin",
        method: "getNativeBalance",
        args: [address],
      })
      expect(balance.result.amount.raw).toBeGreaterThan(0n)
      console.log(`[real] bitcoin balance provider: ${balance.providerType}`)

      const history = await firstSuccess<unknown[]>({
        chainId: "bitcoin",
        method: "getTransactionHistory",
        args: [address, 10],
      })
      expect(history.result.length).toBeGreaterThan(0)
      console.log(`[real] bitcoin txHistory provider: ${history.providerType}`)
    },
    30_000,
  )
})
