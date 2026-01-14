/**
 * Cache Plugin - 可配置的缓存插件
 * 
 * 使用中间件模式：拦截请求，返回缓存或继续请求
 * 
 * 支持不同的存储后端：
 * - memory: 内存缓存（默认）
 * - indexedDB: IndexedDB 持久化存储
 * - custom: 自定义存储实现
 */

import type { FetchPlugin, SubscribeContext as _SubscribeContext } from '../types'

// ==================== 存储后端接口 ====================

export interface CacheStorageEntry<T = unknown> {
    data: T
    createdAt: number
    expiresAt: number
    tags?: string[]
}

export interface CacheStorage {
    get<T>(key: string): Promise<CacheStorageEntry<T> | undefined>
    set<T>(key: string, entry: CacheStorageEntry<T>): Promise<void>
    delete(key: string): Promise<void>
    clear(): Promise<void>
    keys(): Promise<string[]>
}

// ==================== 内存存储实现 ====================

export class MemoryCacheStorage implements CacheStorage {
    private cache = new Map<string, CacheStorageEntry<unknown>>()

    async get<T>(key: string): Promise<CacheStorageEntry<T> | undefined> {
        const entry = this.cache.get(key) as CacheStorageEntry<T> | undefined
        if (entry && Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            return undefined
        }
        return entry
    }

    async set<T>(key: string, entry: CacheStorageEntry<T>): Promise<void> {
        this.cache.set(key, entry)
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key)
    }

    async clear(): Promise<void> {
        this.cache.clear()
    }

    async keys(): Promise<string[]> {
        return Array.from(this.cache.keys())
    }
}

// ==================== IndexedDB 存储实现 ====================

export class IndexedDBCacheStorage implements CacheStorage {
    private dbName: string
    private storeName: string
    private dbPromise: Promise<IDBDatabase> | null = null

    constructor(dbName = 'key-fetch-cache', storeName = 'cache') {
        this.dbName = dbName
        this.storeName = storeName
    }

    private async getDB(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)

            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName)
                }
            }
        })

        return this.dbPromise
    }

    async get<T>(key: string): Promise<CacheStorageEntry<T> | undefined> {
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly')
            const store = tx.objectStore(this.storeName)
            const request = store.get(key)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                const entry = request.result as CacheStorageEntry<T> | undefined
                if (entry && Date.now() > entry.expiresAt) {
                    resolve(undefined)
                } else {
                    resolve(entry)
                }
            }
        })
    }

    async set<T>(key: string, entry: CacheStorageEntry<T>): Promise<void> {
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite')
            const store = tx.objectStore(this.storeName)
            const request = store.put(entry, key)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }

    async delete(key: string): Promise<void> {
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite')
            const store = tx.objectStore(this.storeName)
            const request = store.delete(key)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }

    async clear(): Promise<void> {
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite')
            const store = tx.objectStore(this.storeName)
            const request = store.clear()

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }

    async keys(): Promise<string[]> {
        const db = await this.getDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly')
            const store = tx.objectStore(this.storeName)
            const request = store.getAllKeys()

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result as string[])
        })
    }
}

// ==================== 缓存插件工厂 ====================

export interface CachePluginOptions {
    /** 存储后端，默认使用内存 */
    storage?: CacheStorage
    /** 默认 TTL（毫秒） */
    ttlMs?: number
    /** 缓存标签 */
    tags?: string[]
}

// 默认内存存储实例
const defaultStorage = new MemoryCacheStorage()

/**
 * 创建缓存插件（中间件模式）
 * 
 * @example
 * ```ts
 * // 使用内存缓存
 * const memoryCache = cache({ ttlMs: 60_000 })
 * 
 * // 使用 IndexedDB 持久化
 * const persistedCache = cache({
 *   storage: new IndexedDBCacheStorage('my-app-cache'),
 *   ttlMs: 24 * 60 * 60 * 1000, // 1 day
 * })
 * 
 * // 使用
 * const myFetch = keyFetch.create({
 *   name: 'api.data',
 *   schema: MySchema,
 *   url: '/api/data',
 *   use: [persistedCache],
 * })
 * ```
 */
export function cache(options: CachePluginOptions = {}): FetchPlugin {
    const storage = options.storage ?? defaultStorage
    const defaultTtlMs = options.ttlMs ?? 60_000
    const tags = options.tags ?? []

    return {
        name: 'cache',

        async onFetch(request, next, context) {
            // 生成缓存 key
            const cacheKey = `${context.name}:${request.url}`

            // 检查缓存
            const cached = await storage.get<Response>(cacheKey)
            if (cached) {
                // 缓存命中，构造缓存的 Response
                return new Response(JSON.stringify(cached.data), {
                    status: 200,
                    headers: { 'X-Cache': 'HIT' },
                })
            }

            // 缓存未命中，继续请求
            const response = await next(request)

            // 如果请求成功，存储到缓存
            if (response.ok) {
                // 需要克隆 response 因为 body 只能读取一次
                const clonedResponse = response.clone()
                const data = await clonedResponse.json()

                const entry: CacheStorageEntry<unknown> = {
                    data,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + defaultTtlMs,
                    tags,
                }

                // 异步存储，不阻塞返回
                void storage.set(cacheKey, entry)
            }

            return response
        },
    }
}
