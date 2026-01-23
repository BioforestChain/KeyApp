/**
 * Chain Provider (Effect TS)
 * 
 * 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 * 使用 Effect TS 实现 fallback 和流式数据聚合。
 */

import { Effect, Stream } from "effect"
import { createStreamInstance, type StreamInstance, type FetchError } from "@biochain/chain-effect"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import type {
  ApiProvider,
  ApiProviderMethod,
  FeeEstimate,
  TransactionIntent,
  SignOptions,
  UnsignedTransaction,
  SignedTransaction,
  BalanceOutput,
  TokenBalancesOutput,
  TransactionsOutput,
  TransactionOutput,
  BlockHeightOutput,
  AddressParams,
  TxHistoryParams,
  TransactionParams,
  TransactionStatusParams,
  TransactionStatusOutput,
  TokenBalance,
} from "./types"

const SYNC_METHODS = new Set<ApiProviderMethod>(["isValidAddress", "normalizeAddress"])

/**
 * 创建 fallback StreamInstance - 依次尝试多个 source，返回第一个成功的
 */
function createFallbackStream<TInput, TOutput>(
  name: string,
  sources: StreamInstance<TInput, TOutput>[]
): StreamInstance<TInput, TOutput> {
  if (sources.length === 0) {
    // 空 sources - 返回一个总是失败的 stream
    return createStreamInstance<TInput, TOutput>(name, () =>
      Stream.fail({ _tag: "HttpError", message: "No providers available" } as FetchError)
    )
  }

  if (sources.length === 1) {
    return sources[0]
  }

  return createStreamInstance<TInput, TOutput>(name, (input) => {
    // 创建一个 fallback stream：尝试第一个，失败则尝试下一个
    const trySource = (index: number): Stream.Stream<TOutput, FetchError> => {
      if (index >= sources.length) {
        return Stream.fail({ _tag: "HttpError", message: "All providers failed" } as FetchError)
      }

      const source = sources[index]
      // 获取 source 的 stream，使用 subscribe 内部逻辑
      return Stream.fromEffect(
        Effect.tryPromise({
          try: () => source.fetch(input),
          catch: (e) => ({ _tag: "HttpError", message: String(e) }) as FetchError,
        })
      ).pipe(
        Stream.catchAll(() => trySource(index + 1))
      )
    }

    return trySource(0)
  })
}

export class ChainProvider {
  readonly chainId: string
  private readonly providers: ApiProvider[]

  // 缓存
  private _nativeBalance?: StreamInstance<AddressParams, BalanceOutput>
  private _tokenBalances?: StreamInstance<AddressParams, TokenBalancesOutput>
  private _transactionHistory?: StreamInstance<TxHistoryParams, TransactionsOutput>
  private _transaction?: StreamInstance<TransactionParams, TransactionOutput>
  private _transactionStatus?: StreamInstance<TransactionStatusParams, TransactionStatusOutput>
  private _blockHeight?: StreamInstance<void, BlockHeightOutput>
  private _allBalances?: StreamInstance<AddressParams, TokenBalancesOutput>

  constructor(chainId: string, providers: ApiProvider[]) {
    this.chainId = chainId
    this.providers = providers
  }

  supports(
    capability: "nativeBalance" | "tokenBalances" | "transactionHistory" | "blockHeight" | "transactionStatus" | ApiProviderMethod
  ): boolean {
    if (capability === "nativeBalance") {
      return this.providers.some((p) => p.nativeBalance !== undefined)
    }
    if (capability === "tokenBalances") {
      return this.providers.some((p) => p.tokenBalances !== undefined)
    }
    if (capability === "transactionHistory") {
      return this.providers.some((p) => p.transactionHistory !== undefined)
    }
    if (capability === "blockHeight") {
      return this.providers.some((p) => p.blockHeight !== undefined)
    }
    if (capability === "transactionStatus") {
      return this.providers.some((p) => p.transactionStatus !== undefined)
    }

    return this.providers.some((p) => typeof p[capability as ApiProviderMethod] === "function")
  }

