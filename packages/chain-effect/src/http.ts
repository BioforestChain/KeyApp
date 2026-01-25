/**
 * HTTP Client utilities for Effect
 *
 * 封装 fetch API，提供类型安全的 HTTP 请求
 */

import { Effect, Schedule, Duration, Option } from 'effect';
import { Schema } from 'effect';
import { getFromCache, putToCache, deleteFromCache } from './http-cache';
import { formatChainEffectError, logChainEffectDebug } from './debug';

// ==================== Error Types ====================

/** HTTP 错误基类 */
export class HttpError {
  readonly _tag = 'HttpError' as const;
  constructor(
    readonly message: string,
    readonly status?: number,
    readonly body?: string,
  ) {}
}

/** 429 限流错误 */
export class RateLimitError {
  readonly _tag = 'RateLimitError' as const;
  constructor(
    readonly message: string,
    readonly retryAfter?: number,
  ) {}
}

/** Schema 验证错误 */
export class SchemaError {
  readonly _tag = 'SchemaError' as const;
  constructor(
    readonly message: string,
    readonly errors?: unknown,
  ) {}
}

/** Provider 不支持此功能 */
export class NoSupportError extends Error {
  readonly _tag = 'NoSupportError' as const;
  constructor(message = 'This feature is not supported by the provider') {
    super(message);
    this.name = 'NoSupportError';
  }
}

/** 服务受限（如免费版不支持） */
export class ServiceLimitedError extends Error {
  readonly _tag = 'ServiceLimitedError' as const;
  constructor(
    message = 'This service is limited',
    readonly reason?: string,
  ) {
    super(message);
    this.name = 'ServiceLimitedError';
  }
}

export type FetchError = HttpError | RateLimitError | SchemaError;

// ==================== HTTP Client ====================

export interface FetchOptions<T> {
  /** URL 模板，支持 :param 占位符 */
  url: string;
  /** HTTP 方法 */
  method?: 'GET' | 'POST';
  /** URL 路径参数（替换 :param）*/
  pathParams?: Record<string, string | number>;
  /** URL 查询参数 */
  searchParams?: Record<string, string | number | undefined>;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体（POST）*/
  body?: unknown;
  /** 响应 Schema */
  schema?: Schema.Schema<T, unknown, never>;
  /** 超时时间（毫秒）*/
  timeout?: number;
  /** 缓存策略（浏览器层面的 Request cache）*/
  cache?: RequestCache;
}

/**
 * 替换 URL 中的 :param 占位符
 */
function replacePathParams(url: string, params?: Record<string, string | number>): string {
  if (!params) return url;
  let result = url;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  return result;
}

/**
 * 添加查询参数到 URL
 */
function appendSearchParams(url: string, params?: Record<string, string | number | undefined>): string {
  if (!params) return url;
  const urlObj = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      urlObj.searchParams.set(key, String(value));
    }
  }
  return urlObj.toString();
}

/**
 * 创建 HTTP 请求 Effect
 *
 * @example
 * ```ts
 * const balance = httpFetch({
 *   url: 'https://api.example.com/address/:address/balance',
 *   pathParams: { address: '0x...' },
 *   schema: BalanceSchema,
 * })
 * ```
 */
export function httpFetch<T>(options: FetchOptions<T>): Effect.Effect<T, FetchError> {
  const { url, method = 'GET', pathParams, searchParams, headers = {}, body, schema, timeout = 30000, cache } = options;

  // 构建最终 URL
  let finalUrl = replacePathParams(url, pathParams);
  finalUrl = appendSearchParams(finalUrl, searchParams);

  return Effect.tryPromise({
    try: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const requestInit: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
          cache,
        };

        if (method === 'POST' && body !== undefined) {
          requestInit.body = JSON.stringify(body);
        }

        const response = await fetch(finalUrl, requestInit);
        clearTimeout(timeoutId);

        // 检查状态码
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : undefined);
        }

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new HttpError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorBody.slice(0, 500),
          );
        }

        // 解析 JSON
        const json = await response.json();

        // Schema 验证
        if (schema) {
          const result = Schema.decodeUnknownSync(schema)(json);
          return result as T;
        }

        return json as T;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    catch: (error) => {
      if (error instanceof RateLimitError) return error;
      if (error instanceof HttpError) return error;
      if (error instanceof SchemaError) return error;
      if (error instanceof Error && error.name === 'AbortError') {
        return new HttpError(`Request timeout after ${timeout}ms`);
      }
      return new HttpError(error instanceof Error ? error.message : String(error));
    },
  });
}

// ==================== Retry Policies ====================

/** 默认重试策略：指数退避，最多 3 次 */
export const defaultRetrySchedule = Schedule.exponential(Duration.millis(1000), 2).pipe(
  Schedule.compose(Schedule.recurs(3)),
);

/** 429 限流重试策略：等待 5 秒，最多 3 次 */
export const rateLimitRetrySchedule = Schedule.spaced(Duration.seconds(5)).pipe(Schedule.compose(Schedule.recurs(3)));

/**
 * 带重试的 HTTP 请求
 */
export function httpFetchWithRetry<T>(
  options: FetchOptions<T>,
  retrySchedule: Schedule.Schedule<unknown, unknown> = defaultRetrySchedule,
): Effect.Effect<T, FetchError> {
  return httpFetch(options).pipe(
    Effect.retry(
      Schedule.whileInput(retrySchedule, (error: FetchError) => {
        // 只对网络错误和限流重试
        if (error._tag === 'RateLimitError') return true;
        if (error._tag === 'HttpError' && error.status && error.status >= 500) return true;
        return false;
      }),
    ),
  );
}

