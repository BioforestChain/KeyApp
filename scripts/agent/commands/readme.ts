import type { CommandModule } from 'yargs'
import { printIndex } from '../handlers/readme'

export default {
  command: 'readme',
  describe: '输出索引（最佳实践 + 知识地图）',
  handler: () => {
    printIndex()
  },
} satisfies CommandModule
