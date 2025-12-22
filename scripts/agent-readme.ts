#!/usr/bin/env bun
/**
 * AI Agent 索引脚本
 *
 * 为 AI 提供项目索引：最佳实践（纠正直觉）+ 知识地图（按需查阅）+ Roadmap（任务追踪）
 *
 * Usage:
 *   bun scripts/agent-readme.ts              # 输出索引（最佳实践 + 知识地图）
 *   bun scripts/agent-readme.ts --roadmap    # 查看 GitHub Project 任务列表
 *   bun scripts/agent-readme.ts --chapter <name>  # 输出指定章节内容
 *
 * Examples:
 *   bun scripts/agent-readme.ts --chapter 03-架构篇/03-导航系统
 *   bun scripts/agent-readme.ts --roadmap
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { execSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const WHITE_BOOK_DIR = join(ROOT, 'docs/white-book')

const PROJECT_NUMBER = 5
const PROJECT_OWNER = 'BioforestChain'

// 版本别名，CURRENT 指向当前活跃版本
const RELEASE_ALIASES: Record<string, string> = {
  CURRENT: 'V1',
  NEXT: 'V2',
}

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  title: (msg: string) => console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.bold}${colors.green}## ${msg}${colors.reset}\n`),
  subsection: (msg: string) => console.log(`\n${colors.yellow}### ${msg}${colors.reset}\n`),
  info: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
}

interface ChapterInfo {
  name: string
  path: string
  indexPath?: string
  subChapters: ChapterInfo[]
}

function getChapters(dir: string): ChapterInfo[] {
  if (!existsSync(dir)) return []

  const items = readdirSync(dir)
    .filter(item => !item.startsWith('.'))
    .sort()

  const chapters: ChapterInfo[] = []

  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      const indexPath = join(fullPath, 'index.md')
      const subChapters = getChapters(fullPath)

      chapters.push({
        name: item,
        path: fullPath,
        indexPath: existsSync(indexPath) ? indexPath : undefined,
        subChapters,
      })
    } else if (item.endsWith('.md') && item !== 'index.md') {
      chapters.push({
        name: item.replace('.md', ''),
        path: fullPath,
        subChapters: [],
      })
    }
  }

  return chapters
}

function printToc(chapters: ChapterInfo[], indent = 0): void {
  for (const chapter of chapters) {
    const prefix = '  '.repeat(indent)
    const relPath = relative(WHITE_BOOK_DIR, chapter.path)
    console.log(`${prefix}- ${chapter.name} (${relPath})`)
    if (chapter.subChapters.length > 0) {
      printToc(chapter.subChapters, indent + 1)
    }
  }
}

function readMarkdownFile(filePath: string): string {
  if (!existsSync(filePath)) return ''
  return readFileSync(filePath, 'utf-8')
}

function printChapterContent(chapterPath: string): void {
  const fullPath = join(WHITE_BOOK_DIR, chapterPath)

  if (!existsSync(fullPath)) {
    console.error(`${colors.red}错误: 章节不存在: ${chapterPath}${colors.reset}`)
    process.exit(1)
  }

  const stat = statSync(fullPath)

  if (stat.isDirectory()) {
    const indexPath = join(fullPath, 'index.md')
    if (existsSync(indexPath)) {
      console.log(readMarkdownFile(indexPath))
    }

    // 输出子章节
    const subFiles = readdirSync(fullPath)
      .filter(f => f.endsWith('.md') && f !== 'index.md')
      .sort()

    for (const subFile of subFiles) {
      log.subsection(subFile.replace('.md', ''))
      console.log(readMarkdownFile(join(fullPath, subFile)))
    }
  } else if (fullPath.endsWith('.md')) {
    console.log(readMarkdownFile(fullPath))
  }
}

interface RoadmapItem {
  title: string
  status: string
  release: string | null
  issueNumber: number | null
  assignees: string[]
}

function fetchRoadmap(): RoadmapItem[] {
  try {
    const output = execSync(
      `gh project item-list ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --format json`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    )
    const data = JSON.parse(output)
    return data.items.map((item: {
      title: string
      status: string
      release?: string
      content?: { number?: number }
      assignees?: string[]
    }) => ({
      title: item.title,
      status: item.status,
      release: item.release || null,
      issueNumber: item.content?.number || null,
      assignees: item.assignees || [],
    }))
  } catch {
    return []
  }
}

function resolveRelease(input: string): string {
  const upper = input.toUpperCase()
  return RELEASE_ALIASES[upper] || upper
}

function printRoadmap(releaseFilter?: string): void {
  const allItems = fetchRoadmap()
  if (allItems.length === 0) {
    console.log('无法获取 Roadmap，请确保已配置 gh auth (需要 project scope)')
    return
  }

  // 解析别名
  const resolvedFilter = releaseFilter ? resolveRelease(releaseFilter) : undefined
  const displayName = releaseFilter?.toUpperCase()
  const isAlias = releaseFilter && resolvedFilter !== releaseFilter.toUpperCase()

  const items = resolvedFilter
    ? allItems.filter(i => i.release?.toUpperCase() === resolvedFilter)
    : allItems

  const title = resolvedFilter
    ? `KeyApp Roadmap - ${displayName}${isAlias ? ` (${resolvedFilter})` : ''}`
    : 'KeyApp Roadmap'
  console.log(`# ${title}\n`)
  console.log(`> GitHub Project: https://github.com/orgs/${PROJECT_OWNER}/projects/${PROJECT_NUMBER}\n`)

  if (resolvedFilter && items.length === 0) {
    console.log(`没有找到 ${displayName} 版本的任务。\n`)
    console.log('可用版本: V1, V2, V3, DRAFT, CURRENT, NEXT')
    return
  }

  // 按版本分组（如果没有过滤）
  if (!releaseFilter) {
    const releases = ['V1', 'V2', 'V3', 'DRAFT', null]
    for (const release of releases) {
      const releaseItems = allItems.filter(i => 
        release === null ? !i.release : i.release === release
      )
      if (releaseItems.length === 0) continue
      
      console.log(`## ${release || '未分配'}\n`)
      printStatusGroups(releaseItems)
    }
  } else {
    printStatusGroups(items)
  }
}

function printStatusGroups(items: RoadmapItem[], showDetails = false): void {
  const grouped = {
    'In Progress': items.filter(i => i.status === 'In Progress'),
    Todo: items.filter(i => i.status === 'Todo'),
    Done: items.filter(i => i.status === 'Done'),
  }

  for (const [status, tasks] of Object.entries(grouped)) {
    if (tasks.length === 0) continue
    for (const task of tasks) {
      const icon = status === 'Done' ? '✅' : status === 'In Progress' ? '🔄' : '⬚'
      const issueRef = task.issueNumber ? `#${task.issueNumber}` : ''
      const assignee = task.assignees.length > 0 ? ` @${task.assignees.join(', @')}` : ''
      
      if (showDetails || task.issueNumber) {
        console.log(`- ${icon} ${issueRef} ${task.title}${assignee}`)
      } else {
        console.log(`- ${icon} ${task.title}`)
      }
    }
  }
  console.log()
}

function printBestPractices(): void {
  console.log(`
# 最佳实践

❌ Radix Dialog / position:fixed → ✅ Stackflow BottomSheet/Modal
❌ React Router → ✅ Stackflow push/pop/replace
❌ 复制 mpay 代码 → ✅ 理解后用 React/TS 重写
❌ 随意创建 store → ✅ 遵循 stores/ 现有模式
❌ 明文选择器 → ✅ data-testid
❌ 安装新 UI 库 → ✅ shadcn/ui（已集成）
❌ 新建 CSS → ✅ Tailwind CSS

详见: pnpm agent --chapter 00-必读
`)
}

function printKnowledgeMap(): void {
  console.log(`
# 知识地图

代码:
  src/stackflow/   → 导航配置、Activity (添加页面/Sheet/Modal)
  src/services/    → 服务层、Adapter 模式
  src/stores/      → TanStack Store 状态管理
  src/components/  → UI 组件
  src/i18n/        → 国际化

白皮书 (pnpm agent --chapter <路径>):
  03-架构篇/03-导航系统/  → 页面跳转、Tab
  04-服务篇/01-服务架构/  → 服务分层、Adapter
  05-组件篇/01-基础组件/  → Sheet、Dialog
  04-服务篇/08-钱包数据存储/  → 钱包数据
  07-国际化篇/  → 多语言
  08-测试篇/03-Playwright配置/e2e-best-practices.md  → E2E 测试
  附录/C-mpay迁移指南/  → mpay 参考

外部文档:
  Stackflow: https://stackflow.so/llms-full.txt
  shadcn/ui: https://ui.shadcn.com/docs
  TanStack:  https://tanstack.com/query/latest

mpay 原始代码: /Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/
  pages/home/home.component.ts  → 首页
  pages/mnemonic/pages/home-transfer/  → 转账
  pages/authorize/pages/signature/  → DWEB 授权
  services/expansion-tools/wallet-data-stroage.ts  → 钱包存储
`)
}

function claimIssue(issueNumber: string): void {
  try {
    // 设置 assignee 为当前用户
    execSync(
      `gh issue edit ${issueNumber} --add-assignee @me`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    console.log(`✅ 已领取 Issue #${issueNumber}`)
    console.log(`\n下一步：`)
    console.log(`  1. git worktree add .git-worktree/issue-${issueNumber} -b feat/issue-${issueNumber}`)
    console.log(`  2. cd .git-worktree/issue-${issueNumber} && pnpm install`)
    console.log(`  3. 开始开发...`)
    console.log(`  4. PR 描述中使用 "Closes #${issueNumber}" 自动关联`)
  } catch (e) {
    console.error(`❌ 领取失败: ${e}`)
  }
}

function completeIssue(issueNumber: string): void {
  try {
    execSync(
      `gh issue close ${issueNumber} --reason completed`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    console.log(`✅ 已完成 Issue #${issueNumber}`)
  } catch (e) {
    console.error(`❌ 完成失败: ${e}`)
  }
}

interface CreateIssueOptions {
  title: string
  body?: string
  roadmap?: string   // V1, V2, DRAFT
  category?: string  // feature, bug, refactor, docs
}

function createIssue(options: CreateIssueOptions): void {
  const { title, body = '', roadmap = 'DRAFT', category = 'feature' } = options
  
  // 确定 label
  const labelMap: Record<string, string> = {
    feature: 'enhancement',
    bug: 'bug',
    refactor: 'refactor',
    docs: 'documentation',
    test: 'test',
  }
  const label = labelMap[category.toLowerCase()] || 'enhancement'
  
  // 构建 body
  const fullBody = `${body}

**Roadmap**: ${roadmap.toUpperCase()}
**Category**: ${category.charAt(0).toUpperCase() + category.slice(1)}`

  try {
    const output = execSync(
      `gh issue create --title "${title.replace(/"/g, '\\"')}" --body "${fullBody.replace(/"/g, '\\"')}" --label "${label}" --project "KeyApp Roadmap"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    const issueUrl = output.trim()
    const issueNumber = issueUrl.split('/').pop()
    
    console.log(`✅ 已创建 Issue ${issueUrl}`)
    
    // 自动设置 Release 字段
    try {
      const releaseOptionMap: Record<string, string> = {
        V1: '9359aa58',
        V2: '6a3e495d',
        V3: '7e413227',
        DRAFT: 'd75e4b65',
      }
      const optionId = releaseOptionMap[roadmap.toUpperCase()]
      if (optionId) {
        // 获取 project item ID
        const itemsJson = execSync(
          `gh project item-list ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --format json`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
        )
        const items = JSON.parse(itemsJson)
        const item = items.items.find((i: { content?: { number?: number } }) => 
          i.content?.number === parseInt(issueNumber || '0')
        )
        if (item) {
          execSync(
            `gh project item-edit --project-id PVT_kwDOBJVmF84BLGhY --id "${item.id}" --field-id PVTSSF_lADOBJVmF84BLGhYzg6xpp8 --single-select-option-id ${optionId}`,
            { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
          )
          console.log(`✅ 已设置 Release 为 ${roadmap.toUpperCase()}`)
        }
      }
    } catch {
      console.log(`⚠️ Release 字段设置失败，请手动设置`)
    }
    
    console.log(`\n下一步：`)
    console.log(`  pnpm agent --claim ${issueNumber}  # 领取任务`)
  } catch (e) {
    console.error(`❌ 创建失败: ${e}`)
  }
}

function printStats(): void {
  const items = fetchRoadmap()
  if (items.length === 0) {
    console.log('无法获取统计数据')
    return
  }

  const releases = ['V1', 'V2', 'V3', 'DRAFT']
  
  console.log('# 进度统计\n')

  for (const release of releases) {
    const releaseItems = items.filter(i => i.release === release)
    if (releaseItems.length === 0) continue

    const todo = releaseItems.filter(i => i.status === 'Todo').length
    const inProgress = releaseItems.filter(i => i.status === 'In Progress').length
    const done = releaseItems.filter(i => i.status === 'Done').length
    const total = releaseItems.length
    const progress = Math.round((done / total) * 100)
    const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10))

    console.log(`${release}: ${bar} ${progress}% (${done}/${total} done, ${inProgress} wip, ${todo} todo)`)
  }
  console.log()
}

function printWorkflow(): void {
  console.log(`
# 工作流

pnpm agent --claim <#>   领取任务 (自动分配+worktree指引)
pnpm agent --create "x"  创建任务 (--category bug --roadmap v1)
pnpm agent --chapter <x> 查阅白皮书
pnpm agent --stats       进度统计

PR 规则: 描述中使用 Closes #issue编号 自动关联
`)
}

function printCurrentTasks(): void {
  const items = fetchRoadmap()
  const currentItems = items.filter(i => {
    const release = i.release?.toUpperCase()
    return release === resolveRelease('CURRENT')
  })

  if (currentItems.length === 0) return

  const inProgress = currentItems.filter(i => i.status === 'In Progress')
  const todo = currentItems.filter(i => i.status === 'Todo')
  const done = currentItems.filter(i => i.status === 'Done')

  console.log(`
# 当前任务 (${resolveRelease('CURRENT')}) ${done.length}/${currentItems.length} done
`)

  if (inProgress.length > 0) {
    console.log('进行中:')
    for (const t of inProgress) {
      console.log(`  #${t.issueNumber} ${t.title}${t.assignees.length ? ` @${t.assignees.join(',')}` : ''}`)
    }
  }

  if (todo.length > 0) {
    console.log('待领取:')
    for (const t of todo) {
      console.log(`  #${t.issueNumber} ${t.title}`)
    }
  }
  console.log()
}

function printIndex(): void {
  console.log(`# KeyApp AI 开发索引
`)

  printBestPractices()
  printKnowledgeMap()
  printCurrentTasks()
  printWorkflow()
}

function main(): void {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AI Agent 索引脚本

Usage:
  bun scripts/agent-readme.ts                    # 输出索引（最佳实践 + 知识地图）
  bun scripts/agent-readme.ts --roadmap          # 查看所有版本任务列表
  bun scripts/agent-readme.ts --roadmap current  # 查看当前版本任务
  bun scripts/agent-readme.ts --claim <issue#>   # 领取任务（分配给自己）
  bun scripts/agent-readme.ts --done <issue#>    # 完成任务（关闭 Issue）
  bun scripts/agent-readme.ts --create <title>   # 创建新任务（自动设置版本）
    [--body <描述>] [--roadmap v1|v2|draft] [--category feature|bug|refactor]
  bun scripts/agent-readme.ts --stats            # 查看进度统计
  bun scripts/agent-readme.ts --toc              # 白皮书目录结构
  bun scripts/agent-readme.ts --chapter <name>   # 查阅白皮书章节

Aliases: CURRENT -> V1, NEXT -> V2

Examples:
  bun scripts/agent-readme.ts --roadmap current
  bun scripts/agent-readme.ts --claim 28
  bun scripts/agent-readme.ts --create "修复某个问题" --category bug --roadmap v1
  bun scripts/agent-readme.ts --create "探索：新功能想法" --roadmap draft
`)
    process.exit(0)
  }

  const roadmapIndex = args.indexOf('--roadmap')
  if (roadmapIndex !== -1) {
    const releaseFilter = args[roadmapIndex + 1]
    printRoadmap(releaseFilter)
    process.exit(0)
  }

  const claimIndex = args.indexOf('--claim')
  if (claimIndex !== -1 && args[claimIndex + 1]) {
    claimIssue(args[claimIndex + 1])
    process.exit(0)
  }

  const doneIndex = args.indexOf('--done')
  if (doneIndex !== -1 && args[doneIndex + 1]) {
    completeIssue(args[doneIndex + 1])
    process.exit(0)
  }

  if (args.includes('--stats')) {
    printStats()
    process.exit(0)
  }

  const createIndex = args.indexOf('--create')
  if (createIndex !== -1 && args[createIndex + 1]) {
    const title = args[createIndex + 1]
    const bodyIndex = args.indexOf('--body')
    const roadmapIndex2 = args.indexOf('--roadmap', createIndex)
    const categoryIndex = args.indexOf('--category')
    
    createIssue({
      title,
      body: bodyIndex !== -1 ? args[bodyIndex + 1] : undefined,
      roadmap: roadmapIndex2 !== -1 ? args[roadmapIndex2 + 1] : 'DRAFT',
      category: categoryIndex !== -1 ? args[categoryIndex + 1] : 'feature',
    })
    process.exit(0)
  }

  if (args.includes('--toc')) {
    console.log('# 白皮书目录结构\n')
    const chapters = getChapters(WHITE_BOOK_DIR)
    printToc(chapters)
    process.exit(0)
  }

  const chapterIndex = args.indexOf('--chapter')
  if (chapterIndex !== -1 && args[chapterIndex + 1]) {
    const chapterName = args[chapterIndex + 1]
    log.section(`章节: ${chapterName}`)
    printChapterContent(chapterName)
    process.exit(0)
  }

  printIndex()
}

main()
