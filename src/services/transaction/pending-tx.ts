/**
 * Pending Transaction Service
 * 
 * 未上链交易管理 - IndexedDB 存储实现
 * 专注状态管理，不关心交易内容本身
 */

import { z } from 'zod'
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { defineServiceMeta } from '@/lib/service-meta'
import { SignedTransactionSchema } from '@/services/chain-adapter/types'

// ==================== Schema ====================

/** 未上链交易状态 */
export const PendingTxStatusSchema = z.enum([
  'created',      // 交易已创建，待广播
  'broadcasting', // 广播中
  'broadcasted',  // 广播成功，待上链
  'confirmed',    // 已上链确认
  'failed',       // 广播失败
])

/** 用于 UI 展示的最小元数据（可选，由调用方提供） */
export const PendingTxMetaSchema = z.object({
  /** 交易类型标识，用于 UI 展示 */
  type: z.string().optional(),
  /** 展示用的金额 */
  displayAmount: z.string().optional(),
  /** 展示用的符号 */
  displaySymbol: z.string().optional(),
  /** 展示用的目标地址 */
  displayToAddress: z.string().optional(),
}).passthrough()  // 允许扩展字段

/** 未上链交易记录 - 专注状态管理 */
export const PendingTxSchema = z.object({
  /** 唯一ID (uuid) */
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
  /** 交易哈希（广播成功后有值） */
  txHash: z.string().optional(),
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
})

export type PendingTx = z.infer<typeof PendingTxSchema>
export type PendingTxStatus = z.infer<typeof PendingTxStatusSchema>
export type PendingTxMeta = z.infer<typeof PendingTxMetaSchema>

/** 创建 pending tx 的输入 */
export const CreatePendingTxInputSchema = z.object({
  walletId: z.string(),
  chainId: z.string(),
  fromAddress: z.string(),
  rawTx: SignedTransactionSchema,
  meta: PendingTxMetaSchema.optional(),
})

export type CreatePendingTxInput = z.infer<typeof CreatePendingTxInputSchema>

/** 更新状态的输入 */
export const UpdatePendingTxStatusInputSchema = z.object({
  id: z.string(),
  status: PendingTxStatusSchema,
  txHash: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  confirmedBlockHeight: z.number().optional(),
  confirmedAt: z.number().optional(),
})

export type UpdatePendingTxStatusInput = z.infer<typeof UpdatePendingTxStatusInputSchema>

// ==================== Service Meta ====================

export const pendingTxServiceMeta = defineServiceMeta('pendingTx', (s) =>
  s.description('未上链交易管理服务 - 专注状态管理，不关心交易内容')

    // ===== 查询 =====
    .api('getAll', z.object({ walletId: z.string() }), z.array(PendingTxSchema))
    .api('getById', z.object({ id: z.string() }), PendingTxSchema.nullable())
    .api('getByStatus', z.object({
      walletId: z.string(),
      status: PendingTxStatusSchema,
    }), z.array(PendingTxSchema))
    .api('getPending', z.object({ walletId: z.string() }), z.array(PendingTxSchema))

    // ===== 生命周期管理 =====
    .api('create', CreatePendingTxInputSchema, PendingTxSchema)
    .api('updateStatus', UpdatePendingTxStatusInputSchema, PendingTxSchema)
    .api('incrementRetry', z.object({ id: z.string() }), PendingTxSchema)

    // ===== 清理 =====
    .api('delete', z.object({ id: z.string() }), z.void())
    .api('deleteConfirmed', z.object({ walletId: z.string() }), z.void())
    .api('deleteAll', z.object({ walletId: z.string() }), z.void())
)

export type IPendingTxService = typeof pendingTxServiceMeta.Type

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
  isExpired(rawTx: unknown, currentBlockHeight: number): boolean
}

/**
 * BioChain 过期检查器
 * 基于 effectiveBlockHeight 判断交易是否过期
 */
export const bioChainExpirationChecker: ExpirationChecker = {
  isExpired(rawTx: unknown, currentBlockHeight: number): boolean {
    const tx = rawTx as { effectiveBlockHeight?: number }
    if (typeof tx?.effectiveBlockHeight === 'number') {
      return currentBlockHeight > tx.effectiveBlockHeight
    }
    return false // 无 effectiveBlockHeight 时不判定过期
  }
}

/**
 * 获取链对应的过期检查器
 * @param chainId 链ID
 * @returns 过期检查器，若无对应实现则返回 undefined
 */
