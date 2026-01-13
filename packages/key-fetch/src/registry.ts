/**
 * Key-Fetch Registry
 * 
 * 全局注册表，管理所有 KeyFetch 实例和依赖关系
 */

import type { KeyFetchRegistry, KeyFetchInstance, AnyZodSchema, CacheStore, CacheEntry } from './types'

/** 内存缓存实现 */
class MemoryCacheStore implements CacheStore {
  private store = new Map<string, CacheEntry>()

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.store.get(key) as CacheEntry<T> | undefined
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    this.store.set(key, entry as CacheEntry)
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

/** Registry 实现 */
class KeyFetchRegistryImpl implements KeyFetchRegistry {
  private instances = new Map<string, KeyFetchInstance<AnyZodSchema>>()
  private updateListeners = new Map<string, Set<() => void>>()
  private dependencies = new Map<string, Set<string>>() // dependent -> dependencies
  private dependents = new Map<string, Set<string>>() // dependency -> dependents

  register<S extends AnyZodSchema>(kf: KeyFetchInstance<S>): void {
    this.instances.set(kf.name, kf as KeyFetchInstance<AnyZodSchema>)
  }

  get<S extends AnyZodSchema>(name: string): KeyFetchInstance<S> | undefined {
    return this.instances.get(name) as KeyFetchInstance<S> | undefined
  }

  invalidate(name: string): void {
    const kf = this.instances.get(name)
    if (kf) {
      kf.invalidate()
    }
  }

  onUpdate(name: string, callback: () => void): () => void {
    let listeners = this.updateListeners.get(name)
    if (!listeners) {
      listeners = new Set()
      this.updateListeners.set(name, listeners)
    }
    listeners.add(callback)
    
    return () => {
      listeners?.delete(callback)
    }
  }

  emitUpdate(name: string): void {
    // 通知自身的监听者
    const listeners = this.updateListeners.get(name)
    if (listeners) {
      listeners.forEach(cb => cb())
    }

    // 通知依赖此实例的其他实例
    const dependentNames = this.dependents.get(name)
    if (dependentNames) {
      dependentNames.forEach(depName => {
        this.emitUpdate(depName)
      })
    }
  }

  addDependency(dependent: string, dependency: string): void {
    // dependent 依赖 dependency
    let deps = this.dependencies.get(dependent)
    if (!deps) {
      deps = new Set()
      this.dependencies.set(dependent, deps)
    }
    deps.add(dependency)

    // dependency 被 dependent 依赖
    let dependentSet = this.dependents.get(dependency)
    if (!dependentSet) {
      dependentSet = new Set()
      this.dependents.set(dependency, dependentSet)
    }
    dependentSet.add(dependent)
  }

  clear(): void {
    this.instances.clear()
    this.updateListeners.clear()
    this.dependencies.clear()
    this.dependents.clear()
  }
}

/** 全局 Registry 单例 */
export const globalRegistry = new KeyFetchRegistryImpl()