  private getMethod<K extends ApiProviderMethod>(method: K): ApiProvider[K] | undefined {
    const candidates = this.providers.filter((p) => typeof p[method] === "function")
    if (candidates.length === 0) return undefined

    const first = candidates[0]
    const firstFn = first[method]
    if (typeof firstFn !== "function") return undefined

    if (SYNC_METHODS.has(method)) {
      return firstFn.bind(first) as ApiProvider[K]
    }

    const fn = (async (...args: unknown[]) => {
      let lastError: unknown = null

      for (const provider of candidates) {
        const impl = provider[method]
        if (typeof impl !== "function") continue
        try {
          return await (impl as (...args: unknown[]) => Promise<unknown>).apply(provider, args)
        } catch (error) {
          lastError = error
        }
      }

      throw lastError instanceof Error ? lastError : new Error("All providers failed")
    }) as ApiProvider[K]

    return fn
  }

  // ===== 便捷属性 =====

  get supportsNativeBalance(): boolean {
    return this.supports("nativeBalance")
  }

  get supportsTokenBalances(): boolean {
    return this.supports("tokenBalances")
  }

  get supportsTransactionHistory(): boolean {
    return this.supports("transactionHistory")
  }

  get supportsBlockHeight(): boolean {
    return this.supports("blockHeight")
  }

  get supportsFeeEstimate(): boolean {
    return this.supports("estimateFee")
  }

  get supportsBuildTransaction(): boolean {
    return this.supports("buildTransaction")
  }

  get supportsSignTransaction(): boolean {
    return this.supports("signTransaction")
  }

  get supportsBroadcast(): boolean {
    return this.supports("broadcastTransaction")
  }

  get supportsFullTransaction(): boolean {
    return this.supportsBuildTransaction && this.supportsSignTransaction && this.supportsBroadcast
  }

  get supportsDeriveAddress(): boolean {
    return this.supports("deriveAddress")
  }

  get supportsAddressValidation(): boolean {
    return this.supports("isValidAddress")
  }

  // ===== 响应式查询 =====

  get nativeBalance(): StreamInstance<AddressParams, BalanceOutput> {
    if (!this._nativeBalance) {
      const sources = this.providers
        .map((p) => p.nativeBalance)
        .filter((f): f is NonNullable<typeof f> => f !== undefined)
      this._nativeBalance = createFallbackStream(`${this.chainId}.nativeBalance`, sources)
    }
    return this._nativeBalance
  }

  get tokenBalances(): StreamInstance<AddressParams, TokenBalancesOutput> {
    if (!this._tokenBalances) {
      const sources = this.providers
        .map((p) => p.tokenBalances)
        .filter((f): f is NonNullable<typeof f> => f !== undefined)
      this._tokenBalances = createFallbackStream(`${this.chainId}.tokenBalances`, sources)
    }
    return this._tokenBalances
  }

  get allBalances(): StreamInstance<AddressParams, TokenBalancesOutput> {
    if (!this._allBalances) {
      const hasTokenBalances = this.supportsTokenBalances
      const hasNativeBalance = this.supportsNativeBalance

      if (hasTokenBalances) {
        this._allBalances = this.tokenBalances
      } else if (hasNativeBalance) {
        const { chainId } = this
        const symbol = chainConfigService.getSymbol(chainId)
        const decimals = chainConfigService.getDecimals(chainId)

        this._allBalances = createStreamInstance<AddressParams, TokenBalancesOutput>(
          `${chainId}.allBalances`,
          (params) => {
            const nativeStream = this.nativeBalance
            return Stream.fromEffect(
              Effect.tryPromise({
                try: () => nativeStream.fetch(params),
                catch: (e) => ({ _tag: "HttpError", message: String(e) }) as FetchError,
              })
            ).pipe(
              Stream.map((balance): TokenBalancesOutput => {
                if (!balance) return []
                return [
                  {
                    symbol: balance.symbol || symbol,
                    name: balance.symbol || symbol,
                    amount: balance.amount,
                    isNative: true,
                    decimals,
                  },
                ]
              })
            )
          }
        )
      } else {
        this._allBalances = createFallbackStream(`${this.chainId}.allBalances`, [])
      }
    }
    return this._allBalances
  }

