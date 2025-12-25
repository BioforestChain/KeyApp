/**
 * AI Agent 索引输出
 */

import { fetchRoadmap, printStats } from './roadmap'
import { resolveRelease } from '../utils'
import { printBestPracticesContent } from './practice'

export function printBestPractices(): void {
  printBestPracticesContent()
  console.log('详见: pnpm agent chapter 00-必读\n')
}

export function printKnowledgeMap(): void {
  console.log(`
# 知识地图

代码:
  src/stackflow/   → 导航配置、Activity (添加页面/Sheet/Modal)
  src/services/    → 服务层、Adapter 模式
  src/stores/      → TanStack Store 状态管理
  src/queries/     → TanStack Query 数据获取
  src/components/  → UI 组件
  src/i18n/        → 国际化

白皮书 (pnpm agent chapter <路径>):
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
`)
}

export function printCurrentTasks(): void {
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

export function printWorkflow(): void {
  console.log(`
# 工作流

pnpm agent readme             启动入口（索引 + 知识地图 + 最佳实践）
pnpm agent practice list      最佳实践列表
pnpm agent claim <#>          领取任务 (自动分配+worktree指引)
pnpm agent create "x"         创建任务 (--category bug --roadmap v1)
pnpm agent epic create "x"    创建 Epic (--roadmap v1)
pnpm agent epic list          查看所有 Epic
pnpm agent chapter <x>        查阅白皮书
pnpm agent stats              进度统计
pnpm agent worktree create <name> --branch <branch> [--base main]
pnpm agent worktree list      worktree 概览
pnpm agent worktree delete <name> [--force]

PR 规则: 描述中使用 Closes #issue编号 自动关联
合并门禁: 合并前必须告知当前 worktree 路径并征求用户确认
`)
}

export function printIndex(): void {
  console.log(`# KeyApp AI 开发索引
`)

  printBestPractices()
  printKnowledgeMap()
  printCurrentTasks()
  printWorkflow()
}
