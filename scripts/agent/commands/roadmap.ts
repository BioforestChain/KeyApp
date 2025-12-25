import type { ArgumentsCamelCase, CommandModule } from 'yargs'
import { printRoadmap } from '../handlers/roadmap'

interface RoadmapArgs {
  version?: string
}

export default {
  command: 'roadmap [version]',
  describe: '查看任务列表',
  builder: {
    version: {
      type: 'string',
      describe: '版本号 (current|v1|v2|draft)',
    },
  },
  handler: (argv: ArgumentsCamelCase<RoadmapArgs>) => {
    printRoadmap(argv.version)
  },
} satisfies CommandModule<object, RoadmapArgs>
