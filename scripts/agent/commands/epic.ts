import type { CommandModule, Argv } from 'yargs'
import {
  createEpic,
  listEpics,
  viewEpic,
  syncEpicStatus,
  addSubIssueToEpic,
} from '../handlers/epic'

interface EpicCreateArgs {
  title: string
  desc?: string
  roadmap?: string
  issues?: string
}

interface EpicViewArgs {
  number: number
}

interface EpicSyncArgs {
  number: number
}

interface EpicAddArgs {
  epic: number
  issue: number
}

export default {
  command: 'epic <action>',
  describe: 'Epic 管理',
  builder: (yargs: Argv) =>
    yargs
      .command<EpicCreateArgs>(
        'create <title>',
        '创建 Epic',
        (y) =>
          y
            .positional('title', {
              type: 'string',
              describe: 'Epic 标题',
              demandOption: true,
            })
            .option('desc', {
              type: 'string',
              describe: '描述',
            })
            .option('roadmap', {
              type: 'string',
              describe: '版本 (v1|v2)',
              default: 'V1',
            })
            .option('issues', {
              type: 'string',
              describe: '子任务编号，逗号分隔 (如: 1,2,3)',
            }),
        (argv) => {
          const subIssues = argv.issues
            ? argv.issues
                .split(',')
                .map((v) => parseInt(v.trim(), 10))
                .filter(Boolean)
            : []
          createEpic({
            title: argv.title,
            description: argv.desc,
            roadmap: argv.roadmap ?? 'V1',
            subIssues,
          })
        }
      )
      .command('list', '查看所有 Epic', () => {}, () => {
        listEpics()
      })
      .command<EpicViewArgs>(
        'view <number>',
        '查看 Epic 详情',
        (y) =>
          y.positional('number', {
            type: 'number',
            describe: 'Epic 编号',
            demandOption: true,
          }),
        (argv) => {
          viewEpic(argv.number)
        }
      )
      .command<EpicSyncArgs>(
        'sync <number>',
        '同步子任务状态',
        (y) =>
          y.positional('number', {
            type: 'number',
            describe: 'Epic 编号',
            demandOption: true,
          }),
        (argv) => {
          syncEpicStatus(argv.number)
        }
      )
      .command<EpicAddArgs>(
        'add <epic> <issue>',
        '添加子任务到 Epic',
        (y) =>
          y
            .positional('epic', {
              type: 'number',
              describe: 'Epic 编号',
              demandOption: true,
            })
            .positional('issue', {
              type: 'number',
              describe: 'Issue 编号',
              demandOption: true,
            }),
        (argv) => {
          addSubIssueToEpic(argv.epic, argv.issue)
        }
      )
      .demandCommand(1, '请指定 epic 子命令'),
  handler: () => {},
} satisfies CommandModule
