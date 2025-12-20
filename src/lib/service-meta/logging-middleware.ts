/**
 * 日志中间件 - 记录所有服务调用
 */

import type { Middleware, MiddlewareContext } from './types'

/** 日志条目 */
export interface ServiceLogEntry {
  id: string
  timestamp: Date
  service: string
  member: string
  type: string
  input: unknown
  output?: unknown
  error?: string
  duration?: number
  status: 'pending' | 'success' | 'error'
}

/** 日志存储 */
const logs: ServiceLogEntry[] = []
const MAX_LOGS = 500
let logIdCounter = 0

/** 生成日志 ID */
function generateLogId(): string {
  return `log-${++logIdCounter}-${Date.now()}`
}

/** 添加日志 */
function addLog(entry: Omit<ServiceLogEntry, 'id'>): ServiceLogEntry {
  const log: ServiceLogEntry = { id: generateLogId(), ...entry }
  logs.unshift(log)
  if (logs.length > MAX_LOGS) {
    logs.pop()
  }
  return log
}

/** 更新日志 */
function updateLog(id: string, updates: Partial<ServiceLogEntry>): void {
  const log = logs.find(l => l.id === id)
  if (log) {
    Object.assign(log, updates)
  }
}

/** 获取所有日志 */
export function getServiceLogs(): ServiceLogEntry[] {
  return [...logs]
}

/** 清除日志 */
export function clearServiceLogs(): void {
  logs.length = 0
  notifySubscribers()
}

/** 日志订阅者 */
type LogSubscriber = (logs: ServiceLogEntry[]) => void
const subscribers: LogSubscriber[] = []

/** 订阅日志变化 */
export function subscribeToLogs(callback: LogSubscriber): () => void {
  subscribers.push(callback)
  return () => {
    const index = subscribers.indexOf(callback)
    if (index >= 0) subscribers.splice(index, 1)
  }
}

/** 通知订阅者 */
function notifySubscribers(): void {
  const snapshot = [...logs]
  subscribers.forEach(cb => cb(snapshot))
}

/** 创建日志中间件 */
export function createLoggingMiddleware(): Middleware {
  return async (ctx: MiddlewareContext, next: () => Promise<unknown>) => {
    const startTime = Date.now()
    
    const log = addLog({
      timestamp: new Date(),
      service: ctx.service,
      member: ctx.member,
      type: ctx.type,
      input: ctx.input,
      status: 'pending',
    })
    
    notifySubscribers()
    
    try {
      const result = await next()
      
      updateLog(log.id, {
        output: result,
        duration: Date.now() - startTime,
        status: 'success',
      })
      
      notifySubscribers()
      return result
    } catch (error) {
      updateLog(log.id, {
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        status: 'error',
      })
      
      notifySubscribers()
      throw error
    }
  }
}

/** 预创建的日志中间件实例 */
export const loggingMiddleware = createLoggingMiddleware()
