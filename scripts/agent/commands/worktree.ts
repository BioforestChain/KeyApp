import type { CommandModule, Argv } from 'yargs'
import {
  createWorktree,
  deleteWorktree,
  listWorktrees,
} from '../handlers/worktree'

interface WorktreeCreateArgs {
  name: string
  branch: string
  base?: string
}

interface WorktreeDeleteArgs {
  name: string
  force?: boolean
}

export default {
  command: 'worktree <action>',
  describe: 'Worktree 管理',
  builder: (yargs: Argv) =>
    yargs
      .command<WorktreeCreateArgs>(
        'create <name>',
        '创建 worktree',
        (y) =>
          y
            .positional('name', {
              type: 'string',
              describe: 'Worktree 名称',
              demandOption: true,
            })
            .option('branch', {
              type: 'string',
              describe: '分支名称',
              demandOption: true,
            })
            .option('base', {
              type: 'string',
              describe: '基础分支',
              default: 'main',
            }),
        (argv) => {
          createWorktree({
            name: argv.name,
            branch: argv.branch,
            base: argv.base,
          })
        }
      )
      .command<WorktreeDeleteArgs>(
        'delete <name>',
        '删除 worktree',
        (y) =>
          y
            .positional('name', {
              type: 'string',
              describe: 'Worktree 名称',
              demandOption: true,
            })
            .option('force', {
              type: 'boolean',
              describe: '强制删除（跳过 PR 检查）',
              default: false,
            }),
        (argv) => {
          deleteWorktree({
            name: argv.name,
            force: argv.force,
          })
        }
      )
      .command('list', '列出所有 worktree', () => {}, () => {
        listWorktrees()
      })
      .demandCommand(1, '请指定 worktree 子命令')
      .epilogue('分支前缀仅允许: feat/, fix/, docs/, test/, refactor/, chore/, ci/, openspec/, release/'),
  handler: () => {},
} satisfies CommandModule
