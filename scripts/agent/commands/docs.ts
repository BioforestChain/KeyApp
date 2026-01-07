/**
 * 文档工具链 - pnpm agent docs <action>
 *
 * 子命令:
 *   validate  - 检查断链、缺失文件、格式问题
 *   related   - 查找与代码/文档相关的白皮书文件
 *   graph     - 构建并输出文档关系图
 *   sync      - 从源码同步组件/服务清单
 */

import type { CommandModule } from 'yargs'
import fs from 'node:fs'
import path from 'node:path'

// 简易 glob 实现
function globSync(pattern: string): string[] {
  const results: string[] = []
  const parts = pattern.split('/')
  const baseDir = parts[0]

  function walk(dir: string, depth: number) {
    if (!fs.existsSync(dir)) return

    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // 处理 **/ 或 */ 模式
        if (parts[depth] === '**' || parts[depth] === '*') {
          walk(fullPath, depth)
        }
        if (parts[depth + 1]) {
          walk(fullPath, depth + 1)
        }
      } else if (entry.isFile()) {
        const expectedExt = parts[parts.length - 1]
        if (expectedExt === '*.md' && entry.name.endsWith('.md')) {
          results.push(fullPath)
        } else if (expectedExt === '*.ts' && entry.name.endsWith('.ts')) {
          results.push(fullPath)
        } else if (expectedExt === '*.tsx' && entry.name.endsWith('.tsx')) {
          results.push(fullPath)
        } else if (expectedExt === '*/' && entry.isDirectory()) {
          results.push(fullPath)
        }
      }
    }
  }

  // 对于目录模式 (以 / 结尾)
  if (pattern.endsWith('/')) {
    const basePath = pattern.replace('/*/', '').replace('/**/', '')
    if (fs.existsSync(basePath)) {
      const entries = fs.readdirSync(basePath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          results.push(path.join(basePath, entry.name) + '/')
        }
      }
    }
    return results
  }

  walk(baseDir, 1)
  return results
}

// 递归获取所有 md 文件
function getAllMdFiles(dir: string): string[] {
  const results: string[] = []

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return

    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

// 获取目录列表
function getDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(dir, e.name) + '/')
}

// 递归获取所有 ts 文件
function getAllTsFiles(dir: string): string[] {
  const results: string[] = []

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return

    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

const WHITE_BOOK_DIR = 'docs/white-book'
const SRC_DIR = 'src'

// ============================================================================
// 关系图数据结构
// ============================================================================

interface DocNode {
  path: string // 相对路径
  title: string
  type: 'book' | 'chapter' | 'section'
  sourceLinks: string[] // 链接的源码路径
  docLinks: string[] // 链接的文档路径
  backLinks: string[] // 被哪些文档引用
}

interface SourceNode {
  path: string // 相对路径
  docLinks: string[] // 关联的文档
}

interface RelationGraph {
  docs: Map<string, DocNode>
  sources: Map<string, SourceNode>
}

// ============================================================================
// 工具函数
// ============================================================================

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || 'Untitled'
}

