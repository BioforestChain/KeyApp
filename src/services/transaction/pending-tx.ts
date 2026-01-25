/**
 * Pending Transaction Service
 *
 * 未上链交易管理 - IndexedDB 存储实现
 * 专注状态管理，不关心交易内容本身
 */

import { z } from 'zod';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { Effect, Stream, Duration } from 'effect';
import { createPollingSource, txConfirmedEvent, HttpError, type FetchError, type DataSource } from '@biochain/chain-effect';
import { getChainProvider } from '@/services/chain-adapter/providers';
import { getWalletEventBus } from '@/services/chain-adapter/wallet-event-bus';
import { defineServiceMeta } from '@/lib/service-meta';
import { SignedTransactionSchema } from '@/services/chain-adapter/types';
import { chainConfigService } from '@/services/chain-config/service';
import type { ChainConfig, ChainKind } from '@/services/chain-config';
import { getForgeInterval } from '@/services/chain-adapter/bioforest/fetch';
import { isChainDebugEnabled } from '@/services/chain-adapter/debug';

// ==================== Schema ====================

function pendingTxDebugLog(...args: Array<string | number | boolean>): void {
  const message = `[chain-effect] pending-tx ${args.join(' ')}`;
  if (!isChainDebugEnabled(message)) return;
  console.log('[chain-effect]', 'pending-tx', ...args);
}

/** 未上链交易状态 */
export const PendingTxStatusSchema = z.enum([
  'created', // 交易已创建，待广播
  'broadcasting', // 广播中
  'broadcasted', // 广播成功，待上链
  'confirmed', // 已上链确认
  'failed', // 广播失败
]);

// TransactionType as zod schema for validation
const TransactionTypeSchema = z.enum([
  'send',
  'receive',
  'signature',
  'stake',
  'unstake',
  'destroy',
  'gift',
  'grab',
  'trust',
  'signFor',
  'emigrate',
  'immigrate',
  'exchange',
  'swap',
  'issueAsset',
  'increaseAsset',
  'mint',
  'issueEntity',
  'destroyEntity',
  'locationName',
  'dapp',
  'certificate',
  'mark',
  'approve',
  'interaction',
  'other',
]);

/** 用于 UI 展示的最小元数据（可选，由调用方提供） */
export const PendingTxMetaSchema = z
  .object({
    /** 交易类型标识，用于 UI 展示，必须是 TransactionType */
    type: TransactionTypeSchema.optional(),
    /** 展示用的金额 */
    displayAmount: z.string().optional(),
    /** 展示用的符号 */
    displaySymbol: z.string().optional(),
    /** 展示用的目标地址 */
    displayToAddress: z.string().optional(),
  })
  .passthrough(); // 允许扩展字段

/** 未上链交易记录 - 专注状态管理 */
export const PendingTxSchema = z.object({
  /** 唯一ID (使用 rawTx.signature，即区块链交易ID) */
  id: z.string(),
  /** 钱包ID */
  walletId: z.string(),
  /** 链ID */
  chainId: z.string(),
  /** 发送地址 */
  fromAddress: z.string(),

  // ===== 状态管理 =====
  /** 当前状态 */
  status: PendingTxStatusSchema,
  /** 交易哈希（等于 id，即 rawTx.signature） */
  txHash: z.string(),
  /** 失败时的错误码 */
  errorCode: z.string().optional(),
  /** 失败时的错误信息 */
  errorMessage: z.string().optional(),
  /** 重试次数 */
  retryCount: z.number().default(0),

  // ===== 确认信息 =====
  /** 确认时的区块高度 */
  confirmedBlockHeight: z.number().optional(),
  /** 确认时间戳 */
  confirmedAt: z.number().optional(),

  // ===== 时间戳 =====
  createdAt: z.number(),
  updatedAt: z.number(),

  // ===== 交易数据（ChainProvider 标准格式）=====
  /** 已签名交易数据，用于广播和重试 */
  rawTx: SignedTransactionSchema,
  /** UI 展示用的元数据（可选） */
  meta: PendingTxMetaSchema.optional(),
});

export type PendingTx = z.infer<typeof PendingTxSchema>;
export type PendingTxStatus = z.infer<typeof PendingTxStatusSchema>;
export type PendingTxMeta = z.infer<typeof PendingTxMetaSchema>;

export function getPendingTxWalletKey(chainId: string, address: string): string {
  return `${chainId}:${address.trim().toLowerCase()}`;
}

