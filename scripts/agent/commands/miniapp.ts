import type { ArgumentsCamelCase, CommandModule } from 'yargs'
import { execSync } from 'child_process'
import { resolve } from 'path'

interface MiniappCreateArgs {
  name?: string
  style?: string
  'base-color'?: string
  theme?: string
  'icon-library'?: string
  font?: string
  radius?: string
  'menu-accent'?: string
  template?: string
  output?: string
  'skip-shadcn'?: boolean
  'skip-install'?: boolean
  yes?: boolean
  'no-splash'?: boolean
}

const createCommand: CommandModule<object, MiniappCreateArgs> = {
  command: 'create [name]',
  describe: '创建新的 Bio 生态 miniapp',
  builder: {
    name: {
      type: 'string',
      describe: 'Miniapp 名称',
    },
    style: {
      type: 'string',
      describe: 'UI 风格 (vega|nova|maia|lyra|mira)',
      default: 'mira',
    },
    'base-color': {
      type: 'string',
      describe: '基础颜色 (neutral|stone|zinc|gray)',
      default: 'neutral',
    },
    theme: {
      type: 'string',
      describe: '主题色',
      default: 'neutral',
    },
    'icon-library': {
      type: 'string',
      describe: '图标库 (lucide|tabler|hugeicons|phosphor)',
      default: 'lucide',
    },
    font: {
      type: 'string',
      describe: '字体 (inter|noto-sans|nunito-sans|figtree)',
      default: 'inter',
    },
    radius: {
      type: 'string',
      describe: '圆角 (default|none|small|medium|large)',
      default: 'default',
    },
    'menu-accent': {
      type: 'string',
      describe: '菜单强调 (subtle|bold)',
      default: 'subtle',
    },
    template: {
      type: 'string',
      describe: '模板 (vite|start)',
      default: 'vite',
    },
    output: {
      type: 'string',
      describe: '输出目录',
      default: './miniapps',
    },
    'skip-shadcn': {
      type: 'boolean',
      describe: '跳过 shadcn 初始化',
      default: false,
    },
    'skip-install': {
      type: 'boolean',
      describe: '跳过依赖安装',
      default: false,
    },
    'yes': {
      type: 'boolean',
      alias: 'y',
      describe: '使用默认值，跳过交互式提示',
      default: false,
    },
    'no-splash': {
      type: 'boolean',
      describe: '禁用启动屏',
      default: false,
    },
  },
  handler: (argv: ArgumentsCamelCase<MiniappCreateArgs>) => {
    const args: string[] = []

    if (argv.name) args.push(argv.name)
    if (argv.style) args.push('--style', argv.style)
    if (argv['base-color']) args.push('--base-color', argv['base-color'])
    if (argv.theme) args.push('--theme', argv.theme)
    if (argv['icon-library']) args.push('--icon-library', argv['icon-library'])
    if (argv.font) args.push('--font', argv.font)
    if (argv.radius) args.push('--radius', argv.radius)
    if (argv['menu-accent']) args.push('--menu-accent', argv['menu-accent'])
    if (argv.template) args.push('--template', argv.template)
    if (argv.output) args.push('--output', argv.output)
    if (argv['skip-shadcn']) args.push('--skip-shadcn')
    if (argv['skip-install']) args.push('--skip-install')
    if (argv.yes) args.push('--yes')
    if (argv['no-splash']) args.push('--no-splash')

    const cliPath = resolve(__dirname, '../../packages/create-miniapp/src/cli.ts')

    execSync(`bun ${cliPath} ${args.join(' ')}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
  },
}

export default {
  command: 'miniapp <command>',
  describe: 'Miniapp 管理',
  builder: (yargs) => {
    return yargs.command(createCommand).demandCommand(1, '请指定子命令')
  },
  handler: () => {},
} satisfies CommandModule
