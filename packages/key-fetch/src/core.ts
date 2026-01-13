/**
 * Key-Fetch Core
 * 
 * 核心实现：请求、订阅、失效
 */

import type { 
  CacheRule, 
  KeyFetchOptions, 
  SubscribeCallback,
  RequestContext,
  ResponseContext,
  SubscribeContext,
  CacheStore,
} from './types'
import { globalCache } from './cache'
import { RuleRegistryImpl } from './registry'

/** 进行中的请求（用于去重） */
const inFlight = new Map<string, Promise<unknown>>()

/** 活跃的订阅清理函数 */
const activeSubscriptions = new Map<string, Map<() => void, () => void>>()

class KeyFetchCore {
  private registry: RuleRegistryImpl
  private cache: CacheStore

  constructor() {
    this.cache = globalCache
    this.registry = new RuleRegistryImpl(this.cache)
  }

  /** 定义缓存规则 */
  define(rule: CacheRule): void {
    this.registry.define(rule)
  }

  /** 执行请求 */
  async fetch<T>(url: string, options?: KeyFetchOptions): Promise<T> {
    const rule = this.registry.findRule(url)
    const init = options?.init

    // 如果有匹配规则，执行插件链
    if (rule && !options?.skipCache) {
      const requestCtx: RequestContext = {
        url,
        init,
        cache: this.cache,
        ruleName: rule.name,
      }

      // 按顺序执行 onRequest，第一个返回数据的插件生效
      for (const plugin of rule.plugins) {
        if (plugin.onRequest) {
          const cached = await plugin.onRequest(requestCtx)
          if (cached !== undefined) {
            return cached as T
          }
        }
      }
    }

    // 检查是否有进行中的相同请求
    const cacheKey = this.buildCacheKey(url, init)
    const pending = inFlight.get(cacheKey)
    if (pending) {
      return (await pending) as T
    }

    // 发起请求
    const task = this.doFetch(url, init, rule?.name)
    inFlight.set(cacheKey, task)

    try {
      const data = await task
      return data as T
    } finally {
      inFlight.delete(cacheKey)
    }
  }

  /** 实际执行 fetch */
  private async doFetch(url: string, init?: RequestInit, ruleName?: string): Promise<unknown> {
    const response = await fetch(url, init)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // 如果有匹配规则，执行 onResponse
    if (ruleName) {
      const rule = this.registry.getRule(ruleName)
      if (rule) {
        const responseCtx: ResponseContext = {
          url,
          data,
          response,
          cache: this.cache,
          ruleName,
        }

        for (const plugin of rule.plugins) {
          if (plugin.onResponse) {
            await plugin.onResponse(responseCtx)
          }
        }

        // 通知规则更新
        this.registry.emitRuleUpdate(ruleName)
      }
    }

    return data
  }

  /** 订阅 URL 数据变化 */
  subscribe<T>(
    url: string, 
    callback: SubscribeCallback<T>,
    options?: KeyFetchOptions
  ): () => void {
    const rule = this.registry.findRule(url)
    const cleanups: (() => void)[] = []

    // 包装回调，添加事件类型
    let isInitial = true
    const wrappedCallback = (data: unknown) => {
      callback(data as T, isInitial ? 'initial' : 'update')
      isInitial = false
    }

    // 注册到 registry
    if (rule) {
      const unsubscribe = this.registry.addSubscriber(rule.name, wrappedCallback)
      cleanups.push(unsubscribe)

      // 调用插件的 onSubscribe
      const subscribeCtx: SubscribeContext = {
        url,
        cache: this.cache,
        ruleName: rule.name,
        notify: wrappedCallback,
      }

      for (const plugin of rule.plugins) {
        if (plugin.onSubscribe) {
          const cleanup = plugin.onSubscribe(subscribeCtx)
          cleanups.push(cleanup)
        }
      }

      // 监听规则更新，自动重新获取
      const unsubUpdate = this.registry.onRuleUpdate(rule.name, async () => {
        try {
          const data = await this.fetch<T>(url, { ...options, skipCache: true })
          wrappedCallback(data)
        } catch (error) {
          console.error(`[key-fetch] Error refetching ${url}:`, error)
        }
      })
      cleanups.push(unsubUpdate)
    }

    // 立即获取一次数据
    this.fetch<T>(url, options)
      .then(wrappedCallback)
      .catch(error => {
        console.error(`[key-fetch] Error fetching ${url}:`, error)
      })

    // 返回取消订阅函数
    return () => {
      cleanups.forEach(fn => fn())
    }
  }

  /** 手动失效规则 */
  invalidate(ruleName: string): void {
    this.registry.invalidateRule(ruleName)
  }

  /** 按标签失效 */
  invalidateByTag(tag: string): void {
    this.registry.invalidateByTag(tag)
  }

  /** 清理所有 */
  clear(): void {
    this.registry.clear()
    this.cache.clear()
    inFlight.clear()
  }

  /** 构建缓存 key */
  private buildCacheKey(url: string, init?: RequestInit): string {
    const method = (init?.method ?? 'GET').toUpperCase()
    const body = typeof init?.body === 'string' ? init.body : ''
    return `${method}:${url}:${body}`
  }
}

/** 全局单例 */
export const keyFetchCore = new KeyFetchCore()
