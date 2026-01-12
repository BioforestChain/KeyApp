/**
 * Pending Transaction Service
 * 
 * 未上链交易管理 - IndexedDB 存储实现
 * 专注状态管理，不关心交易内容本身
 */

import { z } from 'zod'
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { defineServiceMeta } from '@/lib/service-meta'

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
  
  // ===== 时间戳 =====
  createdAt: z.number(),
  updatedAt: z.number(),
  
  // ===== 交易数据（不透明） =====
  /** 原始交易数据，用于广播和重试 */
  rawTx: z.unknown(),
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
  rawTx: z.unknown(),
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

class PendingTxServiceImpl implements IPendingTxService {
  private db: IDBPDatabase<PendingTxDBSchema> | null = null
  private initialized = false

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
      .toSorted((a, b) => b.createdAt - a.createdAt)
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
      .toSorted((a, b) => b.createdAt - a.createdAt)
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
    }

    await db.put(STORE_NAME, updated)
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
    return updated
  }

  // ===== 清理 =====

  async delete({ id }: { id: string }): Promise<void> {
    const db = await this.ensureDb()
    await db.delete(STORE_NAME, id)
  }

  async deleteConfirmed({ walletId }: { walletId: string }): Promise<void> {
    const confirmed = await this.getByStatus({ walletId, status: 'confirmed' })
    const db = await this.ensureDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    await Promise.all(confirmed.map((item) => tx.store.delete(item.id)))
    await tx.done
  }

  async deleteExpired({ walletId, maxAge }: { walletId: string; maxAge: number }): Promise<number> {
    const all = await this.getAll({ walletId })
    const now = Date.now()
    const expired = all.filter((tx) => {
      // 只清理已确认或失败超过 maxAge 的交易
      if (tx.status === 'confirmed' || tx.status === 'failed') {
        return now - tx.updatedAt > maxAge
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
