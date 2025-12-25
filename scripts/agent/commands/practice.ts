import type { CommandModule, Argv } from 'yargs'
import {
  listPractices,
  addPractice,
  removePractice,
  updatePractice,
} from '../handlers/practice'

interface PracticeAddArgs {
  text: string
}

interface PracticeRemoveArgs {
  target: string
}

interface PracticeUpdateArgs {
  index: string
  text: string
}

export default {
  command: 'practice [action]',
  describe: '最佳实践管理',
  builder: (yargs: Argv) =>
    yargs
      .command('list', '列出所有最佳实践', () => {}, () => {
        listPractices()
      })
      .command<PracticeAddArgs>(
        'add <text>',
        '添加最佳实践',
        (y) =>
          y.positional('text', {
            type: 'string',
            describe: '最佳实践内容',
            demandOption: true,
          }),
        (argv) => {
          addPractice(argv.text)
        }
      )
      .command<PracticeRemoveArgs>(
        'remove <target>',
        '删除最佳实践',
        (y) =>
          y.positional('target', {
            type: 'string',
            describe: '序号或内容',
            demandOption: true,
          }),
        (argv) => {
          removePractice(argv.target)
        }
      )
      .command<PracticeUpdateArgs>(
        'update <index> <text>',
        '更新最佳实践',
        (y) =>
          y
            .positional('index', {
              type: 'string',
              describe: '序号',
              demandOption: true,
            })
            .positional('text', {
              type: 'string',
              describe: '新内容',
              demandOption: true,
            }),
        (argv) => {
          updatePractice(argv.index, argv.text)
        }
      ),
  handler: (argv) => {
    if (!argv.action || argv.action === 'list') {
      listPractices()
    }
  },
} satisfies CommandModule