export function getExpirationChecker(chainId: string): ExpirationChecker | undefined {
  // BioChain 系列链使用 bioChainExpirationChecker
  if (chainId.startsWith('bfmeta') || chainId.startsWith('bfm') || chainId === 'bioforest') {
    return bioChainExpirationChecker
  }
  return undefined
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
  maxAge: number = 24 * 60 * 60 * 1000
): boolean {
  // 1. 基于时间的过期检查（适用于所有链）
  const now = Date.now()
  if (now - pendingTx.createdAt > maxAge) {
    return true
  }

  // 2. 基于区块高度的过期检查（针对 BioChain 等支持的链）
  if (currentBlockHeight !== undefined) {
    const checker = getExpirationChecker(pendingTx.chainId)
    if (checker?.isExpired(pendingTx.rawTx, currentBlockHeight)) {
      return true
    }
  }

  return false
}

// ==================== IndexedDB 实现 ====================

const DB_NAME = 'bfm-pending-tx-db'
const DB_VERSION = 1
const STORE_NAME = 'pendingTx'

interface PendingTxDBSchema extends DBSchema {
  pendingTx: {
    key: string
    value: PendingTx
    indexes: {
      'by-wallet': string
      'by-status': string
      'by-wallet-status': [string, string]
    }
  }
}

type PendingTxChangeCallback = (tx: PendingTx, event: 'created' | 'updated' | 'deleted') => void

class PendingTxServiceImpl implements IPendingTxService {
  private db: IDBPDatabase<PendingTxDBSchema> | null = null
  private initialized = false
  private subscribers = new Set<PendingTxChangeCallback>()

  /**
   * 订阅 pending tx 变化
   * @param callback 变化回调，接收变化的 tx 和事件类型
   * @returns 取消订阅函数
   */
  subscribe(callback: PendingTxChangeCallback): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * 通知所有订阅者
   */
  private notify(tx: PendingTx, event: 'created' | 'updated' | 'deleted') {
    this.subscribers.forEach((callback) => {
      try {
        callback(tx, event)
      } catch (error) {

      }
    })
  }

