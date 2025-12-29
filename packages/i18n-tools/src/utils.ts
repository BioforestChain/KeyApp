export type TranslationValue = string | { [key: string]: TranslationValue }
export type TranslationFile = Record<string, TranslationValue>

/**
 * 递归提取翻译文件中的所有 key
 * @returns 扁平化的 key 列表，如 "app.title", "error.notFound"
 */
export function extractKeys(obj: TranslationFile, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value as TranslationFile, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

/**
 * 在嵌套对象中设置值
 */
export function setNestedValue(obj: TranslationFile, path: string, value: string): void {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part] as TranslationFile
  }
  current[parts[parts.length - 1]] = value
}

/**
 * 获取嵌套对象中的值
 */
export function getNestedValue(obj: TranslationFile, path: string): TranslationValue | undefined {
  const parts = path.split('.')
  let current: TranslationValue = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined
    }
    current = (current as TranslationFile)[part]
  }
  return current
}
