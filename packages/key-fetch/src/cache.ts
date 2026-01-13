/**
 * Cache Store Implementation
 * 
 * 内存缓存存储
 */

import type { CacheStore, CacheEntry } from './types'

export class MemoryCacheStore implements CacheStore {
  private store = new Map<string, CacheEntry>()

  get(key: string): CacheEntry | undefined {
    return this.store.get(key)
  }

  set(key: string, entry: CacheEntry): void {
    this.store.set(key, entry)
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  has(key: string): boolean {
    return this.store.has(key)
  }

  clear(): void {
    this.store.clear()
  }

  keys(): IterableIterator<string> {
    return this.store.keys()
  }
}

/** 全局缓存实例 */
export const globalCache = new MemoryCacheStore()
