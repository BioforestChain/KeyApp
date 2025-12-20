/**
 * 常用中间件工具
 */

import type { Middleware, MiddlewareContext } from './types'

/** 延迟中间件 - 模拟网络延迟 */
export function createDelayMiddleware(ms: number): Middleware {
  return async (_ctx, next) => {
    await new Promise(r => setTimeout(r, ms))
    return next()
  }
}

/** 条件延迟中间件 */
export function createConditionalDelayMiddleware(
  condition: (ctx: MiddlewareContext) => boolean,
  ms: number,
): Middleware {
  return async (ctx, next) => {
    if (condition(ctx)) {
      await new Promise(r => setTimeout(r, ms))
    }
    return next()
  }
}

/** 错误模拟中间件 */
export function createErrorMiddleware(
  condition: (ctx: MiddlewareContext) => boolean,
  error: Error | string,
): Middleware {
  return async (ctx, next) => {
    if (condition(ctx)) {
      throw typeof error === 'string' ? new Error(error) : error
    }
    return next()
  }
}

/** 随机错误中间件 - 按概率模拟错误 */
export function createRandomErrorMiddleware(
  probability: number,
  error: Error | string = 'Random error',
): Middleware {
  return async (_ctx, next) => {
    if (Math.random() < probability) {
      throw typeof error === 'string' ? new Error(error) : error
    }
    return next()
  }
}

/** 输入修改中间件 */
export function createInputTransformMiddleware(
  transform: (input: unknown, ctx: MiddlewareContext) => unknown,
): Middleware {
  return async (ctx, next) => {
    ctx.input = transform(ctx.input, ctx)
    return next()
  }
}

/** 输出修改中间件 */
export function createOutputTransformMiddleware(
  transform: (output: unknown, ctx: MiddlewareContext) => unknown,
): Middleware {
  return async (ctx, next) => {
    const result = await next()
    return transform(result, ctx)
  }
}

/** 缓存中间件 */
export function createCacheMiddleware(
  keyFn: (ctx: MiddlewareContext) => string,
  ttlMs: number = 60000,
): Middleware {
  const cache = new Map<string, { value: unknown; expires: number }>()

  return async (ctx, next) => {
    // 只缓存 api 和 get 类型
    if (ctx.type !== 'api' && ctx.type !== 'get') {
      return next()
    }

    const key = keyFn(ctx)
    const cached = cache.get(key)

    if (cached && cached.expires > Date.now()) {
      return cached.value
    }

    const result = await next()
    cache.set(key, { value: result, expires: Date.now() + ttlMs })
    return result
  }
}

/** 重试中间件 */
export function createRetryMiddleware(
  maxRetries: number = 3,
  delayMs: number = 1000,
  shouldRetry: (error: unknown) => boolean = () => true,
): Middleware {
  return async (_ctx, next) => {
    let lastError: unknown
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await next()
      } catch (error) {
        lastError = error
        if (i < maxRetries && shouldRetry(error)) {
          await new Promise(r => setTimeout(r, delayMs * (i + 1)))
        }
      }
    }
    throw lastError
  }
}

/** 组合多个中间件 */
export function composeMiddlewares(...middlewares: Middleware[]): Middleware {
  return async (ctx, next) => {
    let index = 0
    const dispatch = async (): Promise<unknown> => {
      if (index < middlewares.length) {
        const mw = middlewares[index++]!
        return mw(ctx, dispatch)
      }
      return next()
    }
    return dispatch()
  }
}

/** 条件中间件 - 只在满足条件时应用 */
export function when(
  condition: (ctx: MiddlewareContext) => boolean,
  middleware: Middleware,
): Middleware {
  return async (ctx, next) => {
    if (condition(ctx)) {
      return middleware(ctx, next)
    }
    return next()
  }
}

/** 针对特定服务的中间件 */
export function forService(serviceName: string, middleware: Middleware): Middleware {
  return when(ctx => ctx.service === serviceName, middleware)
}

/** 针对特定成员的中间件 */
export function forMember(memberName: string, middleware: Middleware): Middleware {
  return when(ctx => ctx.member === memberName, middleware)
}