/** 创建 pending tx 的输入 */
export const CreatePendingTxInputSchema = z.object({
  walletId: z.string(),
  chainId: z.string(),
  fromAddress: z.string(),
  rawTx: SignedTransactionSchema,
  meta: PendingTxMetaSchema.optional(),
});

export type CreatePendingTxInput = z.infer<typeof CreatePendingTxInputSchema>;

/** 更新状态的输入 */
export const UpdatePendingTxStatusInputSchema = z.object({
  id: z.string(),
  status: PendingTxStatusSchema,
  txHash: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  confirmedBlockHeight: z.number().optional(),
  confirmedAt: z.number().optional(),
});

export type UpdatePendingTxStatusInput = z.infer<typeof UpdatePendingTxStatusInputSchema>;

// ==================== Service Meta ====================

export const pendingTxServiceMeta = defineServiceMeta('pendingTx', (s) =>
  s
    .description('未上链交易管理服务 - 专注状态管理，不关心交易内容') // i18n-ignore

    // ===== 查询 =====
    .api('getAll', z.object({ walletId: z.string() }), z.array(PendingTxSchema))
    .api('getById', z.object({ id: z.string() }), PendingTxSchema.nullable())
    .api(
      'getByStatus',
      z.object({
        walletId: z.string(),
        status: PendingTxStatusSchema,
      }),
      z.array(PendingTxSchema),
    )
    .api('getPending', z.object({ walletId: z.string() }), z.array(PendingTxSchema))

    // ===== 生命周期管理 =====
    .api('create', CreatePendingTxInputSchema, PendingTxSchema)
    .api('updateStatus', UpdatePendingTxStatusInputSchema, PendingTxSchema)
    .api('incrementRetry', z.object({ id: z.string() }), PendingTxSchema)

    // ===== 清理 =====
    .api('delete', z.object({ id: z.string() }), z.void())
    .api(
      'deleteByTxHash',
      z.object({
        walletId: z.string(),
        txHashes: z.array(z.string()),
      }),
      z.void(),
    )
    .api('deleteConfirmed', z.object({ walletId: z.string() }), z.void())
    .api('deleteAll', z.object({ walletId: z.string() }), z.void()),
);

export type IPendingTxService = typeof pendingTxServiceMeta.Type;

// ==================== 过期检查器接口 ====================

/**
 * 交易过期检查器接口
 * 不同链可以有不同的过期判定逻辑
 */
export interface ExpirationChecker {
  /**
   * 检查交易是否已过期
   * @param rawTx 原始交易数据
   * @param currentBlockHeight 当前区块高度
   * @returns 是否已过期
   */
  isExpired(rawTx: unknown, currentBlockHeight: number): boolean;
}

/**
 * BioChain 过期检查器
 * 基于 effectiveBlockHeight 判断交易是否过期
 */
export const bioChainExpirationChecker: ExpirationChecker = {
  isExpired(rawTx: unknown, currentBlockHeight: number): boolean {
    const tx = rawTx as { effectiveBlockHeight?: number };
    if (typeof tx?.effectiveBlockHeight === 'number') {
      return currentBlockHeight > tx.effectiveBlockHeight;
    }
    return false; // 无 effectiveBlockHeight 时不判定过期
  },
};

/**
 * 获取链对应的过期检查器
 * @param chainId 链ID
 * @returns 过期检查器，若无对应实现则返回 undefined
 */
export function getExpirationChecker(chainId: string): ExpirationChecker | undefined {
  // BioChain 系列链使用 bioChainExpirationChecker
  if (chainId.startsWith('bfmeta') || chainId.startsWith('bfm') || chainId === 'bioforest') {
    return bioChainExpirationChecker;
  }
  return undefined;
}

/**
 * 检查单个 pending tx 是否已过期
 * @param pendingTx pending 交易记录
 * @param currentBlockHeight 当前区块高度（用于 BioChain 等链）
 * @param maxAge 最大存活时间（毫秒），默认 24 小时
 * @returns 是否已过期
 */
export function isPendingTxExpired(
  pendingTx: PendingTx,
  currentBlockHeight?: number,
  maxAge: number = 24 * 60 * 60 * 1000,
): boolean {
  // 1. 基于时间的过期检查（适用于所有链）
  const now = Date.now();
  if (now - pendingTx.createdAt > maxAge) {
    return true;
  }

  // 2. 基于区块高度的过期检查（针对 BioChain 等支持的链）
  if (currentBlockHeight !== undefined) {
    const checker = getExpirationChecker(pendingTx.chainId);
    if (checker?.isExpired(pendingTx.rawTx, currentBlockHeight)) {
      return true;
    }
  }

  return false;
}

