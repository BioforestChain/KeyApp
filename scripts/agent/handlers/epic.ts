/**
 * Epic 管理 - 大任务拆分和追踪
 */

import { execSync } from 'node:child_process'
import { ROOT, log } from '../utils'
import { createIssue } from './roadmap'

export interface EpicOptions {
  title: string
  description?: string
  roadmap?: string
  subIssues?: number[]  // 已存在的子 issue 编号
}

/**
 * 创建 Epic Issue
 * Epic 是一个特殊的 Issue，用 Tasklist 追踪子任务
 */
export function createEpic(options: EpicOptions): string | null {
  const { title, description = '', roadmap = 'V1', subIssues = [] } = options

  // 构建 Tasklist
  let tasklist = ''
  if (subIssues.length > 0) {
    tasklist = '\n\n## 子任务\n\n' + subIssues.map(n => `- [ ] #${n}`).join('\n')
  }

  const body = `${description}${tasklist}

---
*这是一个 Epic Issue，用于追踪大功能的多个子任务。*`

  const issueNumber = createIssue({
    title: `Epic: ${title}`,
    body,
    roadmap,
    category: 'feature',
  })

  return issueNumber
}

/**
 * 添加子任务到 Epic
 */
export function addSubIssueToEpic(epicNumber: number, subIssueNumber: number): boolean {
  try {
    // 获取当前 Epic body
    const output = execSync(
      `gh issue view ${epicNumber} --json body`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    const { body } = JSON.parse(output)

    // 检查是否已存在
    if (body.includes(`#${subIssueNumber}`)) {
      log.warn(`#${subIssueNumber} 已在 Epic #${epicNumber} 中`)
      return false
    }

    // 添加到 Tasklist
    let newBody: string
    if (body.includes('## 子任务')) {
      // 在子任务列表末尾添加
      newBody = body.replace(
        /(## 子任务\n\n(?:- \[[ x]\] #\d+\n?)*)/,
        `$1- [ ] #${subIssueNumber}\n`
      )
    } else {
      // 创建新的子任务部分
      newBody = body + `\n\n## 子任务\n\n- [ ] #${subIssueNumber}`
    }

    // 更新 Epic
    execSync(
      `gh issue edit ${epicNumber} --body "${newBody.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )

    log.success(`已添加 #${subIssueNumber} 到 Epic #${epicNumber}`)
    return true
  } catch (e) {
    log.error(`添加失败: ${e}`)
    return false
  }
}

/**
 * 列出所有 Epic
 */
export function listEpics(): void {
  try {
    const output = execSync(
      `gh issue list --label enhancement --search "Epic:" --json number,title,state,body --limit 20`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    const issues = JSON.parse(output)

    if (issues.length === 0) {
      console.log('没有找到 Epic Issues')
      return
    }

    console.log('# Epic Issues\n')

    for (const issue of issues) {
      const status = issue.state === 'OPEN' ? '🔄' : '✅'
      
      // 解析子任务进度
      const taskMatches = issue.body.match(/- \[([ x])\] #(\d+)/g) || []
      const total = taskMatches.length
      const done = taskMatches.filter((m: string) => m.includes('[x]')).length
      
      const progress = total > 0 ? `(${done}/${total})` : ''
      
      console.log(`${status} #${issue.number} ${issue.title} ${progress}`)
    }
  } catch (e) {
    log.error(`获取 Epic 列表失败: ${e}`)
  }
}

/**
 * 查看 Epic 详情
 */
export function viewEpic(epicNumber: number): void {
  try {
    const output = execSync(
      `gh issue view ${epicNumber} --json number,title,state,body,assignees`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    const issue = JSON.parse(output)

    console.log(`# Epic #${issue.number}: ${issue.title}\n`)
    console.log(`状态: ${issue.state === 'OPEN' ? '进行中' : '已完成'}`)
    if (issue.assignees?.length > 0) {
      console.log(`负责人: ${issue.assignees.map((a: { login: string }) => `@${a.login}`).join(', ')}`)
    }

    // 解析子任务
    const taskMatches = issue.body.match(/- \[([ x])\] #(\d+)/g) || []
    if (taskMatches.length > 0) {
      console.log(`\n## 子任务 (${taskMatches.filter((m: string) => m.includes('[x]')).length}/${taskMatches.length})\n`)
      
      for (const match of taskMatches) {
        const isDone = match.includes('[x]')
        const issueNum = match.match(/#(\d+)/)?.[1]
        const icon = isDone ? '✅' : '⬚'
        
        // 获取子 issue 标题
        try {
          const subOutput = execSync(
            `gh issue view ${issueNum} --json title,state`,
            { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
          )
          const subIssue = JSON.parse(subOutput)
          console.log(`  ${icon} #${issueNum} ${subIssue.title}`)
        } catch {
          console.log(`  ${icon} #${issueNum} (无法获取标题)`)
        }
      }
    }
  } catch (e) {
    log.error(`获取 Epic 详情失败: ${e}`)
  }
}

/**
 * 同步 Epic 子任务状态
 * 检查子 issues 的状态，更新 Tasklist checkbox
 */
export function syncEpicStatus(epicNumber: number): void {
  try {
    const output = execSync(
      `gh issue view ${epicNumber} --json body`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
    )
    const { body } = JSON.parse(output)

    // 提取所有子 issue 编号
    const taskMatches = [...body.matchAll(/- \[([ x])\] #(\d+)/g)]
    if (taskMatches.length === 0) {
      console.log('没有找到子任务')
      return
    }

    let newBody = body
    let updated = 0

    for (const match of taskMatches) {
      const currentState = match[1]
      const issueNum = match[2]

      try {
        const subOutput = execSync(
          `gh issue view ${issueNum} --json state`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
        )
        const { state } = JSON.parse(subOutput)
        const shouldBeDone = state === 'CLOSED'
        const isDone = currentState === 'x'

        if (shouldBeDone !== isDone) {
          const oldPattern = `- [${currentState}] #${issueNum}`
          const newPattern = `- [${shouldBeDone ? 'x' : ' '}] #${issueNum}`
          newBody = newBody.replace(oldPattern, newPattern)
          updated++
        }
      } catch {
        // 忽略无法获取的 issue
      }
    }

    if (updated > 0) {
      execSync(
        `gh issue edit ${epicNumber} --body "${newBody.replace(/"/g, '\\"')}"`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT }
      )
      log.success(`已同步 ${updated} 个子任务状态`)
    } else {
      console.log('所有子任务状态已是最新')
    }
  } catch (e) {
    log.error(`同步失败: ${e}`)
  }
}
