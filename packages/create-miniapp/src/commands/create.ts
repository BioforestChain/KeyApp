import { resolve } from 'path'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { execa } from 'execa'
import chalk from 'chalk'
import type { CreateOptions } from '../types'
import { promptMissingOptions } from '../utils/prompts'
import { buildShadcnPresetUrl } from '../utils/shadcn'
import {
  generateManifest,
  generateOxlintConfig,
  generateVitestConfig,
  generatePlaywrightConfig,
  generateBioTypes,
  generateTestSetup,
  generateE2ESetup,
  generateE2EHelpers,
  generateE2ESpec,
  generateI18nSetup,
  generateI18nTest,
  generateAppTest,
  generateLogoScript,
  generateStorybookConfig,
  generateExampleStory,
  updatePackageJson,
  updateViteConfig,
  updateMainTsx,
  updateAppTsx,
} from '../utils/inject'

const log = {
  info: (msg: string) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  step: (step: number, total: number, msg: string) =>
    console.log(chalk.dim(`[${step}/${total}]`), msg),
}

function getNextPort(outputDir: string): number {
  const basePort = 5180
  if (!existsSync(outputDir)) return basePort

  const dirs = readdirSync(outputDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .length

  return basePort + dirs + 1
}

export async function createMiniapp(options: CreateOptions): Promise<void> {
  console.log()
  console.log(chalk.cyan.bold('╔════════════════════════════════════════╗'))
  console.log(chalk.cyan.bold('║     Create Bio Miniapp                 ║'))
  console.log(chalk.cyan.bold('╚════════════════════════════════════════╝'))
  console.log()

  try {
    // 1. 交互式补全选项
    const finalOptions = await promptMissingOptions(options)
    const { name, output, skipShadcn, skipInstall } = finalOptions

    const outputDir = resolve(process.cwd(), output)
    const projectDir = resolve(outputDir, name)
    const port = getNextPort(outputDir)

    // 检查目录是否已存在
    if (existsSync(projectDir)) {
      log.error(`目录 ${projectDir} 已存在`)
      process.exit(1)
    }

    // 确保输出目录存在
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    const totalSteps = skipShadcn ? 4 : (skipInstall ? 5 : 6)
    let currentStep = 0

    // 2. 执行 shadcn create
    if (!skipShadcn) {
      currentStep++
      log.step(currentStep, totalSteps, '执行 shadcn create...')

      const presetUrl = buildShadcnPresetUrl(finalOptions)

      console.log(chalk.dim(`  Preset: ${presetUrl}`))

      await execa('pnpm', [
        'dlx',
        'shadcn@latest',
        'create',
        '--preset',
        presetUrl,
        '--template',
        finalOptions.template,
        name,
      ], {
        cwd: outputDir,
        stdio: 'inherit',
      })

      log.success('shadcn 项目创建完成')
    } else {
      // 如果跳过 shadcn，创建空目录
      mkdirSync(projectDir, { recursive: true })
    }

    // 3. 生成 manifest.json
    currentStep++
    log.step(currentStep, totalSteps, '生成 manifest.json...')
    generateManifest(projectDir, finalOptions)
    log.success('manifest.json 生成完成')

    // 4. 注入 Bio 生态配置
    currentStep++
    log.step(currentStep, totalSteps, '注入 Bio 生态配置...')

    // 代码质量
    generateOxlintConfig(projectDir)

    // Vitest 测试
    generateVitestConfig(projectDir)
    generateTestSetup(projectDir)
    generateAppTest(projectDir, name)

    // E2E 测试
    generatePlaywrightConfig(projectDir, port)
    generateE2ESetup(projectDir, name)
    generateE2EHelpers(projectDir, name)
    generateE2ESpec(projectDir, name)

    // i18n 国际化 (zh-CN, zh-TW, en)
    generateI18nSetup(projectDir, name)
    generateI18nTest(projectDir)

    // Bio SDK 类型
    generateBioTypes(projectDir)

    // Logo 处理脚本
    generateLogoScript(projectDir)

    // Storybook 配置
    generateStorybookConfig(projectDir)
    generateExampleStory(projectDir)

    // 更新项目配置
    updatePackageJson(projectDir, name, port)
    updateViteConfig(projectDir, port)
    updateMainTsx(projectDir)
    updateAppTsx(projectDir, finalOptions)

    log.success('Bio 生态配置注入完成')

    // 5. 显示配置摘要
    currentStep++
    log.step(currentStep, totalSteps, '配置摘要')

    console.log()
    console.log(chalk.bold('  配置:'))
    console.log(chalk.dim(`    名称:       ${name}`))
    console.log(chalk.dim(`    App ID:     ${finalOptions.appId}`))
    console.log(chalk.dim(`    风格:       ${finalOptions.style}`))
    console.log(chalk.dim(`    主题:       ${finalOptions.theme}`))
    console.log(chalk.dim(`    图标库:     ${finalOptions.iconLibrary}`))
    console.log(chalk.dim(`    字体:       ${finalOptions.font}`))
    console.log(chalk.dim(`    模板:       ${finalOptions.template}`))
    console.log(chalk.dim(`    端口:       ${port}`))
    console.log()

    // 6. 安装依赖
    if (!skipInstall) {
      currentStep++
      log.step(currentStep, totalSteps, '安装依赖...')

      await execa('pnpm', ['install'], {
        cwd: projectDir,
        stdio: 'inherit',
      })

      log.success('依赖安装完成')
    }

    // 完成
    console.log()
    console.log(chalk.green.bold('✨ Miniapp 创建成功!'))
    console.log()
    console.log(chalk.bold('  开始开发:'))
    console.log(chalk.cyan(`    cd ${output}/${name}`))
    console.log(chalk.cyan('    pnpm dev'))
    console.log()
    console.log(chalk.bold('  其他命令:'))
    console.log(chalk.dim('    pnpm build       构建生产版本'))
    console.log(chalk.dim('    pnpm test        运行单元测试'))
    console.log(chalk.dim('    pnpm storybook   启动 Storybook'))
    console.log(chalk.dim('    pnpm e2e         运行 E2E 测试'))
    console.log(chalk.dim('    pnpm lint        代码检查'))
    console.log(chalk.dim('    pnpm typecheck   类型检查'))
    console.log(chalk.dim('    pnpm gen-logo    生成 Logo 多尺寸资源'))
    console.log()
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message)
    }
    process.exit(1)
  }
}