// ==================== IndexedDB 实现 ====================

const DB_NAME = 'bfm-pending-tx-db';
const DB_VERSION = 1;
const STORE_NAME = 'pendingTx';

interface PendingTxDBSchema extends DBSchema {
  pendingTx: {
    key: string;
    value: PendingTx;
    indexes: {
      'by-wallet': string;
      'by-status': string;
      'by-wallet-status': [string, string];
    };
  };
}

type PendingTxChangeCallback = (tx: PendingTx, event: 'created' | 'updated' | 'deleted') => void;

class PendingTxServiceImpl implements IPendingTxService {
  private db: IDBPDatabase<PendingTxDBSchema> | null = null;
  private initialized = false;
  private subscribers = new Set<PendingTxChangeCallback>();

  /**
   * 订阅 pending tx 变化
   * @param callback 变化回调，接收变化的 tx 和事件类型
   * @returns 取消订阅函数
   */
  subscribe(callback: PendingTxChangeCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * 通知所有订阅者
   */
  private notify(tx: PendingTx, event: 'created' | 'updated' | 'deleted') {
    this.subscribers.forEach((callback) => {
      try {
        callback(tx, event);
      } catch (error) {}
    });
  }

  private async ensureDb(): Promise<IDBPDatabase<PendingTxDBSchema>> {
    if (this.db && this.initialized) {
      return this.db;
    }

    this.db = await openDB<PendingTxDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-wallet', 'walletId');
          store.createIndex('by-status', 'status');
          store.createIndex('by-wallet-status', ['walletId', 'status']);
        }
      },
    });
    this.initialized = true;
    return this.db;
  }

  // ===== 查询 =====

  async getAll({ walletId }: { walletId: string }): Promise<PendingTx[]> {
    const db = await this.ensureDb();
    const records = await db.getAllFromIndex(STORE_NAME, 'by-wallet', walletId);
    const list = records
      .map((r) => PendingTxSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data)
      .sort((a, b) => b.createdAt - a.createdAt);
    pendingTxDebugLog('getAll', walletId, `len=${list.length}`);
    return list;
  }

  async getById({ id }: { id: string }): Promise<PendingTx | null> {
    const db = await this.ensureDb();
    const record = await db.get(STORE_NAME, id);
    if (!record) return null;
    const parsed = PendingTxSchema.safeParse(record);
    return parsed.success ? parsed.data : null;
  }

  async getByStatus({ walletId, status }: { walletId: string; status: PendingTxStatus }): Promise<PendingTx[]> {
    const db = await this.ensureDb();
    const records = await db.getAllFromIndex(STORE_NAME, 'by-wallet-status', [walletId, status]);
    const list = records
      .map((r) => PendingTxSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data)
      .sort((a, b) => b.createdAt - a.createdAt);
    pendingTxDebugLog('getByStatus', walletId, status, `len=${list.length}`);
    return list;
  }

  async getPending({ walletId }: { walletId: string }): Promise<PendingTx[]> {
    const all = await this.getAll({ walletId });
    const list = all.filter((tx) => tx.status !== 'confirmed');
    pendingTxDebugLog('getPending', walletId, `len=${list.length}`);
    return list;
  }

  // ===== 生命周期管理 =====

  async create(input: CreatePendingTxInput): Promise<PendingTx> {
    const db = await this.ensureDb();
    const now = Date.now();
    // 使用区块链签名作为 ID（即交易哈希）
    const txHash = input.rawTx.signature;

    const pendingTx: PendingTx = {
      id: txHash,
      walletId: input.walletId,
      chainId: input.chainId,
      fromAddress: input.fromAddress,
      status: 'created',
      txHash,
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
      rawTx: input.rawTx,
      meta: input.meta,
    };

    await db.put(STORE_NAME, pendingTx);
    pendingTxDebugLog('create', pendingTx.walletId, pendingTx.status, pendingTx.id);
    this.notify(pendingTx, 'created');
    return pendingTx;
  }

  async updateStatus(input: UpdatePendingTxStatusInput): Promise<PendingTx> {
    const db = await this.ensureDb();
    const existing = await db.get(STORE_NAME, input.id);

    if (!existing) {
      throw new Error(`PendingTx not found: ${input.id}`);
    }

    const updated: PendingTx = {
      ...existing,
      status: input.status,
      updatedAt: Date.now(),
      ...(input.txHash !== undefined && { txHash: input.txHash }),
      ...(input.errorCode !== undefined && { errorCode: input.errorCode }),
      ...(input.errorMessage !== undefined && { errorMessage: input.errorMessage }),
      ...(input.confirmedBlockHeight !== undefined && { confirmedBlockHeight: input.confirmedBlockHeight }),
      ...(input.confirmedAt !== undefined && { confirmedAt: input.confirmedAt }),
    };

    await db.put(STORE_NAME, updated);
    pendingTxDebugLog('updateStatus', updated.walletId, `${existing.status}->${updated.status}`, updated.id);
    this.notify(updated, 'updated');
    return updated;
  }

  async incrementRetry({ id }: { id: string }): Promise<PendingTx> {
    const db = await this.ensureDb();
    const existing = await db.get(STORE_NAME, id);

    if (!existing) {
      throw new Error(`PendingTx not found: ${id}`);
    }

    const updated: PendingTx = {
      ...existing,
      retryCount: (existing.retryCount ?? 0) + 1,
      updatedAt: Date.now(),
    };

    await db.put(STORE_NAME, updated);
    this.notify(updated, 'updated');
    return updated;
  }

  // ===== 清理 =====

  async delete({ id }: { id: string }): Promise<void> {
    const db = await this.ensureDb();
    const existing = await db.get(STORE_NAME, id);
    await db.delete(STORE_NAME, id);
    if (existing) {
      pendingTxDebugLog('delete', existing.walletId, existing.status, existing.id);
      this.notify(existing, 'deleted');
    }
  }

  async deleteConfirmed({ walletId }: { walletId: string }): Promise<void> {
    const confirmed = await this.getByStatus({ walletId, status: 'confirmed' });
    const db = await this.ensureDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all(confirmed.map((item) => tx.store.delete(item.id)));
    await tx.done;
  }

  async deleteByTxHash({ walletId, txHashes }: { walletId: string; txHashes: string[] }): Promise<void> {
    if (txHashes.length === 0) return;
    const normalized = new Set(txHashes.map((hash) => hash.trim().toLowerCase()).filter(Boolean));
    if (normalized.size === 0) return;

    const all = await this.getAll({ walletId });
    const matched = all.filter((item) => {
      if (!item.txHash) return false;
      return normalized.has(item.txHash.toLowerCase());
    });

    if (matched.length === 0) return;

    const db = await this.ensureDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all(matched.map((item) => tx.store.delete(item.id)));
    await tx.done;

    for (const item of matched) {
      pendingTxDebugLog('delete', item.walletId, item.status, item.id);
      this.notify(item, 'deleted');
    }
  }

  async deleteExpired({
    walletId,
    maxAge,
    currentBlockHeight,
  }: {
    walletId: string;
    maxAge: number;
    currentBlockHeight?: number;
  }): Promise<number> {
    const all = await this.getAll({ walletId });
    const now = Date.now();
    const expired = all.filter((pendingTx) => {
      // 1. 已确认或失败超过 maxAge 的交易
      if (pendingTx.status === 'confirmed' || pendingTx.status === 'failed') {
        return now - pendingTx.updatedAt > maxAge;
      }

      // 2. 基于区块高度的过期检查（针对 BioChain 等支持的链）
      if (currentBlockHeight !== undefined) {
        const checker = getExpirationChecker(pendingTx.chainId);
        if (checker?.isExpired(pendingTx.rawTx, currentBlockHeight)) {
          return true;
        }
      }

      return false;
    });

    if (expired.length === 0) return 0;

    const db = await this.ensureDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all(expired.map((item) => tx.store.delete(item.id)));
    await tx.done;

    return expired.length;
  }

  async deleteAll({ walletId }: { walletId: string }): Promise<void> {
    const all = await this.getAll({ walletId });
    const db = await this.ensureDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all(all.map((item) => tx.store.delete(item.id)));
    await tx.done;
  }

  async normalizeWalletKeyByAddress({
    chainId,
    address,
    walletId,
  }: {
    chainId: string;
    address: string;
    walletId: string;
  }): Promise<number> {
    const db = await this.ensureDb();
    const normalizedAddress = address.trim().toLowerCase();
    const records = await db.getAll(STORE_NAME);
    let updatedCount = 0;

    for (const record of records) {
      if (record.chainId !== chainId) continue;
      if (record.fromAddress?.toLowerCase() !== normalizedAddress) continue;
      if (record.walletId === walletId) continue;

      const updated: PendingTx = {
        ...(record as PendingTx),
        walletId,
        updatedAt: Date.now(),
      };
      await db.put(STORE_NAME, updated);
      this.notify(updated, 'updated');
      updatedCount += 1;
    }

    return updatedCount;
  }
}

