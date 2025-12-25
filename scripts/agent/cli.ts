#!/usr/bin/env bun
/**
 * AI Agent CLI - 主入口
 *
 * Usage:
 *   pnpm agent readme                          # 输出索引（最佳实践 + 知识地图）
 *   pnpm agent roadmap [version]               # 查看任务列表
 *   pnpm agent claim <issue#>                  # 领取任务
 *   pnpm agent done <issue#>                   # 完成任务
 *   pnpm agent create <title>                  # 创建任务
 *   pnpm agent epic create <title>             # 创建 Epic
 *   pnpm agent epic list                       # 查看 Epic 列表
 *   pnpm agent epic view <#>                   # 查看 Epic 详情
 *   pnpm agent epic sync <#>                   # 同步 Epic 子任务状态
 *   pnpm agent epic add <epic#> <issue#>       # 添加子任务到 Epic
 *   pnpm agent stats                           # 进度统计
 *   pnpm agent toc                             # 白皮书目录
 *   pnpm agent chapter <name>                  # 查阅白皮书章节
 *   pnpm agent worktree create <name> --branch <branch> [--base main]
 *   pnpm agent worktree delete <name> [--force]
 *   pnpm agent worktree list
 *   pnpm agent practice list|add|remove|update
 */

import { log } from './utils'
import { printIndex } from './readme'
import {
  printRoadmap,
  claimIssue,
  completeIssue,
  createIssue,
  printStats,
} from './roadmap'
import {
  createEpic,
  listEpics,
  viewEpic,
  syncEpicStatus,
  addSubIssueToEpic,
} from './epic'
import { printWhiteBookToc, printChapterContent } from './whitebook'
import { createWorktree, deleteWorktree, listWorktrees } from './worktree'
import { addPractice, listPractices, removePractice, updatePractice } from './practice'

function printHelp(): void {
  console.log(`
AI Agent CLI

Usage:
  pnpm agent readme                          # 输出索引（最佳实践 + 知识地图）
  pnpm agent --help                          # 查看帮助
  pnpm agent roadmap [current|v1|v2|draft]   # 查看任务列表
  pnpm agent claim <issue#>                  # 领取任务（分配给自己）
  pnpm agent done <issue#>                   # 完成任务（关闭 Issue）
  pnpm agent create <title>                  # 创建新任务
    [--body <描述>] [--roadmap v1|v2|draft] [--category feature|bug|refactor]
  pnpm agent stats                           # 查看进度统计
  pnpm agent toc                             # 白皮书目录结构
  pnpm agent chapter <name>                  # 查阅白皮书章节

Epic 管理:
  pnpm agent epic create <title>             # 创建 Epic
    [--desc <描述>] [--roadmap v1] [--issues 1,2,3]
  pnpm agent epic list                       # 查看所有 Epic
  pnpm agent epic view <#>                   # 查看 Epic 详情
  pnpm agent epic sync <#>                   # 同步子任务状态
  pnpm agent epic add <epic#> <issue#>       # 添加子任务到 Epic

Worktree 管理:
  pnpm agent worktree create <name> --branch <branch> [--base main]
  pnpm agent worktree delete <name> [--force]
  pnpm agent worktree list
  分支前缀仅允许: feat/, fix/, docs/, test/, refactor/, chore/, ci/, openspec/, release/

最佳实践管理:
  pnpm agent practice list
  pnpm agent practice add "<内容>"
  pnpm agent practice remove <序号|内容>
  pnpm agent practice update <序号> "<内容>"

Aliases: CURRENT -> V1, NEXT -> V2

Examples:
  pnpm agent readme
  pnpm agent roadmap current
  pnpm agent claim 28
  pnpm agent create "修复某个问题" --category bug --roadmap v1
  pnpm agent epic create "大功能" --roadmap v1 --issues 44,45,46
  pnpm agent worktree create issue-28 --branch feat/issue-28
  pnpm agent practice list
`)
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  if (index === -1) return undefined
  return args[index + 1]
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag)
}

function runLegacy(args: string[]): boolean {
  const knownFlags = new Set(['--roadmap', '--claim', '--done', '--create', '--stats', '--toc', '--chapter', '--epic'])
  if (!args.some(arg => knownFlags.has(arg))) return false

  log.warn('检测到旧版参数，建议使用子命令形式（例如：pnpm agent roadmap current）')

  const claimIndex = args.indexOf('--claim')
  if (claimIndex !== -1 && args[claimIndex + 1]) {
    claimIssue(args[claimIndex + 1])
    return true
  }

  const doneIndex = args.indexOf('--done')
  if (doneIndex !== -1 && args[doneIndex + 1]) {
    completeIssue(args[doneIndex + 1])
    return true
  }

  if (args.includes('--stats')) {
    printStats()
    return true
  }

  const createIndex = args.indexOf('--create')
  if (createIndex !== -1 && args[createIndex + 1]) {
    const title = args[createIndex + 1]
    const body = getFlagValue(args, '--body')
    const roadmap = getFlagValue(args, '--roadmap')
    const category = getFlagValue(args, '--category')
    createIssue({
      title,
      body,
      roadmap: roadmap ?? 'DRAFT',
      category: category ?? 'feature',
    })
    return true
  }

  const roadmapIndex = args.indexOf('--roadmap')
  if (roadmapIndex !== -1) {
    printRoadmap(args[roadmapIndex + 1])
    return true
  }

  const epicIndex = args.indexOf('--epic')
  if (epicIndex !== -1) {
    handleEpic(args.slice(epicIndex + 1))
    return true
  }

  if (args.includes('--toc')) {
    printWhiteBookToc()
    return true
  }

  const chapterIndex = args.indexOf('--chapter')
  if (chapterIndex !== -1 && args[chapterIndex + 1]) {
    log.section(`章节: ${args[chapterIndex + 1]}`)
    printChapterContent(args[chapterIndex + 1])
    return true
  }

  return false
}

