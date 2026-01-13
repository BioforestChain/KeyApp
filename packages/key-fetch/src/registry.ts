/**
 * Rule Registry
 * 
 * 规则注册表，管理缓存规则和标签
 */

import type { CacheRule, RuleRegistry, CachePlugin, PluginContext, CacheStore } from './types'

interface CompiledRule {
  name: string
  pattern: RegExp
  plugins: CachePlugin[]
  cleanups: (() => void)[]
}

export class RuleRegistryImpl implements RuleRegistry {
  private rules = new Map<string, CompiledRule>()
  private tagIndex = new Map<string, Set<string>>()
  private updateListeners = new Map<string, Set<() => void>>()
  private subscriptions = new Map<string, Set<(data: unknown) => void>>()

  constructor(private cache: CacheStore) {}

  /** 定义缓存规则 */
  define(rule: CacheRule): void {
    const pattern = typeof rule.pattern === 'string' 
      ? new RegExp(rule.pattern) 
      : rule.pattern

    const compiled: CompiledRule = {
      name: rule.name,
      pattern,
      plugins: rule.use,
      cleanups: [],
    }

    // 调用插件的 setup
    const ctx: PluginContext = {
      name: rule.name,
      pattern,
      cache: this.cache,
      registry: this,
      notifySubscribers: () => this.notifySubscribers(rule.name),
    }

    for (const plugin of rule.use) {
      if (plugin.setup) {
        const cleanup = plugin.setup(ctx)
        if (cleanup) {
          compiled.cleanups.push(cleanup)
        }
      }
    }

    // 如果已存在同名规则，先清理
    const existing = this.rules.get(rule.name)
    if (existing) {
      existing.cleanups.forEach(fn => fn())
    }

    this.rules.set(rule.name, compiled)
  }

  /** 根据 URL 查找匹配的规则 */
  findRule(url: string): CompiledRule | undefined {
    for (const rule of this.rules.values()) {
      if (rule.pattern.test(url)) {
        return rule
      }
    }
    return undefined
  }

  /** 获取规则 */
  getRule(name: string): CompiledRule | undefined {
    return this.rules.get(name)
  }

  /** 添加标签 */
  addTag(tag: string, ruleName: string): void {
    const rules = this.tagIndex.get(tag) ?? new Set()
    rules.add(ruleName)
    this.tagIndex.set(tag, rules)
  }

  /** 获取标签下的规则 */
  getRulesByTag(tag: string): string[] {
    const rules = this.tagIndex.get(tag)
    return rules ? Array.from(rules) : []
  }

  /** 监听规则数据更新 */
  onRuleUpdate(ruleName: string, callback: () => void): () => void {
    const listeners = this.updateListeners.get(ruleName) ?? new Set()
    listeners.add(callback)
    this.updateListeners.set(ruleName, listeners)

    return () => {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.updateListeners.delete(ruleName)
      }
    }
  }

  /** 触发规则更新通知 */
  emitRuleUpdate(ruleName: string): void {
    const listeners = this.updateListeners.get(ruleName)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.error(`[key-fetch] Error in rule update listener for ${ruleName}:`, error)
        }
      })
    }
  }

  /** 添加订阅者 */
  addSubscriber(ruleName: string, callback: (data: unknown) => void): () => void {
    const subs = this.subscriptions.get(ruleName) ?? new Set()
    subs.add(callback)
    this.subscriptions.set(ruleName, subs)

    return () => {
      subs.delete(callback)
      if (subs.size === 0) {
        this.subscriptions.delete(ruleName)
      }
    }
  }

  /** 获取订阅者数量 */
  getSubscriberCount(ruleName: string): number {
    return this.subscriptions.get(ruleName)?.size ?? 0
  }

  /** 通知订阅者 */
  private notifySubscribers(ruleName: string): void {
    const subs = this.subscriptions.get(ruleName)
    if (!subs || subs.size === 0) return

    // 获取缓存数据
    const rule = this.rules.get(ruleName)
    if (!rule) return

    // 通知所有订阅者刷新
    this.emitRuleUpdate(ruleName)
  }

  /** 按标签失效 */
  invalidateByTag(tag: string): void {
    const rules = this.getRulesByTag(tag)
    for (const ruleName of rules) {
      this.invalidateRule(ruleName)
    }
  }

  /** 失效规则 */
  invalidateRule(ruleName: string): void {
    const rule = this.rules.get(ruleName)
    if (!rule) return

    // 删除匹配该规则的所有缓存
    for (const key of this.cache.keys()) {
      if (rule.pattern.test(key)) {
        this.cache.delete(key)
      }
    }

    // 通知更新
    this.emitRuleUpdate(ruleName)
  }

  /** 清理所有规则 */
  clear(): void {
    for (const rule of this.rules.values()) {
      rule.cleanups.forEach(fn => fn())
    }
    this.rules.clear()
    this.tagIndex.clear()
    this.updateListeners.clear()
    this.subscriptions.clear()
  }
}
