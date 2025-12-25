import type { CommandModule } from 'yargs'
import { printWhiteBookToc } from '../handlers/whitebook'

export default {
  command: 'toc',
  describe: '白皮书目录结构',
  handler: () => {
    printWhiteBookToc()
  },
} satisfies CommandModule
