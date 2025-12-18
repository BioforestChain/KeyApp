import fs from 'node:fs'
import path from 'node:path'
import type { DefaultTheme } from 'vitepress'

type SidebarItem = DefaultTheme.SidebarItem

interface FileMeta {
  order: number
  name: string
  isDir: boolean
  collapsed?: boolean
}

/**
 * 从文件/目录名解析排序和显示名称
 * 例如: "01-产品篇" -> { order: 1, name: "产品篇" }
 * 例如: "Button.md" -> { order: 500, name: "Button" }
 */
function parseFileName(fileName: string, isDir: boolean): FileMeta {
  // 移除 .md 扩展名
  const baseName = fileName.replace(/\.md$/, '')
  
  const match = baseName.match(/^(\d+)-(.+)$/)
  if (match) {
    return {
      order: parseInt(match[1], 10),
      name: match[2],
      isDir,
    }
  }
  
  // 特殊处理：附录放最后
  if (baseName === '附录') {
    return { order: 999, name: '附录', isDir, collapsed: true }
  }
  
  // index 文件不单独显示
  if (baseName === 'index') {
    return { order: -1, name: '', isDir: false }
  }
  
  return { order: 500, name: baseName, isDir }
}

/**
 * 读取 markdown 文件获取标题
 */
function getTitle(filePath: string, fallback: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/^#\s+(.+)$/m)
    if (match) {
      return match[1].trim()
    }
  } catch {
    // 文件不存在或读取失败
  }
  return fallback
}

/**
 * 扫描目录生成侧边栏项
 */
function scanDirectory(
  dirPath: string,
  urlBase: string,
  depth: number = 0
): SidebarItem[] {
  const items: Array<SidebarItem & { _order: number }> = []

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    
    const entryPath = path.join(dirPath, entry.name)
    const meta = parseFileName(entry.name, entry.isDirectory())
    
    // 跳过 index 文件（由父目录处理）
    if (meta.order === -1) continue
    
    if (entry.isDirectory()) {
      const subUrlBase = `${urlBase}${entry.name}/`
      const indexPath = path.join(entryPath, 'index.md')
      
      // 检查是否有 index.md
      const hasIndex = fs.existsSync(indexPath)
      if (!hasIndex) continue
      
      const title = getTitle(indexPath, meta.name)
      const children = scanDirectory(entryPath, subUrlBase, depth + 1)
      
      const item: SidebarItem & { _order: number } = {
        _order: meta.order,
        text: title,
        link: subUrlBase,
      }
      
      if (children.length > 0) {
        item.items = children
        // 深度 0（篇）：前3个展开，其余折叠
        // 深度 1+（章/节）：默认展开
        if (depth === 0) {
          item.collapsed = meta.collapsed ?? meta.order > 3
        }
      }
      
      items.push(item)
      
    } else if (entry.name.endsWith('.md')) {
      // 单独的 markdown 文件
      const title = getTitle(entryPath, meta.name)
      const link = `${urlBase}${entry.name.replace(/\.md$/, '')}`
      
      items.push({
        _order: meta.order,
        text: title,
        link,
      })
    }
  }

  // 按 order 排序
  items.sort((a, b) => a._order - b._order)

  // 移除 _order 字段
  return items.map(({ _order, ...rest }) => rest)
}

/**
 * 生成白皮书侧边栏配置
 */
export function generateWhiteBookSidebar(): SidebarItem[] {
  const whiteBookDir = path.resolve(__dirname, '../white-book')
  const indexPath = path.join(whiteBookDir, 'index.md')

  const rootTitle = getTitle(indexPath, '软件开发说明书')
  const items = scanDirectory(whiteBookDir, '/white-book/', 0)

  return [
    {
      text: rootTitle,
      link: '/white-book/',
      items,
    },
  ]
}
