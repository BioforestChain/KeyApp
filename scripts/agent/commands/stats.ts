import type { CommandModule } from 'yargs'
import { printStats } from '../handlers/roadmap'

export default {
  command: 'stats',
  describe: '查看进度统计',
  handler: () => {
    printStats()
  },
} satisfies CommandModule
