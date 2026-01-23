/**
 * BioWallet API Provider (Effect TS - 深度重构)
 *
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发
 * - balance/tokenBalances: 依赖 transactionHistory 变化
 */

import { Effect, Duration } from 'effect';
import { Schema as S } from 'effect';
import {
  httpFetch,
  httpFetchCached,
  createStreamInstanceFromSource,
  createPollingSource,
  createDependentSource,
  createEventBusService,
  acquireSource,
  releaseSource,
  makeRegistryKey,
  type FetchError,
  type DataSource,
  type EventBusService,
} from '@biochain/chain-effect';
import type { StreamInstance } from '@biochain/chain-effect';
import type {
  ApiProvider,
  TokenBalance,
  Transaction,
  Direction,
  Action,
  BalanceOutput,
  BlockHeightOutput,
  TokenBalancesOutput,
  TransactionOutput,
  TransactionsOutput,
  AddressParams,
  TxHistoryParams,
  TransactionParams,
} from './types';
import { setForgeInterval } from '../bioforest/fetch';
import type { ParsedApiEntry } from '@/services/chain-config';
import { chainConfigService } from '@/services/chain-config';
import { Amount } from '@/types/amount';
import { BioforestIdentityMixin } from '../bioforest/identity-mixin';
import { BioforestTransactionMixin } from '../bioforest/transaction-mixin';
import { BioforestAccountMixin } from '../bioforest/account-mixin';
import { fetchGenesisBlock } from '@/services/bioforest-sdk';

// ==================== Effect Schema 定义 ====================

const BiowalletAssetItemSchema = S.Struct({
  assetNumber: S.String,
  assetType: S.String,
});

const AssetResultSchema = S.Struct({
  address: S.String,
  assets: S.Record({ key: S.String, value: S.Record({ key: S.String, value: BiowalletAssetItemSchema }) }),
});

const AssetResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.NullOr(AssetResultSchema)),
});
type AssetResponse = S.Schema.Type<typeof AssetResponseSchema>;

const TransferAssetSchema = S.Struct({
  assetType: S.String,
  amount: S.String,
});

const GiftAssetSchema = S.Struct({
  totalAmount: S.String,
  assetType: S.String,
});

const GrabAssetSchema = S.Struct({
  transactionSignature: S.String,
});

const TrustAssetSchema = S.Struct({
  trustees: S.Array(S.String),
  numberOfSignFor: S.Number,
  assetType: S.String,
  amount: S.String,
});

const SignatureAssetSchema = S.Struct({
  publicKey: S.optional(S.String),
});

const DestroyAssetSchema = S.Struct({
  assetType: S.String,
  amount: S.String,
});

const IssueEntitySchema = S.Struct({
  entityId: S.optional(S.String),
});

const IssueEntityFactorySchema = S.Struct({
  factoryId: S.optional(S.String),
});

const TxAssetSchema = S.Struct({
  transferAsset: S.optional(TransferAssetSchema),
  giftAsset: S.optional(GiftAssetSchema),
  grabAsset: S.optional(GrabAssetSchema),
  trustAsset: S.optional(TrustAssetSchema),
  signature: S.optional(SignatureAssetSchema),
  destroyAsset: S.optional(DestroyAssetSchema),
  issueEntity: S.optional(IssueEntitySchema),
  issueEntityFactory: S.optional(IssueEntityFactorySchema),
});

const BiowalletTxTransactionSchema = S.Struct({
  type: S.String,
  senderId: S.String,
  recipientId: S.optionalWith(S.String, { default: () => '' }),
  timestamp: S.Number,
  signature: S.String,
  asset: S.optional(TxAssetSchema),
});
type BiowalletTxTransaction = S.Schema.Type<typeof BiowalletTxTransactionSchema>;

const BiowalletTxItemSchema = S.Struct({
  height: S.Number,
  signature: S.String,
  transaction: BiowalletTxTransactionSchema,
});

const TxListResultSchema = S.Struct({
  trs: S.Array(BiowalletTxItemSchema),
  count: S.optional(S.Number),
});

const TxListResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(TxListResultSchema),
});
type TxListResponse = S.Schema.Type<typeof TxListResponseSchema>;

const BlockResultSchema = S.Struct({
  height: S.Number,
});

const BlockResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(BlockResultSchema),
});
type BlockResponse = S.Schema.Type<typeof BlockResponseSchema>;

const PendingTrItemSchema = S.Struct({
  state: S.Number,
  trJson: BiowalletTxTransactionSchema,
  signature: S.optional(S.String),
  createdTime: S.String,
});

const PendingTrResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.Array(PendingTrItemSchema)),
});
type PendingTrResponse = S.Schema.Type<typeof PendingTrResponseSchema>;

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();
  const addrLower = address.toLowerCase();

  if (!toLower) return fromLower === addrLower ? 'out' : 'in';
  if (fromLower === addrLower && toLower === addrLower) return 'self';
  if (fromLower === addrLower) return 'out';
  return 'in';
}

const DEFAULT_EPOCH_MS = 0;

function detectAction(txType: string): Action {
  const typeMap: Record<string, Action> = {
    'AST-01': 'transfer',
    'AST-02': 'transfer',
    'AST-03': 'destroyAsset',
    'BSE-01': 'signature',
    'ETY-01': 'issueEntity',
    'ETY-02': 'issueEntity',
    'GFT-01': 'gift',
    'GFT-02': 'gift',
    'GRB-01': 'grab',
    'GRB-02': 'grab',
    'TRS-01': 'trust',
    'TRS-02': 'trust',
    'SGN-01': 'signFor',
    'SGN-02': 'signFor',
    'EMI-01': 'emigrate',
    'EMI-02': 'emigrate',
    'IMI-01': 'immigrate',
    'IMI-02': 'immigrate',
    'ISA-01': 'issueAsset',
    'ICA-01': 'increaseAsset',
    'DSA-01': 'destroyAsset',
    'ISE-01': 'issueEntity',
    'DSE-01': 'destroyEntity',
    'LNS-01': 'locationName',
    'DAP-01': 'dapp',
    'CRT-01': 'certificate',
    'MRK-01': 'mark',
  };

  const parts = txType.split('-');
  if (parts.length >= 4) {
    const suffix = `${parts[parts.length - 2]}-${parts[parts.length - 1]}`;
    return typeMap[suffix] ?? 'unknown';
  }

  return 'unknown';
}

function extractAssetInfo(
  asset: BiowalletTxTransaction['asset'],
  defaultSymbol: string,
): { value: string | null; assetType: string } {
  if (!asset) return { value: null, assetType: defaultSymbol };

  if (asset.transferAsset) {
    return { value: asset.transferAsset.amount, assetType: asset.transferAsset.assetType };
  }
  if (asset.giftAsset) {
    return { value: asset.giftAsset.totalAmount, assetType: asset.giftAsset.assetType };
  }
  if (asset.trustAsset) {
    return { value: asset.trustAsset.amount, assetType: asset.trustAsset.assetType };
  }
  if (asset.grabAsset) {
    return { value: '0', assetType: defaultSymbol };
  }
  if (asset.destroyAsset) {
    return { value: asset.destroyAsset.amount, assetType: asset.destroyAsset.assetType };
  }
  if (asset.issueEntity || asset.issueEntityFactory) {
    return { value: '0', assetType: defaultSymbol };
  }
  if (asset.signature) {
    return { value: '0', assetType: defaultSymbol };
  }

  return { value: null, assetType: defaultSymbol };
}

function convertBioTransactionToTransaction(
  bioTx: BiowalletTxTransaction,
  options: {
    signature: string;
    height?: number;
    status: 'pending' | 'confirmed' | 'failed';
    createdTime?: string;
    address?: string;
    epochMs: number;
  },
): Transaction {
  const { signature, height, status, createdTime, address = '', epochMs } = options;
  const { value, assetType } = extractAssetInfo(bioTx.asset, 'BFM');

  const timestamp = createdTime ? new Date(createdTime).getTime() : epochMs + bioTx.timestamp * 1000;

  const direction = address ? getDirection(bioTx.senderId, bioTx.recipientId ?? '', address) : 'out';

  return {
    hash: signature,
    from: bioTx.senderId,
    to: bioTx.recipientId ?? '',
    timestamp,
    status,
    blockNumber: height !== undefined ? BigInt(height) : undefined,
    action: detectAction(bioTx.type),
    direction,
    assets: [
      {
        assetType: 'native' as const,
        value: value ?? '0',
        symbol: assetType,
        decimals: 8,
      },
    ],
  };
}

