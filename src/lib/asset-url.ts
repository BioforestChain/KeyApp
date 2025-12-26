/**
 * 资源 URL 解析工具
 *
 * 解决部署到子路径（如 GitHub Pages）时，以 `/` 开头的相对路径无法正确解析的问题。
 * 使用 document.baseURI 作为基础 URL 来解析路径。
 */

/**
 * 解析资源 URL
 *
 * - 以 `/` 开头的路径：基于 document.baseURI 解析
 * - 以 `./` 开头的路径：基于 document.baseURI 解析
 * - 已经是完整 URL（http/https）：直接返回
 * - 其他情况：直接返回
 *
 * @example
 * // 假设 document.baseURI = 'https://example.com/app/'
 * resolveAssetUrl('/icons/eth.svg')       // => 'https://example.com/app/icons/eth.svg'
 * resolveAssetUrl('./icons/eth.svg')      // => 'https://example.com/app/icons/eth.svg'
 * resolveAssetUrl('https://cdn.com/a.svg') // => 'https://cdn.com/a.svg'
 */
export function resolveAssetUrl(path: string): string {
  // 已经是完整 URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 以 `/` 或 `./` 开头的相对路径，基于 baseURI 解析
  if (path.startsWith('/') || path.startsWith('./')) {
    // 去掉开头的 `/` 或 `./`
    const relativePath = path.startsWith('/') ? path.slice(1) : path.slice(2)
    return new URL(relativePath, document.baseURI).href
  }

  // 其他情况直接返回
  return path
}
