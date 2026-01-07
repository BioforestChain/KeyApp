#!/usr/bin/env bun
/**
 * AI Agent CLI - 主入口
 *
 * Usage:
 *   pnpm agent readme                          # 输出索引（最佳实践 + 知识地图）
 *   pnpm agent --help                          # 查看帮助
 *   pnpm agent roadmap [version]               # 查看任务列表
 *   pnpm agent claim <issue#>                  # 领取任务
 *   pnpm agent done <issue#>                   # 完成任务
 *   pnpm agent create <title>                  # 创建任务
 *   pnpm agent stats                           # 进度统计
 *   pnpm agent toc                             # 白皮书目录
 *   pnpm agent chapter <name>                  # 查阅白皮书章节
 *   pnpm agent epic <action>                   # Epic 管理
 *   pnpm agent worktree <action>               # Worktree 管理
 *   pnpm agent practice [action]               # 最佳实践管理
 *   pnpm agent docs <action>                   # 文档工具链 (validate/related/graph/sync)
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import readmeCommand from './commands/readme'
import roadmapCommand from './commands/roadmap'
import claimCommand from './commands/claim'
import doneCommand from './commands/done'
import createCommand from './commands/create'
import statsCommand from './commands/stats'
import tocCommand from './commands/toc'
import chapterCommand from './commands/chapter'
import epicCommand from './commands/epic'
import worktreeCommand from './commands/worktree'
import practiceCommand from './commands/practice'
import docsCommand from './commands/docs'

yargs(hideBin(process.argv))
  .scriptName('pnpm agent')
  .usage('$0 <command> [options]')
  .command(readmeCommand)
  .command(roadmapCommand)
  .command(claimCommand)
  .command(doneCommand)
  .command(createCommand)
  .command(statsCommand)
  .command(tocCommand)
  .command(chapterCommand)
  .command(epicCommand)
  .command(worktreeCommand)
  .command(practiceCommand)
  .command(docsCommand)
  .demandCommand(1, '请指定命令，使用 --help 查看可用命令')
  .strict()
  .help()
  .alias('h', 'help')
  .version(false)
  .wrap(100)
  .epilogue('Aliases: CURRENT -> V1, NEXT -> V2')
  .parse()