/** 单例服务实例 */
export const pendingTxService = new PendingTxServiceImpl();

// ==================== Effect Data Source Factory ====================

// 缓存已创建的 Effect 数据源实例
type PendingTxSourceEntry = {
  source: DataSource<PendingTx[]>;
  refCount: number;
  walletIds: Set<string>;
};

const pendingTxSources = new Map<string, PendingTxSourceEntry>();
const pendingTxCreations = new Map<string, Promise<DataSource<PendingTx[]>>>();
const pendingTxCreationWalletIds = new Map<string, Set<string>>();
const MIN_PENDING_TX_POLL_MS = 15_000;

type ChainConfigWithBlockTime = ChainConfig & {
  // 约定：blockTime/blockTimeSeconds 为秒，blockTimeMs 为毫秒
  blockTime?: number;
  blockTimeSeconds?: number;
  blockTimeMs?: number;
};

function getDefaultBlockTimeMs(chainKind: ChainKind): number {
  switch (chainKind) {
    case 'evm':
      return 12_000;
    case 'tron':
      return 3_000;
    case 'bitcoin':
      return 600_000;
    case 'bioforest':
      return MIN_PENDING_TX_POLL_MS;
    default:
      return MIN_PENDING_TX_POLL_MS;
  }
}

function resolveGenesisBlockTimeMs(chainId: string): number {
  const config = chainConfigService.getConfig(chainId);
  if (!config) return MIN_PENDING_TX_POLL_MS;

  if (config.chainKind === 'bioforest') {
    return getForgeInterval(chainId);
  }

  const configWithBlockTime = config as ChainConfigWithBlockTime;
  if (typeof configWithBlockTime.blockTimeMs === 'number' && configWithBlockTime.blockTimeMs > 0) {
    return configWithBlockTime.blockTimeMs;
  }
  if (typeof configWithBlockTime.blockTimeSeconds === 'number' && configWithBlockTime.blockTimeSeconds > 0) {
    return configWithBlockTime.blockTimeSeconds * 1000;
  }
  if (typeof configWithBlockTime.blockTime === 'number' && configWithBlockTime.blockTime > 0) {
    return configWithBlockTime.blockTime * 1000;
  }

  return getDefaultBlockTimeMs(config.chainKind);
}

