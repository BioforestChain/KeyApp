import type { ArgumentsCamelCase, CommandModule } from 'yargs'
import { completeIssue } from '../handlers/roadmap'

interface DoneArgs {
  issue: string
}

export default {
  command: 'done <issue>',
  describe: '完成任务（关闭 Issue）',
  builder: {
    issue: {
      type: 'string',
      describe: 'Issue 编号',
      demandOption: true,
    },
  },
  handler: (argv: ArgumentsCamelCase<DoneArgs>) => {
    completeIssue(argv.issue)
  },
} satisfies CommandModule<object, DoneArgs>