  get transactionHistory(): StreamInstance<TxHistoryParams, TransactionsOutput> {
    if (!this._transactionHistory) {
      const sources = this.providers
        .map((p) => p.transactionHistory)
        .filter((f): f is NonNullable<typeof f> => f !== undefined)
      this._transactionHistory = createFallbackStream(`${this.chainId}.transactionHistory`, sources)
    }
    return this._transactionHistory
  }

  get transaction(): StreamInstance<TransactionParams, TransactionOutput> {
    if (!this._transaction) {
      const sources = this.providers
        .map((p) => p.transaction)
        .filter((f): f is NonNullable<typeof f> => f !== undefined)
      this._transaction = createFallbackStream(`${this.chainId}.transaction`, sources)
    }
    return this._transaction
  }

  get transactionStatus(): StreamInstance<TransactionStatusParams, TransactionStatusOutput> {
    if (!this._transactionStatus) {
      const sources = this.providers
        .map((p) => p.transactionStatus)
        .filter((f): f is NonNullable<typeof f> => f !== undefined)
      this._transactionStatus = createFallbackStream(`${this.chainId}.transactionStatus`, sources)
    }
    return this._transactionStatus
  }

  get blockHeight(): StreamInstance<void, BlockHeightOutput> {
    if (!this._blockHeight) {
      const sources = this.providers
        .map((p) => p.blockHeight)
        .filter((f): f is NonNullable<typeof f> => f !== undefined)
      this._blockHeight = createFallbackStream(`${this.chainId}.blockHeight`, sources)
    }
    return this._blockHeight
  }

  // ===== 代理方法 =====

  get buildTransaction(): ((intent: TransactionIntent) => Promise<UnsignedTransaction>) | undefined {
    return this.getMethod("buildTransaction")
  }

  get estimateFee(): ((unsignedTx: UnsignedTransaction) => Promise<FeeEstimate>) | undefined {
    return this.getMethod("estimateFee")
  }

  get signTransaction():
    | ((unsignedTx: UnsignedTransaction, options: SignOptions) => Promise<SignedTransaction>)
    | undefined {
    return this.getMethod("signTransaction")
  }

  get broadcastTransaction(): ((signedTx: SignedTransaction) => Promise<string>) | undefined {
    return this.getMethod("broadcastTransaction")
  }

  get deriveAddress(): ((seed: Uint8Array, index?: number) => Promise<string>) | undefined {
    return this.getMethod("deriveAddress")
  }

  get deriveAddresses(): ((seed: Uint8Array, startIndex: number, count: number) => Promise<string[]>) | undefined {
    return this.getMethod("deriveAddresses")
  }

  get isValidAddress(): ((address: string) => boolean) | undefined {
    return this.getMethod("isValidAddress")
  }

  get normalizeAddress(): ((address: string) => string) | undefined {
    return this.getMethod("normalizeAddress")
  }

  // ===== BioChain 专属 =====

  get bioGetAccountInfo() {
    return this.getMethod("bioGetAccountInfo")
  }

  get bioVerifyPayPassword() {
    return this.getMethod("bioVerifyPayPassword")
  }

  get bioGetAssetDetail() {
    return this.getMethod("bioGetAssetDetail")
  }

  get supportsBioAccountInfo(): boolean {
    return this.supports("bioGetAccountInfo")
  }

  // ===== 工具方法 =====

  getProviders(): readonly ApiProvider[] {
    return this.providers
  }

  getProviderByType(type: string): ApiProvider | undefined {
    return this.providers.find((p) => p.type === type)
  }
}
