/**
 * 断点系统 - 用于拦截和调试服务调用
 */

import type { Middleware, MiddlewareContext } from './types'

/** 断点配置 */
export interface BreakpointConfig {
  service: string
  method: string
  delayMs?: number | undefined
  input?: {
    pause?: boolean | undefined
    pauseCondition?: string | undefined
    inject?: string | undefined
  } | undefined
  output?: {
    pause?: boolean | undefined
    pauseCondition?: string | undefined
    inject?: string | undefined
  } | undefined
}

/** 暂停的请求 */
export interface PausedRequest {
  id: string
  breakpoint: BreakpointConfig
  phase: 'input' | 'output'
  context: {
    $input: unknown
    $output?: unknown
  }
  resume: (modifiedContext?: { $input?: unknown; $output?: unknown }) => void
  abort: (error?: Error) => void
}

// IndexedDB 存储键
const IDB_STORE_NAME = 'mock-devtools'
const IDB_BREAKPOINTS_KEY = 'breakpoints'

// 存储
const breakpoints = new Map<string, BreakpointConfig>()
const pausedRequests = new Map<string, PausedRequest>()
let requestIdCounter = 0

// 订阅者
type Subscriber = () => void
const subscribers: Subscriber[] = []

function notify() {
  subscribers.forEach(fn => fn())
  // 异步保存到 IndexedDB
  saveToIndexedDB()
}

/** 保存断点到 IndexedDB */
async function saveToIndexedDB(): Promise<void> {
  try {
    const data = Array.from(breakpoints.values())
    const db = await openDB()
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite')
    const store = tx.objectStore(IDB_STORE_NAME)
    store.put(data, IDB_BREAKPOINTS_KEY)
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    // IndexedDB 不可用时静默失败
  }
}

/** 从 IndexedDB 加载断点 */
async function loadFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(IDB_STORE_NAME, 'readonly')
    const store = tx.objectStore(IDB_STORE_NAME)
    const request = store.get(IDB_BREAKPOINTS_KEY)
    const data = await new Promise<BreakpointConfig[] | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as BreakpointConfig[] | undefined)
      request.onerror = () => reject(request.error)
    })
    db.close()
    if (data) {
      breakpoints.clear()
      for (const bp of data) {
        breakpoints.set(getKey(bp.service, bp.method), bp)
      }
    }
  } catch {
    // IndexedDB 不可用时静默失败
  }
}

/** 打开 IndexedDB */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MockDevTools', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME)
      }
    }
  })
}

// 启动时加载
loadFromIndexedDB().then(() => {
  // 通知 UI 更新
  subscribers.forEach(fn => fn())
})

/** 生成断点 key */
function getKey(service: string, method: string): string {
  return `${service}.${method}`
}

/** 订阅变化 */
export function subscribeBreakpoints(callback: Subscriber): () => void {
  subscribers.push(callback)
  return () => {
    const idx = subscribers.indexOf(callback)
    if (idx >= 0) subscribers.splice(idx, 1)
  }
}

/** 获取所有断点 */
export function getBreakpoints(): BreakpointConfig[] {
  return Array.from(breakpoints.values())
}

/** 获取单个断点 */
export function getBreakpoint(service: string, method: string): BreakpointConfig | undefined {
  return breakpoints.get(getKey(service, method))
}

/** 设置断点 */
export function setBreakpoint(config: BreakpointConfig): void {
  const key = getKey(config.service, config.method)
  breakpoints.set(key, config)
  notify()
}

/** 更新断点 */
export function updateBreakpoint(
  service: string,
  method: string,
  updates: Partial<Omit<BreakpointConfig, 'service' | 'method'>>,
): void {
  const key = getKey(service, method)
  const existing = breakpoints.get(key)
  if (existing) {
    breakpoints.set(key, { ...existing, ...updates })
    notify()
  }
}

/** 删除断点 */
export function removeBreakpoint(service: string, method: string): void {
  const key = getKey(service, method)
  breakpoints.delete(key)
  notify()
}

/** 清除所有断点 */
export function clearBreakpoints(): void {
  breakpoints.clear()
  notify()
}

/** 获取暂停的请求 */
export function getPausedRequests(): PausedRequest[] {
  return Array.from(pausedRequests.values())
}