function getPendingTxPollInterval(chainId: string): Duration.Duration {
  const chainKind = chainConfigService.getConfig(chainId)?.chainKind;
  const genesisMs = Math.max(1, resolveGenesisBlockTimeMs(chainId));

  if (chainKind === 'bioforest') {
    // BioChain: pending 轮询频率为创世块时间的 1/2
    return Duration.millis(Math.max(1, Math.floor(genesisMs / 2)));
  }

  // 其它链：>=15s 且为创世块时间的整数倍
  const multiple = Math.max(1, Math.ceil(MIN_PENDING_TX_POLL_MS / genesisMs));
  return Duration.millis(genesisMs * multiple);
}

/**
 * 获取 pending tx 的 Effect 数据源
 * 独立轮询 + 确认事件触发 txHistory 刷新
 */
export function getPendingTxSource(
  chainId: string,
  walletId: string,
  legacyWalletId?: string
): Effect.Effect<DataSource<PendingTx[]>> | null {
  const key = `${chainId}:${walletId}`;
  const normalizedLegacy =
    legacyWalletId && legacyWalletId !== walletId ? legacyWalletId : undefined;

  const mergePendingLists = (lists: PendingTx[][]): PendingTx[] => {
    const map = new Map<string, PendingTx>();
    for (const list of lists) {
      for (const tx of list) {
        map.set(tx.id, tx);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  };

  const wrapSharedSource = (source: DataSource<PendingTx[]>): DataSource<PendingTx[]> => ({
    ...source,
    stop: releasePendingTxSource(key),
  });

  const cached = pendingTxSources.get(key);
  if (cached) {
    if (normalizedLegacy) {
      cached.walletIds.add(normalizedLegacy);
    }
    cached.refCount += 1;
    return Effect.succeed(wrapSharedSource(cached.source));
  }

  const pending = pendingTxCreations.get(key);
  if (pending) {
    const walletIds = pendingTxCreationWalletIds.get(key);
    if (walletIds && normalizedLegacy) {
      walletIds.add(normalizedLegacy);
    }
    return Effect.promise(async () => {
      const source = await pending;
      const entry = pendingTxSources.get(key);
      if (entry) {
        if (normalizedLegacy) {
          entry.walletIds.add(normalizedLegacy);
        }
        entry.refCount += 1;
      }
      return wrapSharedSource(source);
    });
  }

  const chainProvider = getChainProvider(chainId);

  // 使用独立轮询（频率不同于出块）
  const interval = getPendingTxPollInterval(chainId);
  const walletIds = new Set<string>([walletId]);
  if (normalizedLegacy) {
    walletIds.add(normalizedLegacy);
  }
  pendingTxCreationWalletIds.set(key, walletIds);

  const fetchEffect: Effect.Effect<PendingTx[], FetchError> = Effect.tryPromise({
    try: async () => {
      // pending 确认后需触发 txHistory 刷新（不依赖区块高度变化）
      const eventBus = await Effect.runPromise(getWalletEventBus());
      // 检查 pending 交易状态，更新/移除已上链的
      const walletIdList = Array.from(walletIds);
      const pendingLists = await Promise.all(
        walletIdList.map((id) => pendingTxService.getPending({ walletId: id }))
      );
      const pending = mergePendingLists(pendingLists);
      pendingTxDebugLog('poll', `walletIds=${walletIdList.join(',')}`, `len=${pending.length}`);
      const deletedIds = new Set<string>();

      for (const tx of pending) {
        if (tx.status === 'broadcasted' && tx.txHash) {
          try {
            // 检查是否已上链
            const txInfo = await chainProvider.transaction.fetch({
              txHash: tx.txHash,
              senderId: tx.fromAddress,
            });
            if (txInfo?.status === 'confirmed') {
              await Effect.runPromise(
                eventBus.emit(txConfirmedEvent(chainId, tx.fromAddress, tx.txHash)),
              );
              // 直接删除已确认的交易
              await pendingTxService.delete({ id: tx.id });
              deletedIds.add(tx.id);
            }
          } catch {
            // 查询失败，跳过
          }
        }
      }

      // 返回最新的 pending 列表
      if (deletedIds.size === 0) {
        return pending;
      }
      pendingTxDebugLog('poll', 'confirmed-removed', `count=${deletedIds.size}`);
      return pending.filter((tx) => !deletedIds.has(tx.id));
    },
    catch: (error) =>
      new HttpError(
        error instanceof Error ? error.message : 'Pending transaction fetch failed'
      ),
  });

  const createPromise = Effect.runPromise(
    createPollingSource({
      name: `pendingTx.${chainId}.${walletId}`,
      interval,
      fetch: fetchEffect,
    })
  );
  pendingTxCreations.set(key, createPromise);

  return Effect.promise(async () => {
    try {
      const source = await createPromise;
      pendingTxSources.set(key, { source, refCount: 1, walletIds });
      return wrapSharedSource(source);
    } finally {
      pendingTxCreations.delete(key);
      pendingTxCreationWalletIds.delete(key);
    }
  });
}

/**
 * 订阅 pending tx 变化流
 */
export function subscribePendingTxChanges(
  chainId: string,
  walletId: string,
  legacyWalletId?: string
): Stream.Stream<PendingTx[]> | null {
  const sourceEffect = getPendingTxSource(chainId, walletId, legacyWalletId);
  if (!sourceEffect) return null;

  return Stream.fromEffect(sourceEffect).pipe(
    Stream.flatMap((source) => source.changes)
  );
}

/**
 * 清理 pending tx 数据源缓存
 */
export function clearPendingTxSources(): Effect.Effect<void> {
  return Effect.gen(function* () {
    for (const entry of pendingTxSources.values()) {
      yield* entry.source.stop;
    }
    pendingTxSources.clear();
    pendingTxCreations.clear();
    pendingTxCreationWalletIds.clear();
  });
}

function releasePendingTxSource(key: string): Effect.Effect<void> {
  return Effect.gen(function* () {
    const entry = pendingTxSources.get(key);
    if (!entry) return;

    entry.refCount -= 1;
    if (entry.refCount <= 0) {
      yield* entry.source.stop;
      pendingTxSources.delete(key);
    }
  });
}
