import fs from 'node:fs'
import path from 'node:path'
import type { DefaultTheme } from 'vitepress'

type SidebarItem = DefaultTheme.SidebarItem

interface DirMeta {
  order: number
  name: string
  collapsed?: boolean
}

/**
 * 从目录名解析排序和显示名称
 * 例如: "01-产品篇" -> { order: 1, name: "产品篇" }
 * 例如: "附录" -> { order: 999, name: "附录" }
 */
function parseDirName(dirName: string): DirMeta {
  const match = dirName.match(/^(\d+)-(.+)$/)
  if (match) {
    return {
      order: parseInt(match[1], 10),
      name: match[2],
    }
  }
  // 特殊处理：附录放最后
  if (dirName === '附录') {
    return { order: 999, name: '附录', collapsed: true }
  }
  return { order: 500, name: dirName }
}

/**
 * 读取目录下的 index.md 获取标题
 */
function getTitle(indexPath: string, fallback: string): string {
  try {
    const content = fs.readFileSync(indexPath, 'utf-8')
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

  // 读取目录内容
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }

  // 过滤出子目录
  const subDirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith('.')
  )

  for (const subDir of subDirs) {
    const subDirPath = path.join(dirPath, subDir.name)
    const subUrlBase = `${urlBase}${subDir.name}/`
    const indexPath = path.join(subDirPath, 'index.md')
    const meta = parseDirName(subDir.name)

    // 检查是否有 index.md
    const hasIndex = fs.existsSync(indexPath)
    if (!hasIndex) continue

    // 获取标题
    const title = getTitle(indexPath, meta.name)

    // 递归扫描子目录
    const children = scanDirectory(subDirPath, subUrlBase, depth + 1)

    const item: SidebarItem & { _order: number } = {
      _order: meta.order,
      text: title,
      link: subUrlBase,
    }

    if (children.length > 0) {
      item.items = children
      // 第一层（篇）：前3个展开，其余折叠
      // 第二层（章）：都不需要 collapsed
      if (depth === 0) {
        item.collapsed = meta.collapsed ?? meta.order > 3
      }
    }

    items.push(item)
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

  // 获取根标题
  const rootTitle = getTitle(indexPath, '软件开发说明书')

  // 扫描子目录
  const items = scanDirectory(whiteBookDir, '/white-book/', 0)

  return [
    {
      text: rootTitle,
      link: '/white-book/',
      items,
    },
  ]
}
