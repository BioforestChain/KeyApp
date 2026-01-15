import { resolve } from 'path'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { execa } from 'execa'
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
  info: (msg: string) => {},
  success: (msg: string) => {},
  warn: (msg: string) => {},
  error: (msg: string) => {},
  step: (step: number, total: number, msg: string) =>
    {},
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
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message)
    }
    process.exit(1)
  }
}
