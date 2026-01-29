/**
 * URL Resolver - 基于 JSON 文件位置解析相对路径
 *
 * @example
 * ```typescript
 * const resolve = createResolver('/miniapps/ecosystem.json')
 * resolve('./biobridge/icon.svg')  // => '/miniapps/biobridge/icon.svg'
 * resolve('https://example.com/icon.svg')  // => 'https://example.com/icon.svg' (保持不变)
 * ```
 */

export type UrlResolver = (path: string) => string

/**
 * 创建一个基于指定 JSON 文件位置的 URL 解析器
 *
 * @param jsonFileUrl - JSON 文件的 URL（绝对路径或相对于 document.baseURI）
 * @returns 解析函数，接受相对路径返回绝对 URL
 */
export function createResolver(jsonFileUrl: string): UrlResolver {
  // 获取基础 URL（用于解析 jsonFileUrl 本身）
  const baseUrl = typeof document !== 'undefined' ? document.baseURI : 'file:///'

  // 解析 jsonFileUrl 为绝对 URL
  const absoluteJsonUrl = new URL(jsonFileUrl, baseUrl).toString()

  return (path: string): string => {
    // 已经是绝对 URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path
    }
    // 解析相对路径（相对于 JSON 文件位置）
    return new URL(path, absoluteJsonUrl).toString()
  }
}

/**
 * 解析相对路径为绝对 URL（相对于 JSON 文件位置）
 *
 * @param path - 要解析的路径（可以是相对路径或绝对 URL）
 * @param jsonFileUrl - JSON 文件的 URL
 * @returns 解析后的绝对 URL
 */
export function resolveRelativePath(path: string, jsonFileUrl: string): string {
  return createResolver(jsonFileUrl)(path)
}
