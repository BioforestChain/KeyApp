import type { ArgumentsCamelCase, CommandModule } from 'yargs'
import { createIssue } from '../handlers/roadmap'

interface CreateArgs {
  title: string
  body?: string
  roadmap?: string
  category?: string
}

export default {
  command: 'create <title>',
  describe: '创建新任务',
  builder: {
    title: {
      type: 'string',
      describe: 'Issue 标题',
      demandOption: true,
    },
    body: {
      type: 'string',
      describe: '描述内容',
    },
    roadmap: {
      type: 'string',
      describe: '版本 (v1|v2|draft)',
      default: 'DRAFT',
    },
    category: {
      type: 'string',
      describe: '分类 (feature|bug|refactor)',
      default: 'feature',
    },
  },
  handler: (argv: ArgumentsCamelCase<CreateArgs>) => {
    createIssue({
      title: argv.title,
      body: argv.body,
      roadmap: argv.roadmap ?? 'DRAFT',
      category: argv.category ?? 'feature',
    })
  },
} satisfies CommandModule<object, CreateArgs>
