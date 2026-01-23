/**
 * Chain Provider (Effect TS)
 * 
 * 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 * 使用 Effect TS 实现 fallback 和流式数据聚合。
 */

import { Effect, Stream } from "effect"
import { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } from "react"
import { createStreamInstance, type StreamInstance, type FetchError } from "@biochain/chain-effect"
import { chainConfigService } from "@/services/chain-config"
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
} from "./types"

const SYNC_METHODS = new Set<ApiProviderMethod>(["isValidAddress", "normalizeAddress"])

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function toStableJson(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString()
  }
  if (!isRecord(value)) {
    if (Array.isArray(value)) {
      return value.map(toStableJson)
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map(toStableJson)
  }
  const sorted: UnknownRecord = {}
  for (const key of Object.keys(value).sort()) {
    sorted[key] = toStableJson(value[key])
  }
  return sorted
}

function stableStringify(value: unknown): string {
  return JSON.stringify(toStableJson(value))
}

function isDebugEnabled(): boolean {
  if (typeof globalThis === "undefined") return false
  const store = globalThis as typeof globalThis & { __CHAIN_EFFECT_DEBUG__?: boolean }
  return store.__CHAIN_EFFECT_DEBUG__ === true
}

function debugLog(...args: string[]): void {
  if (!isDebugEnabled()) return
  console.log("[chain-provider]", ...args)
}

function summarizeValue(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value[0]
    if (isRecord(first) && "hash" in first) {
      return `array(len=${value.length}, firstHash=${String(first.hash)})`
    }
    return `array(len=${value.length})`
  }
  if (isRecord(value)) {
    if ("hash" in value) return `object(hash=${String(value.hash)})`
    if ("symbol" in value) return `object(symbol=${String(value.symbol)})`
    return "object"
  }
  return String(value)
}

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

  debugLog(`${name} fallback`, `sources=${sources.map((s) => s.name).join(",")}`)

  let resolvedSource: StreamInstance<TInput, TOutput> | null = null

  const resolveSource = async (input: TInput): Promise<StreamInstance<TInput, TOutput>> => {
    if (resolvedSource) return resolvedSource

    for (const source of sources) {
      try {
        await source.fetch(input)
        resolvedSource = source
        debugLog(`${name} resolved`, source.name)
        return source
      } catch {
        // try next
      }
    }

    // fallback to first source to keep behavior stable
    resolvedSource = sources[0]
    debugLog(`${name} resolved`, sources[0].name)
    return sources[0]
  }

  const fetch = async (input: TInput): Promise<TOutput> => {
    for (const source of sources) {
      try {
        const result = await source.fetch(input)
        resolvedSource = source
        return result
      } catch {
        // try next
      }
    }
    throw new Error("All providers failed")
  }

  const subscribe = (
    input: TInput,
    callback: (data: TOutput, event: "initial" | "update") => void
  ): (() => void) => {
    let cancelled = false
    let cleanup: (() => void) | null = null

    const key = input === undefined || input === null ? "__empty__" : stableStringify(input)
    debugLog(`${name} subscribe`, key)
    resolveSource(input)
      .then((source) => {
        if (cancelled) return
        cleanup = source.subscribe(input, (data, event) => {
          debugLog(`${name} emit`, event, summarizeValue(data))
          callback(data, event)
        })
      })
      .catch((err) => {
        console.error(`[${name}] resolveSource failed:`, err)
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }

  return {
    name,
    fetch,
    subscribe,
    useState(input: TInput, options?: { enabled?: boolean }) {
      const [isLoading, setIsLoading] = useState(true)
      const [isFetching, setIsFetching] = useState(false)
      const [error, setError] = useState<Error | undefined>(undefined)

      const getInputKey = (value: TInput): string => {
        if (value === undefined || value === null) return "__empty__"
        return stableStringify(value)
      }

      const inputKey = useMemo(() => getInputKey(input), [input])
      const inputRef = useRef(input)
      inputRef.current = input

      const enabled = options?.enabled !== false

      const snapshotRef = useRef<TOutput | undefined>(undefined)

      const subscribeFn = useCallback((onStoreChange: () => void) => {
        if (!enabled) {
          snapshotRef.current = undefined
          return () => {}
        }

        setIsLoading(true)
        setIsFetching(true)
        setError(undefined)

        const unsubscribe = subscribe(inputRef.current, (newData: TOutput) => {
          snapshotRef.current = newData
          setIsLoading(false)
          setIsFetching(false)
          setError(undefined)
          debugLog(`${name} storeChange`, summarizeValue(newData))
          onStoreChange()
        })

        return unsubscribe
      }, [enabled, inputKey])

      const getSnapshot = useCallback(() => snapshotRef.current, [])

      const data = useSyncExternalStore(subscribeFn, getSnapshot, getSnapshot)

      const refetch = useCallback(async () => {
        if (!enabled) return
        setIsFetching(true)
        setError(undefined)
        try {
          const result = await fetch(inputRef.current)
          snapshotRef.current = result
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
          setIsFetching(false)
          setIsLoading(false)
        }
      }, [enabled])

      useEffect(() => {
        if (!enabled) {
          snapshotRef.current = undefined
          setIsLoading(false)
          setIsFetching(false)
          setError(undefined)
        }
      }, [enabled])

      return { data, isLoading, isFetching, error, refetch }
    },
    invalidate(): void {
      resolvedSource = null
      for (const source of sources) {
        source.invalidate()
      }
    },
  }
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
