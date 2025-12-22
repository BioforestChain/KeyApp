#!/usr/bin/env bun
/**
 * AI Agent CLI - 主入口
 *
 * Usage:
 *   pnpm agent                              # 输出索引（最佳实践 + 知识地图）
 *   pnpm agent --roadmap [version]          # 查看任务列表
 *   pnpm agent --claim <issue#>             # 领取任务
 *   pnpm agent --done <issue#>              # 完成任务
 *   pnpm agent --create <title>             # 创建任务
 *   pnpm agent --epic create <title>        # 创建 Epic
 *   pnpm agent --epic list                  # 查看 Epic 列表
 *   pnpm agent --epic view <#>              # 查看 Epic 详情
 *   pnpm agent --epic sync <#>              # 同步 Epic 子任务状态
 *   pnpm agent --epic add <epic#> <issue#>  # 添加子任务到 Epic
 *   pnpm agent --stats                      # 进度统计
 *   pnpm agent --toc                        # 白皮书目录
 *   pnpm agent --chapter <name>             # 查阅白皮书章节
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

function printHelp(): void {
  console.log(`
AI Agent CLI

Usage:
  pnpm agent                                  # 输出索引（最佳实践 + 知识地图）
  pnpm agent --roadmap [current|v1|v2|draft]  # 查看任务列表
  pnpm agent --claim <issue#>                 # 领取任务（分配给自己）
  pnpm agent --done <issue#>                  # 完成任务（关闭 Issue）
  pnpm agent --create <title>                 # 创建新任务
    [--body <描述>] [--roadmap v1|v2|draft] [--category feature|bug|refactor]
  pnpm agent --stats                          # 查看进度统计
  pnpm agent --toc                            # 白皮书目录结构
  pnpm agent --chapter <name>                 # 查阅白皮书章节

Epic 管理:
  pnpm agent --epic create <title>            # 创建 Epic
    [--desc <描述>] [--roadmap v1] [--issues 1,2,3]
  pnpm agent --epic list                      # 查看所有 Epic
  pnpm agent --epic view <#>                  # 查看 Epic 详情
  pnpm agent --epic sync <#>                  # 同步子任务状态
  pnpm agent --epic add <epic#> <issue#>      # 添加子任务到 Epic

Aliases: CURRENT -> V1, NEXT -> V2

Examples:
  pnpm agent --roadmap current
  pnpm agent --claim 28
  pnpm agent --create "修复某个问题" --category bug --roadmap v1
  pnpm agent --epic create "大功能" --roadmap v1 --issues 44,45,46
`)
}

function main(): void {
  const args = process.argv.slice(2)

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  // Roadmap
  const roadmapIndex = args.indexOf('--roadmap')
  if (roadmapIndex !== -1) {
    const releaseFilter = args[roadmapIndex + 1]
    printRoadmap(releaseFilter)
    process.exit(0)
  }

  // Claim
  const claimIndex = args.indexOf('--claim')
  if (claimIndex !== -1 && args[claimIndex + 1]) {
    claimIssue(args[claimIndex + 1])
    process.exit(0)
  }

  // Done
  const doneIndex = args.indexOf('--done')
  if (doneIndex !== -1 && args[doneIndex + 1]) {
    completeIssue(args[doneIndex + 1])
    process.exit(0)
  }

  // Stats
  if (args.includes('--stats')) {
    printStats()
    process.exit(0)
  }

  // Create Issue
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

  // Epic commands
  const epicIndex = args.indexOf('--epic')
  if (epicIndex !== -1) {
    const subCommand = args[epicIndex + 1]

    switch (subCommand) {
      case 'create': {
        const title = args[epicIndex + 2]
        if (!title) {
          log.error('请提供 Epic 标题')
          process.exit(1)
        }
        const descIndex = args.indexOf('--desc')
        const roadmapIndex3 = args.indexOf('--roadmap', epicIndex)
        const issuesIndex = args.indexOf('--issues')
        
        const subIssues = issuesIndex !== -1
          ? args[issuesIndex + 1].split(',').map(n => parseInt(n.trim()))
          : []

        createEpic({
          title,
          description: descIndex !== -1 ? args[descIndex + 1] : undefined,
          roadmap: roadmapIndex3 !== -1 ? args[roadmapIndex3 + 1] : 'V1',
          subIssues,
        })
        break
      }

      case 'list':
        listEpics()
        break

      case 'view': {
        const epicNum = parseInt(args[epicIndex + 2])
        if (!epicNum) {
          log.error('请提供 Epic 编号')
          process.exit(1)
        }
        viewEpic(epicNum)
        break
      }

      case 'sync': {
        const epicNum = parseInt(args[epicIndex + 2])
        if (!epicNum) {
          log.error('请提供 Epic 编号')
          process.exit(1)
        }
        syncEpicStatus(epicNum)
        break
      }

      case 'add': {
        const epicNum = parseInt(args[epicIndex + 2])
        const issueNum = parseInt(args[epicIndex + 3])
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
    process.exit(0)
  }

  // TOC
  if (args.includes('--toc')) {
    printWhiteBookToc()
    process.exit(0)
  }

  // Chapter
  const chapterIndex = args.indexOf('--chapter')
  if (chapterIndex !== -1 && args[chapterIndex + 1]) {
    const chapterName = args[chapterIndex + 1]
    log.section(`章节: ${chapterName}`)
    printChapterContent(chapterName)
    process.exit(0)
  }

  // Default: print index
  printIndex()
}

main()