// ==================== Cached HTTP Client ====================

export type CacheStrategy = 
  | 'ttl'           // 基于时间过期（默认）
  | 'cache-first'   // 有缓存就用，没有才 fetch
  | 'network-first' // 尝试 fetch，成功更新缓存，失败用缓存

export interface CachedFetchOptions<T> extends FetchOptions<T> {
  /** 缓存策略 */
  cacheStrategy?: CacheStrategy;
  /** 缓存 TTL（毫秒），仅 ttl 策略使用 */
  cacheTtl?: number;
  /** 是否允许缓存当前响应（network-first 场景） */
  canCache?: (result: T) => Promise<boolean>;
}

// 用于防止并发请求的 Promise 锁
const pendingRequests = new Map<string, Promise<unknown>>();

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function toStableJson(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (!isRecord(value)) {
    if (Array.isArray(value)) {
      return value.map(toStableJson);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(toStableJson);
  }
  const sorted: UnknownRecord = {};
  for (const key of Object.keys(value).slice().sort()) {
    sorted[key] = toStableJson(value[key]);
  }
  return sorted;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(toStableJson(value));
}

function makeCacheKeyForRequest(url: string, body?: unknown): string {
  if (!body) return url;
  const bodyHash = btoa(stableStringify(body)).replace(/[+/=]/g, (c) =>
    c === '+' ? '-' : c === '/' ? '_' : ''
  );
  return `${url}?__body=${bodyHash}`;
}

/**
 * 带缓存拦截的 HTTP 请求
 *
 * 策略说明：
 * - ttl: 缓存未过期直接返回，过期才 fetch
 * - cache-first: 有缓存就返回，没有才 fetch
 * - network-first: 尝试 fetch，成功更新缓存，失败用缓存
 */
export function httpFetchCached<T>(options: CachedFetchOptions<T>): Effect.Effect<T, FetchError> {
  const { cacheStrategy = 'ttl', cacheTtl = 5000, canCache, ...fetchOptions } = options;
  const cacheKey = makeCacheKeyForRequest(options.url, options.body);

  // 重要：请求必须在 Effect 执行时惰性创建，避免首次构建就触发 fetch，
  // 否则会导致轮询重复复用同一个 Promise，从而看起来“只有第一次发请求”。
  return Effect.promise(async () => {
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      logChainEffectDebug('httpFetchCached pending', options.url);
      return pending as Promise<T>;
    }

    const shouldCache = async (result: T): Promise<boolean> => {
      if (!canCache) return true;
      try {
        return await canCache(result);
      } catch (error) {
        logChainEffectDebug(
          'httpFetchCached can-cache error',
          options.url,
          formatChainEffectError(error),
        );
        return false;
      }
    };

    const requestPromise = (async () => {
      const cached = await Effect.runPromise(getFromCache<T>(options.url, options.body));
      const cachedValue = Option.isSome(cached) ? cached.value.data : null;
      const cachedUsable = Option.isSome(cached) ? await shouldCache(cached.value.data) : false;
      if (Option.isSome(cached) && !cachedUsable) {
        await Effect.runPromise(deleteFromCache(options.url, options.body));
      }

      if (cacheStrategy === 'cache-first') {
        // Cache-First: 有缓存就返回
        if (Option.isSome(cached) && cachedUsable && cachedValue !== null) {
          logChainEffectDebug('httpFetchCached cache-first hit', options.url);
          return cachedValue;
        }
        logChainEffectDebug('httpFetchCached cache-first miss', options.url);
        try {
          const result = await Effect.runPromise(httpFetch(fetchOptions));
          if (await shouldCache(result)) {
            await Effect.runPromise(putToCache(options.url, options.body, result));
          }
          return result;
        } catch (error) {
          logChainEffectDebug(
            'httpFetchCached cache-first fetch error',
            options.url,
            formatChainEffectError(error),
          );
          throw error;
        }
      }

      if (cacheStrategy === 'network-first') {
        // Network-First: 尝试 fetch，失败用缓存
        try {
          logChainEffectDebug('httpFetchCached network-first fetch', options.url);
          const result = await Effect.runPromise(httpFetch(fetchOptions));
          if (await shouldCache(result)) {
            await Effect.runPromise(putToCache(options.url, options.body, result));
          }
          return result;
        } catch (error) {
          logChainEffectDebug(
            'httpFetchCached network-first fetch error',
            options.url,
            formatChainEffectError(error),
          );
          if (Option.isSome(cached) && cachedUsable && cachedValue !== null) {
            logChainEffectDebug('httpFetchCached network-first fallback', options.url);
            return cachedValue;
          }
          throw error;
        }
      }

      // TTL 策略（默认）
      if (Option.isSome(cached) && cachedUsable) {
        const age = Date.now() - cached.value.timestamp;
        if (age < cacheTtl) {
          logChainEffectDebug(
            'httpFetchCached ttl hit',
            options.url,
            `age=${age}ms`,
            `ttl=${cacheTtl}ms`,
          );
          return cachedValue as T;
        }
        logChainEffectDebug(
          'httpFetchCached ttl expired',
          options.url,
          `age=${age}ms`,
          `ttl=${cacheTtl}ms`,
        );
      } else {
        logChainEffectDebug('httpFetchCached ttl miss', options.url);
      }

      try {
        const result = await Effect.runPromise(httpFetch(fetchOptions));
        if (await shouldCache(result)) {
          await Effect.runPromise(putToCache(options.url, options.body, result));
        }
        return result;
      } catch (error) {
        logChainEffectDebug(
          'httpFetchCached ttl fetch error',
          options.url,
          formatChainEffectError(error),
        );
        throw error;
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  });
}
