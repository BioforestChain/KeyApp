import { z } from 'zod'

/**
 * 数据验证错误
 * 当外部数据（IndexedDB、localStorage、fetch）不符合预期 schema 时抛出
 */
export class DataValidationError extends Error {
  readonly code = 'DATA_VALIDATION_ERROR'
  readonly source: string
  readonly zodError: z.ZodError

  constructor(source: string, zodError: z.ZodError) {
    const firstIssue = zodError.issues[0]
    const path = firstIssue?.path.join('.') || 'root'
    const message = firstIssue?.message || 'Unknown validation error'
    super(`Invalid data from ${source}: ${path} - ${message}`)
    this.name = 'DataValidationError'
    this.source = source
    this.zodError = zodError
  }
}

/**
 * 安全解析：验证数据符合 schema，失败时抛出 DataValidationError
 * 使用 passthrough 模式，允许多余字段
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  source: string
): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new DataValidationError(source, result.error)
  }
  return result.data
}

/**
 * 安全解析数组：过滤掉无效项，返回有效项
 * 不会因为单个无效项而中断整个流程
 */
export function safeParseArray<T>(
  itemSchema: z.ZodType<T>,
  data: unknown,
  source: string
): T[] {
  if (!Array.isArray(data)) {
    console.warn(`[safeParse] Expected array from ${source}, got ${typeof data}`)
    return []
  }

  const results: T[] = []
  for (let i = 0; i < data.length; i++) {
    const result = itemSchema.safeParse(data[i])
    if (result.success) {
      results.push(result.data)
    } else {
      console.warn(`[safeParse] Invalid item at index ${i} from ${source}:`, result.error.issues[0])
    }
  }
  return results
}

/**
 * 安全解析 JSON 字符串
 */
export function safeParseJson<T>(
  schema: z.ZodType<T>,
  jsonString: string | null,
  source: string
): T | null {
  if (!jsonString) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    console.warn(`[safeParse] Invalid JSON from ${source}`)
    return null
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    console.warn(`[safeParse] Schema validation failed for ${source}:`, result.error.issues[0])
    return null
  }
  return result.data
}