/** 恢复暂停的请求 */
export function resumePausedRequest(id: string, modifiedContext?: { $input?: unknown; $output?: unknown }): void {
  const paused = pausedRequests.get(id)
  if (paused) {
    paused.resume(modifiedContext)
    pausedRequests.delete(id)
    notify()
  }
}

/** 中止暂停的请求 */
export function abortPausedRequest(id: string, error?: Error): void {
  const paused = pausedRequests.get(id)
  if (paused) {
    paused.abort(error)
    pausedRequests.delete(id)
    notify()
  }
}

/** 安全执行表达式 */
function safeEval(code: string, context: Record<string, unknown>): unknown {
  const fn = new Function(...Object.keys(context), code)
  return fn(...Object.values(context))
}

/** 检查条件 */
function checkCondition(condition: string | undefined, context: Record<string, unknown>): boolean {
  if (!condition) return true
  try {
    return Boolean(safeEval(`return (${condition})`, context))
  } catch {
    return false
  }
}

/** 执行注入代码 */
function executeInject(
  inject: string,
  context: Record<string, unknown>,
): { $input?: unknown; $output?: unknown; returnValue?: unknown; shouldReturn?: boolean } {
  try {
    // 包装代码以捕获 return 语句
    const wrappedCode = `
      let __shouldReturn = false;
      let __returnValue;
      const __result = (function() {
        ${inject}
      })();
      if (__result !== undefined) {
        __shouldReturn = true;
        __returnValue = __result;
      }
      return { $input, $output, __shouldReturn, __returnValue };
    `
    const result = safeEval(wrappedCode, context) as {
      $input: unknown
      $output: unknown
      __shouldReturn: boolean
      __returnValue: unknown
    }
    return {
      $input: result.$input,
      $output: result.$output,
      shouldReturn: result.__shouldReturn,
      returnValue: result.__returnValue,
    }
  } catch (e) {
    // 如果是 throw，重新抛出
    throw e
  }
}

/** 创建断点中间件 */
export function createBreakpointMiddleware(): Middleware {
  return async (ctx: MiddlewareContext, next: () => Promise<unknown>) => {
    const key = getKey(ctx.service, ctx.member)
    const bp = breakpoints.get(key)

    if (!bp) {
      return next()
    }

    let $input = ctx.input
    let $output: unknown

    // === Input 断点 ===
    if (bp.input) {
      const inputCtx = { $input }

      // 检查暂停条件
      if (bp.input.pause && checkCondition(bp.input.pauseCondition, inputCtx)) {
        await new Promise<void>((resolve, reject) => {
          const id = `req-${++requestIdCounter}`
          pausedRequests.set(id, {
            id,
            breakpoint: bp,
            phase: 'input',
            context: { $input },
            resume: (modified) => {
              if (modified?.$input !== undefined) {
                $input = modified.$input
              }
              resolve()
            },
            abort: (error) => reject(error ?? new Error('Request aborted')),
          })
          notify()
        })
      }

      // 执行注入
      if (bp.input.inject) {
        const result = executeInject(bp.input.inject, { $input, $output: undefined })
        if (result.$input !== undefined) {
          $input = result.$input
        }
      }
    }

    // 更新 ctx.input
    ctx.input = $input

    // === 延迟 ===
    if (bp.delayMs && bp.delayMs > 0) {
      await new Promise(r => setTimeout(r, bp.delayMs))
    }

    // === 执行实际方法 ===
    $output = await next()

    // === Output 断点 ===
    if (bp.output) {
      const outputCtx = { $input, $output }

      // 检查暂停条件
      if (bp.output.pause && checkCondition(bp.output.pauseCondition, outputCtx)) {
        await new Promise<void>((resolve, reject) => {
          const id = `req-${++requestIdCounter}`
          pausedRequests.set(id, {
            id,
            breakpoint: bp,
            phase: 'output',
            context: { $input, $output },
            resume: (modified) => {
              if (modified?.$output !== undefined) {
                $output = modified.$output
              }
              resolve()
            },
            abort: (error) => reject(error ?? new Error('Request aborted')),
          })
          notify()
        })
      }

      // 执行注入
      if (bp.output.inject) {
        const result = executeInject(bp.output.inject, { $input, $output })
        if (result.shouldReturn) {
          return result.returnValue
        }
        if (result.$output !== undefined) {
          $output = result.$output
        }
      }
    }

    return $output
  }
}

/** 预创建的断点中间件 */
export const breakpointMiddleware = createBreakpointMiddleware()