  private async ensureDb(): Promise<IDBPDatabase<PendingTxDBSchema>> {
    if (this.db && this.initialized) {
      return this.db
    }

    this.db = await openDB<PendingTxDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('by-wallet', 'walletId')
          store.createIndex('by-status', 'status')
          store.createIndex('by-wallet-status', ['walletId', 'status'])
        }
      },
    })
    this.initialized = true
    return this.db
  }

  // ===== 查询 =====

  async getAll({ walletId }: { walletId: string }): Promise<PendingTx[]> {
    const db = await this.ensureDb()
    const records = await db.getAllFromIndex(STORE_NAME, 'by-wallet', walletId)
    return records
      .map((r) => PendingTxSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  async getById({ id }: { id: string }): Promise<PendingTx | null> {
    const db = await this.ensureDb()
    const record = await db.get(STORE_NAME, id)
    if (!record) return null
    const parsed = PendingTxSchema.safeParse(record)
    return parsed.success ? parsed.data : null
  }

  async getByStatus({ walletId, status }: { walletId: string; status: PendingTxStatus }): Promise<PendingTx[]> {
    const db = await this.ensureDb()
    const records = await db.getAllFromIndex(STORE_NAME, 'by-wallet-status', [walletId, status])
    return records
      .map((r) => PendingTxSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  async getPending({ walletId }: { walletId: string }): Promise<PendingTx[]> {
    const all = await this.getAll({ walletId })
    return all.filter((tx) => tx.status !== 'confirmed')
  }

  // ===== 生命周期管理 =====

  async create(input: CreatePendingTxInput): Promise<PendingTx> {
    const db = await this.ensureDb()
    const now = Date.now()

    const pendingTx: PendingTx = {
      id: crypto.randomUUID(),
      walletId: input.walletId,
      chainId: input.chainId,
      fromAddress: input.fromAddress,
      status: 'created',
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
      rawTx: input.rawTx,
      meta: input.meta,
    }

    await db.put(STORE_NAME, pendingTx)
    this.notify(pendingTx, 'created')
    return pendingTx
  }

  async updateStatus(input: UpdatePendingTxStatusInput): Promise<PendingTx> {
    const db = await this.ensureDb()
    const existing = await db.get(STORE_NAME, input.id)

    if (!existing) {
      throw new Error(`PendingTx not found: ${input.id}`)
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
    }

    await db.put(STORE_NAME, updated)
    this.notify(updated, 'updated')
    return updated
  }

  async incrementRetry({ id }: { id: string }): Promise<PendingTx> {
    const db = await this.ensureDb()
    const existing = await db.get(STORE_NAME, id)

    if (!existing) {
      throw new Error(`PendingTx not found: ${id}`)
    }

    const updated: PendingTx = {
      ...existing,
      retryCount: (existing.retryCount ?? 0) + 1,
      updatedAt: Date.now(),
    }

    await db.put(STORE_NAME, updated)
    this.notify(updated, 'updated')
    return updated
  }

  // ===== 清理 =====

  async delete({ id }: { id: string }): Promise<void> {
    const db = await this.ensureDb()
    const existing = await db.get(STORE_NAME, id)
    await db.delete(STORE_NAME, id)
    if (existing) {
      this.notify(existing, 'deleted')
    }
  }

  async deleteConfirmed({ walletId }: { walletId: string }): Promise<void> {
    const confirmed = await this.getByStatus({ walletId, status: 'confirmed' })
    const db = await this.ensureDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await Promise.all(confirmed.map((item) => tx.store.delete(item.id)))
    await tx.done
  }

  async deleteExpired({ walletId, maxAge, currentBlockHeight }: {
    walletId: string
    maxAge: number
    currentBlockHeight?: number
  }): Promise<number> {
    const all = await this.getAll({ walletId })
    const now = Date.now()
    const expired = all.filter((pendingTx) => {
      // 1. 已确认或失败超过 maxAge 的交易
      if (pendingTx.status === 'confirmed' || pendingTx.status === 'failed') {
        return now - pendingTx.updatedAt > maxAge
      }

      // 2. 基于区块高度的过期检查（针对 BioChain 等支持的链）
      if (currentBlockHeight !== undefined) {
        const checker = getExpirationChecker(pendingTx.chainId)
        if (checker?.isExpired(pendingTx.rawTx, currentBlockHeight)) {
          return true
        }
      }

      return false
    })

    if (expired.length === 0) return 0

    const db = await this.ensureDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await Promise.all(expired.map((item) => tx.store.delete(item.id)))
    await tx.done

    return expired.length
  }

  async deleteAll({ walletId }: { walletId: string }): Promise<void> {
    const all = await this.getAll({ walletId })
    const db = await this.ensureDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await Promise.all(all.map((item) => tx.store.delete(item.id)))
    await tx.done
  }
}

/** 单例服务实例 */
export const pendingTxService = new PendingTxServiceImpl()

// ==================== Key-Fetch Instance Factory ====================

import { derive, transform } from '@biochain/key-fetch'
import { getChainProvider } from '@/services/chain-adapter/providers'

// 缓存已创建的 fetcher 实例
const pendingTxFetchers = new Map<string, ReturnType<typeof derive>>()

/**
 * 获取 pending tx 的 key-fetch 实例
 * 依赖 blockHeight 自动刷新
 */
export function getPendingTxFetcher(chainId: string, walletId: string) {
  const key = `${chainId}:${walletId}`

  if (!pendingTxFetchers.has(key)) {
    const chainProvider = getChainProvider(chainId)

    if (!chainProvider?.supports('blockHeight')) {
      return null
    }

    const fetcher = derive({
      name: `pendingTx.${chainId}.${walletId}`,
      source: chainProvider.blockHeight,
      schema: z.array(PendingTxSchema),
      use: [
        transform({
          transform: async () => {
            // 检查 pending 交易状态，更新/移除已上链的
            const pending = await pendingTxService.getPending({ walletId })

            for (const tx of pending) {
              if (tx.status === 'broadcasted' && tx.txHash) {
                try {
                  // 检查是否已上链
                  const txInfo = await chainProvider.transaction.fetch({ txHash: tx.txHash })
                  if (txInfo?.status === 'confirmed') {
                    await pendingTxService.updateStatus({
                      id: tx.id,
                      status: 'confirmed',
                    })
                  }
                } catch (e) {
                  console.error('检查pending交易状态失败', e)
                  // 查询失败，跳过
                }
              }
            }

            // 返回最新的 pending 列表
            return await pendingTxService.getPending({ walletId })
          },
        }),
      ],
    })

    pendingTxFetchers.set(key, fetcher)
  }

  return pendingTxFetchers.get(key)!
}