function handleEpic(args: string[]): void {
  const subCommand = args[0]

  switch (subCommand) {
    case 'create': {
      const title = args[1]
      if (!title) {
        log.error('请提供 Epic 标题')
        process.exit(1)
      }
      const desc = getFlagValue(args, '--desc')
      const roadmap = getFlagValue(args, '--roadmap')
      const issuesRaw = getFlagValue(args, '--issues')
      const subIssues = issuesRaw
        ? issuesRaw.split(',').map(value => parseInt(value.trim(), 10)).filter(Boolean)
        : []

      createEpic({
        title,
        description: desc,
        roadmap: roadmap ?? 'V1',
        subIssues,
      })
      break
    }

    case 'list':
      listEpics()
      break

    case 'view': {
      const epicNum = parseInt(args[1] ?? '', 10)
      if (!epicNum) {
        log.error('请提供 Epic 编号')
        process.exit(1)
      }
      viewEpic(epicNum)
      break
    }

    case 'sync': {
      const epicNum = parseInt(args[1] ?? '', 10)
      if (!epicNum) {
        log.error('请提供 Epic 编号')
        process.exit(1)
      }
      syncEpicStatus(epicNum)
      break
    }

    case 'add': {
      const epicNum = parseInt(args[1] ?? '', 10)
      const issueNum = parseInt(args[2] ?? '', 10)
      if (!epicNum || !issueNum) {
        log.error('请提供 Epic 编号和 Issue 编号')
        process.exit(1)
      }
      addSubIssueToEpic(epicNum, issueNum)
      break
    }

    default:
      log.error(`未知的 Epic 子命令: ${subCommand}`)
      console.log('可用命令: create, list, view, sync, add')
      process.exit(1)
  }
}

function handleWorktree(args: string[]): void {
  const subCommand = args[0]

  switch (subCommand) {
    case 'create': {
      const name = args[1]
      const branch = getFlagValue(args, '--branch')
      const base = getFlagValue(args, '--base')
      createWorktree({ name, branch, base })
      break
    }

    case 'delete': {
      const name = args[1]
      const force = hasFlag(args, '--force')
      deleteWorktree({ name, force })
      break
    }

    case 'list':
      listWorktrees()
      break

    default:
      log.error(`未知的 worktree 子命令: ${subCommand}`)
      console.log('可用命令: create, delete, list')
      process.exit(1)
  }
}

function handlePractice(args: string[]): void {
  const subCommand = args[0]

  if (!subCommand) {
    listPractices()
    return
  }

  if (subCommand === '--help' || subCommand === '-h') {
    console.log('用法: pnpm agent practice list|add|remove|update')
    return
  }

  switch (subCommand) {
    case 'list':
      listPractices()
      break

    case 'add':
      addPractice(args.slice(1).join(' '))
      break

    case 'remove':
      removePractice(args.slice(1).join(' '))
      break

    case 'update': {
      const index = args[1]
      const text = args.slice(2).join(' ')
      updatePractice(index, text)
      break
    }

    default:
      log.error(`未知的 practice 子命令: ${subCommand}`)
      console.log('可用命令: list, add, remove, update')
      process.exit(1)
  }
}

function main(): void {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    printHelp()
    return
  }

  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    return
  }

  if (runLegacy(args)) {
    return
  }

  const [command, ...rest] = args

  switch (command) {
    case 'readme':
      printIndex()
      break

    case 'roadmap':
      printRoadmap(rest[0])
      break

    case 'claim':
      if (!rest[0]) {
        log.error('请提供 Issue 编号')
        process.exit(1)
      }
      claimIssue(rest[0])
      break

    case 'done':
      if (!rest[0]) {
        log.error('请提供 Issue 编号')
        process.exit(1)
      }
      completeIssue(rest[0])
      break

    case 'create': {
      const title = rest[0]
      if (!title) {
        log.error('请提供 Issue 标题')
        process.exit(1)
      }
      const body = getFlagValue(rest, '--body')
      const roadmap = getFlagValue(rest, '--roadmap')
      const category = getFlagValue(rest, '--category')
      createIssue({
        title,
        body,
        roadmap: roadmap ?? 'DRAFT',
        category: category ?? 'feature',
      })
      break
    }

    case 'stats':
      printStats()
      break

    case 'toc':
      printWhiteBookToc()
      break

    case 'chapter': {
      const chapterName = rest[0]
      if (!chapterName) {
        log.error('请提供章节路径')
        process.exit(1)
      }
      log.section(`章节: ${chapterName}`)
      printChapterContent(chapterName)
      break
    }

    case 'epic':
      handleEpic(rest)
      break

    case 'worktree':
      handleWorktree(rest)
      break

    case 'practice':
      handlePractice(rest)
      break

    case 'help':
      log.error('请使用 --help 查看帮助')
      printHelp()
      process.exit(1)
      break

    default:
      log.error(`未知命令: ${command}`)
      printHelp()
      process.exit(1)
  }
}

main()
