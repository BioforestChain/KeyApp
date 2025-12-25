/**
 * GitHub Project / Issue 管理
 */

import { execSync } from 'node:child_process'
import {
  ROOT,
  PROJECT_NUMBER,
  PROJECT_OWNER,
  PROJECT_ID,
  RELEASE_FIELD_ID,
  RELEASE_OPTIONS,
  resolveRelease,
  log,
} from '../utils'

export interface RoadmapItem {
  id: string
  title: string
  status: string
  release: string | null
  issueNumber: number | null
  issueUrl: string | null
  assignees: string[]
}

export function fetchRoadmap(): RoadmapItem[] {
  try {
    const output = execSync(
      `gh project item-list ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --format json`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    )
    const data = JSON.parse(output)
    return data.items.map((item: {
      id: string
      title: string
      status: string
      release?: string
      content?: { number?: number; url?: string }
      assignees?: string[]
    }) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      release: item.release || null,
      issueNumber: item.content?.number || null,
      issueUrl: item.content?.url || null,
      assignees: item.assignees || [],
    }))
  } catch {
    return []
  }
}

export function printRoadmap(releaseFilter?: string): void {
  const allItems = fetchRoadmap()
  if (allItems.length === 0) {
    console.log('无法获取 Roadmap，请确保已配置 gh auth (需要 project scope)')
    return
  }

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

function printStatusGroups(items: RoadmapItem[]): void {
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
      console.log(`- ${icon} ${issueRef} ${task.title}${assignee}`)
    }
  }
  console.log()
}

export function claimIssue(issueNumber: string): void {
  try {
    execSync(
      `gh issue edit ${issueNumber} --add-assignee @me`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    log.success(`已领取 Issue #${issueNumber}`)
    console.log(`\n下一步：`)
    console.log(`  1. pnpm agent worktree create issue-${issueNumber} --branch feat/issue-${issueNumber}`)
    console.log(`  2. cd .git-worktree/issue-${issueNumber}`)
    console.log(`  3. 开始开发...`)
    console.log(`  4. PR 描述中使用 \"Closes #${issueNumber}\" 自动关联`)
  } catch (e) {
    log.error(`领取失败: ${e}`)
  }
}

export function completeIssue(issueNumber: string): void {
  try {
    execSync(
      `gh issue close ${issueNumber} --reason completed`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    log.success(`已完成 Issue #${issueNumber}`)
  } catch (e) {
    log.error(`完成失败: ${e}`)
  }
}

export interface CreateIssueOptions {
  title: string
  body?: string
  roadmap?: string
  category?: string
}

export function createIssue(options: CreateIssueOptions): string | null {
  const { title, body = '', roadmap = 'DRAFT', category = 'feature' } = options
  
  const labelMap: Record<string, string> = {
    feature: 'enhancement',
    bug: 'bug',
    refactor: 'refactor',
    docs: 'documentation',
    test: 'test',
  }
  const label = labelMap[category.toLowerCase()] || 'enhancement'
  
  const fullBody = `${body}

**Roadmap**: ${roadmap.toUpperCase()}
**Category**: ${category.charAt(0).toUpperCase() + category.slice(1)}`

  try {
    const output = execSync(
      `gh issue create --title "${title.replace(/"/g, '\\"')}" --body "${fullBody.replace(/"/g, '\\"')}" --label "${label}" --project "KeyApp Roadmap"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    const issueUrl = output.trim()
    const issueNumber = issueUrl.split('/').pop() || null
    
    log.success(`已创建 Issue ${issueUrl}`)
    
    // 设置 Release 字段
    if (issueNumber) {
      setIssueRelease(parseInt(issueNumber), roadmap.toUpperCase())
    }
    
    console.log(`\n下一步：`)
    console.log(`  pnpm agent claim ${issueNumber}  # 领取任务`)
    
    return issueNumber
  } catch (e) {
    log.error(`创建失败: ${e}`)
    return null
  }
}

export function setIssueRelease(issueNumber: number, release: string): boolean {
  try {
    const optionId = RELEASE_OPTIONS[release.toUpperCase()]
    if (!optionId) return false

    const items = fetchRoadmap()
    const item = items.find(i => i.issueNumber === issueNumber)
    
    if (item) {
      execSync(
        `gh project item-edit --project-id ${PROJECT_ID} --id "${item.id}" --field-id ${RELEASE_FIELD_ID} --single-select-option-id ${optionId}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      )
      log.success(`已设置 Release 为 ${release.toUpperCase()}`)
      return true
    }
    return false
  } catch {
    log.warn(`Release 字段设置失败，请手动设置`)
    return false
  }
}

export function addIssueToProject(issueNumber: number): boolean {
  try {
    execSync(
      `gh project item-add ${PROJECT_NUMBER} --owner ${PROJECT_OWNER} --url "https://github.com/BioforestChain/KeyApp/issues/${issueNumber}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    )
    return true
  } catch {
    return false
  }
}

export function printStats(): void {
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
