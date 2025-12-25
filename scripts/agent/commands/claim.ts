import type { ArgumentsCamelCase, CommandModule } from 'yargs'
import { claimIssue } from '../handlers/roadmap'

interface ClaimArgs {
  issue: string
}

export default {
  command: 'claim <issue>',
  describe: '领取任务（分配给自己）',
  builder: {
    issue: {
      type: 'string',
      describe: 'Issue 编号',
      demandOption: true,
    },
  },
  handler: (argv: ArgumentsCamelCase<ClaimArgs>) => {
    claimIssue(argv.issue)
  },
} satisfies CommandModule<object, ClaimArgs>
