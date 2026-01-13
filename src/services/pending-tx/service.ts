/**
 * Pending Transaction Service - IndexedDB 存储实现
 * 
 * 管理未上链交易的完整生命周期
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { v4 as uuidv4 } from 'uuid'
import type {
  PendingTx,
  PendingTxStatus,
  CreatePendingTxInput,
  UpdatePendingTxStatusInput,
  IPendingTxService,
} from './types'
import { PendingTxSchema } from './schema'

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

/** Pending Transaction Service 实现 */
class PendingTxServiceImpl implements IPendingTxService {
  private db: IDBPDatabase<PendingTxDBSchema> | null = null
  private initialized = false

  /** 初始化数据库 */
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
    // 返回所有非 confirmed 状态的交易
    return all.filter((tx) => tx.status !== 'confirmed')
  }

  // ===== 生命周期管理 =====

  async create(input: CreatePendingTxInput): Promise<PendingTx> {
    const db = await this.ensureDb()
    const now = Date.now()
    
    const pendingTx: PendingTx = {
      id: uuidv4(),
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
