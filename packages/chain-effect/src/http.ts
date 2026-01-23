/**
 * HTTP Client utilities for Effect
 *
 * 封装 fetch API，提供类型安全的 HTTP 请求
 */

import { Effect, Schedule, Duration } from 'effect';
import { Schema } from 'effect';

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
  schema?: Schema.Schema<T, any, never>;
  /** 超时时间（毫秒）*/
  timeout?: number;
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
  const { url, method = 'GET', pathParams, searchParams, headers = {}, body, schema, timeout = 30000 } = options;

  // 构建最终 URL
  let finalUrl = replacePathParams(url, pathParams);
  finalUrl = appendSearchParams(finalUrl, searchParams);

  return Effect.tryPromise({
    try: async (signal) => {
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