function extractLinks(content: string, basePath: string): { docLinks: string[]; sourceLinks: string[] } {
  const docLinks: string[] = []
  const sourceLinks: string[] = []

  // 提取 Markdown 链接 [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g
  let match
  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2]

    // GitHub 源码链接
    if (url.includes('github.com/BioforestChain/KeyApp/blob/main/')) {
      const srcPath = url.replace(/.*blob\/main\//, '')
      sourceLinks.push(srcPath)
    }
    // 相对文档链接
    else if (url.startsWith('./') || url.startsWith('../')) {
      const resolved = path.normalize(path.join(path.dirname(basePath), url.replace(/#.*$/, '')))
      if (!resolved.startsWith('..')) {
        docLinks.push(resolved)
      }
    }
  }

  return { docLinks, sourceLinks }
}

function getDocType(filePath: string): 'book' | 'chapter' | 'section' {
  const parts = filePath.split('/')
  if (parts.length <= 2) return 'book'
  if (parts.length <= 3) return 'chapter'
  return 'section'
}

// ============================================================================
// 构建关系图
// ============================================================================

async function buildRelationGraph(): Promise<RelationGraph> {
  const graph: RelationGraph = {
    docs: new Map(),
    sources: new Map(),
  }

  // 扫描所有文档
  const docFiles = getAllMdFiles(WHITE_BOOK_DIR)

  for (const filePath of docFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const relativePath = filePath.replace(`${WHITE_BOOK_DIR}/`, '')
    const { docLinks, sourceLinks } = extractLinks(content, relativePath)

    const node: DocNode = {
      path: relativePath,
      title: extractTitle(content),
      type: getDocType(relativePath),
      sourceLinks,
      docLinks,
      backLinks: [],
    }

    graph.docs.set(relativePath, node)

    // 记录源码到文档的反向映射
    for (const srcPath of sourceLinks) {
      if (!graph.sources.has(srcPath)) {
        graph.sources.set(srcPath, { path: srcPath, docLinks: [] })
      }
      graph.sources.get(srcPath)!.docLinks.push(relativePath)
    }
  }

  // 构建文档间的反向链接
  for (const [docPath, node] of graph.docs) {
    for (const linkedDoc of node.docLinks) {
      const target = graph.docs.get(linkedDoc)
      if (target && !target.backLinks.includes(docPath)) {
        target.backLinks.push(docPath)
      }
    }
  }

  return graph
}

// ============================================================================
// validate 命令
// ============================================================================

async function runValidate() {
  console.log('🔍 验证白皮书文档...\n')

  const issues: { type: string; path: string; message: string }[] = []
  const graph = await buildRelationGraph()

  // 1. 检查断链
  for (const [docPath, node] of graph.docs) {
    for (const link of node.docLinks) {
      if (!graph.docs.has(link) && !fs.existsSync(path.join(WHITE_BOOK_DIR, link))) {
        issues.push({
          type: 'broken-link',
          path: docPath,
          message: `断链: ${link}`,
        })
      }
    }
  }

  // 2. 检查缺少 README/index
  const dirs = getDirs(WHITE_BOOK_DIR)
  for (const dir of dirs) {
    const hasEntry =
      fs.existsSync(path.join(dir, 'README.md')) ||
      fs.existsSync(path.join(dir, 'index.md')) ||
      fs.existsSync(path.join(dir, '00-Index.md'))

    if (!hasEntry) {
      issues.push({
        type: 'missing-entry',
        path: dir.replace(`${WHITE_BOOK_DIR}/`, ''),
        message: '缺少入口文件 (README.md/index.md/00-Index.md)',
      })
    }
  }

  // 3. 检查源码链接有效性
  for (const [docPath, node] of graph.docs) {
    for (const srcLink of node.sourceLinks) {
      if (!fs.existsSync(srcLink)) {
        issues.push({
          type: 'invalid-source',
          path: docPath,
          message: `无效源码链接: ${srcLink}`,
        })
      }
    }
  }

  // 4. 检查孤立文档 (无引用)
  for (const [docPath, node] of graph.docs) {
    if (
      node.backLinks.length === 0 &&
      !docPath.includes('README') &&
      !docPath.includes('index') &&
      !docPath.includes('00-Index')
    ) {
      // 检查是否在某个 README 中被引用
      const parentDir = path.dirname(docPath)
      const parentReadme = graph.docs.get(`${parentDir}/README.md`)
      const parentIndex = graph.docs.get(`${parentDir}/00-Index.md`)

      if (!parentReadme?.docLinks.includes(docPath) && !parentIndex?.docLinks.includes(docPath)) {
        issues.push({
          type: 'orphan',
          path: docPath,
          message: '孤立文档 (无被引用)',
        })
      }
    }
  }

  // 输出结果
  if (issues.length === 0) {
    console.log('✅ 所有检查通过!\n')
    console.log(`📊 统计: ${graph.docs.size} 个文档, ${graph.sources.size} 个源码引用`)
  } else {
    console.log(`❌ 发现 ${issues.length} 个问题:\n`)

    const grouped = issues.reduce(
      (acc, issue) => {
        acc[issue.type] = acc[issue.type] || []
        acc[issue.type].push(issue)
        return acc
      },
      {} as Record<string, typeof issues>
    )

    for (const [type, typeIssues] of Object.entries(grouped)) {
      console.log(`\n### ${type} (${typeIssues.length})`)
      for (const issue of typeIssues.slice(0, 10)) {
        console.log(`  - ${issue.path}: ${issue.message}`)
      }
      if (typeIssues.length > 10) {
        console.log(`  ... 还有 ${typeIssues.length - 10} 个`)
      }
    }
  }

  return issues.length === 0 ? 0 : 1
}

// ============================================================================
// related 命令
// ============================================================================

async function runRelated(targetPath: string) {
  const graph = await buildRelationGraph()
  const normalizedPath = targetPath.replace(/^(src\/|docs\/white-book\/)/, '')

  console.log(`🔗 查找与 "${targetPath}" 相关的文档...\n`)

  // 1. 如果是源码路径，找关联文档
  if (targetPath.startsWith('src/') || fs.existsSync(`src/${normalizedPath}`)) {
    const srcPath = targetPath.startsWith('src/') ? targetPath : `src/${normalizedPath}`

    // 精确匹配
    const exactMatch = graph.sources.get(srcPath)
    if (exactMatch) {
      console.log('📄 直接关联的文档:')
      for (const doc of exactMatch.docLinks) {
        const node = graph.docs.get(doc)
        console.log(`  - ${doc} (${node?.title})`)
      }
    }

    // 目录匹配
    const dirPath = path.dirname(srcPath)
    const relatedByDir: string[] = []
    for (const [src, node] of graph.sources) {
      if (src.startsWith(dirPath) && src !== srcPath) {
        relatedByDir.push(...node.docLinks)
      }
    }

    if (relatedByDir.length > 0) {
      console.log('\n📁 同目录相关文档:')
      const unique = [...new Set(relatedByDir)]
      for (const doc of unique.slice(0, 10)) {
        const node = graph.docs.get(doc)
        console.log(`  - ${doc} (${node?.title})`)
      }
    }
  }

  // 2. 如果是文档路径，找关联文档和源码
  const docPath = targetPath.replace('docs/white-book/', '')
  const docNode = graph.docs.get(docPath)

  if (docNode) {
    console.log(`\n📖 文档: ${docNode.title}`)

    if (docNode.sourceLinks.length > 0) {
      console.log('\n🔧 关联源码:')
      for (const src of docNode.sourceLinks) {
        console.log(`  - ${src}`)
      }
    }

    if (docNode.docLinks.length > 0) {
      console.log('\n➡️ 引用的文档:')
      for (const link of docNode.docLinks) {
        const node = graph.docs.get(link)
        console.log(`  - ${link} (${node?.title || '未找到'})`)
      }
    }

    if (docNode.backLinks.length > 0) {
      console.log('\n⬅️ 被引用于:')
      for (const link of docNode.backLinks) {
        const node = graph.docs.get(link)
        console.log(`  - ${link} (${node?.title})`)
      }
    }
  }
}

// ============================================================================
// graph 命令
// ============================================================================

async function runGraph(format: 'json' | 'mermaid' = 'json') {
  const graph = await buildRelationGraph()

  if (format === 'json') {
    const output = {
      docs: Object.fromEntries(graph.docs),
      sources: Object.fromEntries(graph.sources),
      stats: {
        totalDocs: graph.docs.size,
        totalSources: graph.sources.size,
        books: [...graph.docs.values()].filter((d) => d.type === 'book').length,
        chapters: [...graph.docs.values()].filter((d) => d.type === 'chapter').length,
        sections: [...graph.docs.values()].filter((d) => d.type === 'section').length,
      },
    }
    console.log(JSON.stringify(output, null, 2))
  } else {
    // Mermaid 格式
    console.log('graph LR')
    for (const [docPath, node] of graph.docs) {
      const id = docPath.replace(/[\/\.\-]/g, '_')
      for (const link of node.docLinks.slice(0, 3)) {
        const linkId = link.replace(/[\/\.\-]/g, '_')
        if (graph.docs.has(link)) {
          console.log(`  ${id} --> ${linkId}`)
        }
      }
    }
  }
}

// ============================================================================
// sync 命令
// ============================================================================

async function runSync(target: 'components' | 'services' | 'all' = 'all') {
  console.log(`🔄 同步 ${target}...\n`)

  if (target === 'components' || target === 'all') {
    await syncComponents()
  }

  if (target === 'services' || target === 'all') {
    await syncServices()
  }
}

async function syncComponents() {
  const componentDirs = getDirs('src/components')
  const components: Record<string, string[]> = {}

  for (const dir of componentDirs) {
    const category = path.basename(dir.replace(/\/$/, ''))
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx'))
    components[category] = files.map((f) => path.basename(f, '.tsx'))
  }

  console.log('📦 组件清单:')
  let total = 0
  for (const [category, items] of Object.entries(components)) {
    console.log(`  ${category}: ${items.length} 个`)
    total += items.length
  }
  console.log(`  总计: ${total} 个组件\n`)

  // 输出可用于文档的格式
  console.log('```')
  for (const [category, items] of Object.entries(components)) {
    console.log(`### ${category}`)
    for (const item of items.slice(0, 10)) {
      console.log(`- ${item}`)
    }
    if (items.length > 10) console.log(`... +${items.length - 10} more`)
    console.log()
  }
  console.log('```')
}

async function syncServices() {
  const serviceDirs = getDirs('src/services')
  const services: { name: string; files: number }[] = []

  for (const dir of serviceDirs) {
    const name = path.basename(dir.replace(/\/$/, ''))
    const files = getAllTsFiles(dir)
    services.push({ name, files: files.length })
  }

  console.log('⚙️ 服务清单:')
  services.sort((a, b) => b.files - a.files)
  for (const svc of services) {
    console.log(`  ${svc.name}: ${svc.files} 个文件`)
  }
  console.log(`  总计: ${services.length} 个服务目录\n`)
}

// ============================================================================
// 命令定义
// ============================================================================

const docsCommand: CommandModule = {
  command: 'docs <action>',
  describe: '文档工具链',
  builder: (yargs) =>
    yargs
      .positional('action', {
        describe: '操作: validate | related | graph | sync',
        type: 'string',
        choices: ['validate', 'related', 'graph', 'sync'],
      })
      .option('path', {
        alias: 'p',
        describe: '目标路径 (用于 related)',
        type: 'string',
      })
      .option('format', {
        alias: 'f',
        describe: '输出格式 (用于 graph)',
        type: 'string',
        choices: ['json', 'mermaid'],
        default: 'json',
      })
      .option('target', {
        alias: 't',
        describe: '同步目标 (用于 sync)',
        type: 'string',
        choices: ['components', 'services', 'all'],
        default: 'all',
      }),
  handler: async (argv) => {
    const action = argv.action as string

    switch (action) {
      case 'validate':
        process.exit(await runValidate())
        break
      case 'related':
        if (!argv.path) {
          console.error('❌ 请指定路径: pnpm agent docs related -p <path>')
          process.exit(1)
        }
        await runRelated(argv.path as string)
        break
      case 'graph':
        await runGraph(argv.format as 'json' | 'mermaid')
        break
      case 'sync':
        await runSync(argv.target as 'components' | 'services' | 'all')
        break
    }
  },
}

export default docsCommand