// ==================== 判断交易列表是否变化 ====================

function hasTransactionListChanged(prev: TransactionsOutput | null, next: TransactionsOutput): boolean {
  if (!prev) return true;
  if (prev.length !== next.length) return true;
  if (prev.length === 0 && next.length === 0) return false;
  // 比较第一条交易的 hash
  return prev[0]?.hash !== next[0]?.hash;
}

// ==================== Base Class for Mixins ====================

class BiowalletBase {
  readonly chainId: string;
  readonly type: string;
  readonly endpoint: string;
  readonly config?: Record<string, unknown>;

  constructor(entry: ParsedApiEntry, chainId: string) {
    this.type = entry.type;
    this.endpoint = entry.endpoint;
    this.config = entry.config;
    this.chainId = chainId;
  }
}

// ==================== Provider 实现 ====================

export class BiowalletProviderEffect
  extends BioforestAccountMixin(BioforestIdentityMixin(BioforestTransactionMixin(BiowalletBase)))
  implements ApiProvider
{
  private readonly symbol: string;
  private readonly decimals: number;
  private readonly baseUrl: string;
  private forgeInterval: number = 15000;
  private epochMs: number = DEFAULT_EPOCH_MS;

  // 缓存 TTL = 出块时间 / 2
  private get cacheTtl(): number {
    return this.forgeInterval / 2;
  }

  // Provider 级别共享的 EventBus（延迟初始化）
  private _eventBus: EventBusService | null = null;

  // StreamInstance 接口（React 兼容层）
  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>;
  readonly tokenBalances: StreamInstance<AddressParams, TokenBalancesOutput>;
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>;
  readonly blockHeight: StreamInstance<void, BlockHeightOutput>;
  readonly transaction: StreamInstance<TransactionParams, TransactionOutput>;

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId);
    this.symbol = chainConfigService.getSymbol(chainId);
    this.decimals = chainConfigService.getDecimals(chainId);
    this.baseUrl = this.endpoint;

    const genesisPath = chainConfigService.getBiowalletGenesisBlock(chainId);
    if (genesisPath) {
      fetchGenesisBlock(chainId, genesisPath)
        .then((genesis) => {
          const interval = genesis.asset.genesisAsset.forgeInterval;
          if (typeof interval === 'number') {
            this.forgeInterval = interval * 1000;
            setForgeInterval(chainId, this.forgeInterval);
          }
          const beginEpochTime = genesis.asset.genesisAsset.beginEpochTime;
          if (typeof beginEpochTime === 'number') {
            this.epochMs = beginEpochTime;
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch genesis block:', err);
        });
    }

    const symbol = this.symbol;
    const decimals = this.decimals;
    const provider = this;

    // ==================== transactionHistory: 定时轮询 + 事件触发 ====================
    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `biowallet.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params, symbol, decimals),
    );

    // ==================== nativeBalance: 依赖 transactionHistory 变化 ====================
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `biowallet.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params, symbol, decimals),
    );

    // ==================== tokenBalances: 依赖 transactionHistory 变化 ====================
    this.tokenBalances = createStreamInstanceFromSource<AddressParams, TokenBalancesOutput>(
      `biowallet.${chainId}.tokenBalances`,
      (params) => provider.createTokenBalancesSource(params, symbol, decimals),
    );

    // ==================== blockHeight: 简单轮询 ====================
    this.blockHeight = createStreamInstanceFromSource<void, BlockHeightOutput>(`biowallet.${chainId}.blockHeight`, () =>
      provider.createBlockHeightSource(),
    );

    // ==================== transaction: 简单查询 ====================
    this.transaction = createStreamInstanceFromSource<TransactionParams, TransactionOutput>(
      `biowallet.${chainId}.transaction`,
      (params) => provider.createTransactionSource(params),
    );
  }

  // ==================== Source 创建方法 ====================

  /**
   * 获取共享的 blockHeight source（全局单例 + 引用计数）
   * 作为依赖链的根节点
   */
  private getSharedBlockHeightSource(): Effect.Effect<DataSource<BlockHeightOutput>> {
    const provider = this;
    const registryKey = makeRegistryKey(this.chainId, 'global', 'blockHeight');

    const fetchEffect = provider.fetchBlockHeight().pipe(
      Effect.map((raw): BlockHeightOutput => {
        if (!raw.result?.height) return BigInt(0);
        return BigInt(raw.result.height);
      }),
    );

    return acquireSource<BlockHeightOutput>(registryKey, {
      fetch: fetchEffect,
      interval: Duration.millis(this.forgeInterval),
    });
  }

  /**
   * 获取共享的 transactionHistory source（全局单例 + 引用计数）
   * 依赖 blockHeight 变化触发刷新
   */
  private getSharedTxHistorySource(
    address: string,
    symbol: string,
    decimals: number,
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    const provider = this;
    const normalizedAddress = address.toLowerCase();

    return Effect.gen(function* () {
      // 获取共享的 blockHeight source 作为依赖
      const blockHeightSource = yield* provider.getSharedBlockHeightSource();

      const fetchEffect = provider.fetchTransactionList({ address, limit: 50 }).pipe(
        Effect.map((raw): TransactionsOutput => {
          if (!raw.result?.trs) return [];

          return raw.result.trs
            .map((item): Transaction | null => {
              const tx = item.transaction;
              const action = detectAction(tx.type);
              const direction = getDirection(tx.senderId, tx.recipientId ?? '', normalizedAddress);
              const { value, assetType } = extractAssetInfo(tx.asset, symbol);
              if (value === null) return null;

              return {
                hash: tx.signature ?? item.signature,
                from: tx.senderId,
                to: tx.recipientId ?? '',
                timestamp: provider.epochMs + tx.timestamp * 1000,
                status: 'confirmed',
                blockNumber: BigInt(item.height),
                action,
                direction,
                assets: [
                  {
                    assetType: 'native' as const,
                    value,
                    symbol: assetType,
                    decimals,
                  },
                ],
              };
            })
            .filter((tx): tx is Transaction => tx !== null)
            .sort((a, b) => b.timestamp - a.timestamp);
        }),
      );

      // 依赖 blockHeight 变化触发刷新
      const source = yield* createDependentSource({
        name: `biowallet.${provider.chainId}.txHistory.${normalizedAddress}`,
        dependsOn: blockHeightSource.ref,
        hasChanged: (prev, curr) => prev !== curr,
        fetch: (_: BlockHeightOutput) => fetchEffect,
      });

      return source;
    });
  }

  private createTransactionHistorySource(
    params: TxHistoryParams,
    symbol: string,
    decimals: number,
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    // 直接使用共享的 txHistory source
    return this.getSharedTxHistorySource(params.address, symbol, decimals);
  }

  private createBalanceSource(
    params: AddressParams,
    symbol: string,
    decimals: number,
  ): Effect.Effect<DataSource<BalanceOutput>> {
    const provider = this;

    return Effect.gen(function* () {
      // 先创建 transactionHistory source 作为依赖
      const txHistorySource = yield* provider.createTransactionHistorySource(
        { address: params.address, limit: 1 },
        symbol,
        decimals,
      );

      const fetchEffect = provider.fetchAddressAsset(params.address).pipe(
        Effect.map((raw): BalanceOutput => {
          if (!raw.result?.assets) {
            return { amount: Amount.zero(decimals, symbol), symbol };
          }
          for (const magic of Object.values(raw.result.assets)) {
            for (const asset of Object.values(magic)) {
              if (asset.assetType === symbol) {
                return {
                  amount: Amount.fromRaw(asset.assetNumber, decimals, symbol),
                  symbol,
                };
              }
            }
          }
          return { amount: Amount.zero(decimals, symbol), symbol };
        }),
      );

      // 依赖 transactionHistory 变化
      const source = yield* createDependentSource({
        name: `biowallet.${provider.chainId}.balance`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: () => fetchEffect,
      });

      return source;
    });
  }

  private createTokenBalancesSource(
    params: AddressParams,
    symbol: string,
    decimals: number,
  ): Effect.Effect<DataSource<TokenBalancesOutput>> {
    const provider = this;

    return Effect.gen(function* () {
      // 先创建 transactionHistory source 作为依赖
      const txHistorySource = yield* provider.createTransactionHistorySource(
        { address: params.address, limit: 1 },
        symbol,
        decimals,
      );

      const fetchEffect = provider.fetchAddressAsset(params.address).pipe(
        Effect.map((raw): TokenBalancesOutput => {
          if (!raw.result?.assets) return [];
          const tokens: TokenBalance[] = [];

          for (const magic of Object.values(raw.result.assets)) {
            for (const asset of Object.values(magic)) {
              const isNative = asset.assetType === symbol;
              tokens.push({
                symbol: asset.assetType,
                name: asset.assetType,
                amount: Amount.fromRaw(asset.assetNumber, decimals, asset.assetType),
                isNative,
                decimals,
              });
            }
          }

          tokens.sort((a, b) => {
            if (a.isNative && !b.isNative) return -1;
            if (!a.isNative && b.isNative) return 1;
            return b.amount.toNumber() - a.amount.toNumber();
          });

          return tokens;
        }),
      );

      // 依赖 transactionHistory 变化
      const source = yield* createDependentSource({
        name: `biowallet.${provider.chainId}.tokenBalances`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: () => fetchEffect,
      });

      return source;
    });
  }

  private createBlockHeightSource(): Effect.Effect<DataSource<BlockHeightOutput>> {
    // 使用共享的 blockHeight source
    return this.getSharedBlockHeightSource();
  }

  private createTransactionSource(params: TransactionParams): Effect.Effect<DataSource<TransactionOutput>> {
    const provider = this;

    return Effect.gen(function* () {
      const fetchEffect = Effect.all({
        pending: provider.fetchPendingTransactions(params.senderId ?? ''),
        confirmed: provider.fetchSingleTransaction(params.txHash),
      }).pipe(
        Effect.map(({ pending, confirmed }): TransactionOutput => {
          if (pending.result && pending.result.length > 0) {
            const pendingTx = pending.result.find((tx) => tx.signature === params.txHash);
            if (pendingTx) {
              return convertBioTransactionToTransaction(pendingTx.trJson, {
                signature: pendingTx.trJson.signature ?? pendingTx.signature ?? '',
                status: 'pending',
                createdTime: pendingTx.createdTime,
                epochMs: provider.epochMs,
              });
            }
          }

          if (confirmed.result?.trs?.length) {
            const item = confirmed.result.trs[0];
            return convertBioTransactionToTransaction(item.transaction, {
              signature: item.transaction.signature ?? item.signature,
              height: item.height,
              status: 'confirmed',
              epochMs: provider.epochMs,
            });
          }

          return null;
        }),
      );

      // 交易查询使用轮询（等待确认）
      const source = yield* createPollingSource({
        name: `biowallet.${provider.chainId}.transaction`,
        fetch: fetchEffect,
        interval: Duration.millis(provider.forgeInterval),
      });

      return source;
    });
  }

  // ==================== HTTP Fetch 方法 ====================

  private fetchBlockHeight(): Effect.Effect<BlockResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/lastblock`,
      schema: BlockResponseSchema,
      cacheStrategy: 'ttl',
      cacheTtl: this.cacheTtl,
    });
  }

  private fetchAddressAsset(address: string): Effect.Effect<AssetResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/address/asset`,
      method: 'POST',
      body: { address },
      schema: AssetResponseSchema,
      cacheStrategy: 'cache-first',
    });
  }

  private fetchTransactionList(params: TxHistoryParams): Effect.Effect<TxListResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/transactions/query`,
      method: 'POST',
      body: {
        address: params.address,
        page: params.page ?? 1,
        pageSize: params.limit ?? 50,
        sort: -1,
      },
      schema: TxListResponseSchema,
      cacheStrategy: 'cache-first',
    });
  }

  private fetchSingleTransaction(txHash: string): Effect.Effect<TxListResponse, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/transactions/query`,
      method: 'POST',
      body: { signature: txHash },
      schema: TxListResponseSchema,
    });
  }

  private fetchPendingTransactions(senderId: string): Effect.Effect<PendingTrResponse, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/pendingTr`,
      method: 'POST',
      body: { senderId, sort: -1 },
      schema: PendingTrResponseSchema,
    });
  }
}

export function createBiowalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'biowallet-v1') {
    return new BiowalletProviderEffect(entry, chainId);
  }
  return null;
}
