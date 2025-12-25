import type { ArgumentsCamelCase, CommandModule } from 'yargs'
import { printChapterContent } from '../handlers/whitebook'
import { log } from '../utils'

interface ChapterArgs {
  name: string
}

export default {
  command: 'chapter <name>',
  describe: '查阅白皮书章节',
  builder: {
    name: {
      type: 'string',
      describe: '章节路径',
      demandOption: true,
    },
  },
  handler: (argv: ArgumentsCamelCase<ChapterArgs>) => {
    log.section(`章节: ${argv.name}`)
    printChapterContent(argv.name)
  },
} satisfies CommandModule<object, ChapterArgs>
