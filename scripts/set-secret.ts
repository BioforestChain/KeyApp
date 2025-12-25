#!/usr/bin/env bun
/**
 * 配置 E2E 测试密钥
 * 
 * 用法:
 *   bun scripts/set-secret.ts --local   # 更新本地 .env.local
 *   bun scripts/set-secret.ts --ci      # 配置 GitHub 仓库 secrets
 *   bun scripts/set-secret.ts --all     # 同时配置两者
 * 
 * 需要输入:
 * - 助记词（必需）- 自动派生地址
 * - 安全密码/二次密钥（可选）- 如果账号设置了 secondPublicKey
 * 
 * 钱包锁在测试代码中固定，不需要配置
 */

import { $ } from 'bun'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

/**
 * 从助记词派生 BioForest 地址
 */
async function deriveAddress(mnemonic: string): Promise<string> {
  try {
    const { getBioforestCore, setGenesisBaseUrl } = await import('../src/services/bioforest-sdk/index.js')
    
    // 设置 genesis 文件的路径（Node.js 环境使用 file:// 协议）
    const genesisPath = `file://${path.join(process.cwd(), 'public/configs/genesis')}`
    setGenesisBaseUrl(genesisPath, { with: { type: 'json' } })
    
    // 使用默认的 BioForest 主网配置
    const core = await getBioforestCore('bfmeta')
    const accountHelper = core.accountBaseHelper()
    // 使用正确的 API: getAddressFromSecret
    return await accountHelper.getAddressFromSecret(mnemonic)
  } catch (error) {
    console.error('⚠️  无法派生地址:', error instanceof Error ? error.message : error)
    return ''
  }
}

interface SecretConfig {
  mnemonic: string
  address: string
  secondSecret: string
}

async function promptSecrets(): Promise<SecretConfig> {
  console.log('\n📝 配置 E2E 测试账号\n')
  
  // 1. 助记词（必需）
  console.log('请输入测试钱包助记词:')
  const mnemonic = await prompt('> ')
  
  if (!mnemonic) {
    console.error('❌ 助记词不能为空')
    process.exit(1)
  }
  
  const words = mnemonic.split(/\s+/)
  if (words.length !== 24 && words.length !== 12) {
    console.error(`❌ 助记词应为 12 或 24 个词，当前: ${words.length} 个`)
    process.exit(1)
  }
  
  // 派生地址
  console.log('\n🔄 派生地址...')
  const address = await deriveAddress(mnemonic)
  if (address) {
    console.log(`✅ 地址: ${address}`)
  }
  
  // 2. 安全密码/二次密钥（可选）
  console.log('\n请输入安全密码/二次密钥（如果账号已设置 secondPublicKey，否则直接回车跳过）:')
  const secondSecret = await prompt('> ')
  
  if (secondSecret) {
    console.log('✅ 已配置安全密码')
  } else {
    console.log('ℹ️  未配置安全密码（账号未设置或不需要）')
  }
  
  return { mnemonic, address, secondSecret }
}

async function setLocal(config: SecretConfig): Promise<void> {
  const envPath = path.join(process.cwd(), '.env.local')
  
  const content = `# E2E 测试密钥 - 不要提交到 git
# 由 scripts/set-secret.ts 生成

# 测试钱包助记词
E2E_TEST_MNEMONIC="${config.mnemonic}"

# 派生地址
${config.address ? `E2E_TEST_ADDRESS="${config.address}"` : '# E2E_TEST_ADDRESS=（派生失败）'}

# 安全密码/二次密钥（如果账号设置了 secondPublicKey）
${config.secondSecret ? `E2E_TEST_SECOND_SECRET="${config.secondSecret}"` : '# E2E_TEST_SECOND_SECRET=（未设置）'}
`
  
  fs.writeFileSync(envPath, content)
  console.log(`\n✅ 已更新 ${envPath}`)
}

async function setCI(config: SecretConfig): Promise<void> {
  console.log('\n🔐 配置 GitHub secrets...\n')
  
  try {
    await $`gh --version`.quiet()
  } catch {
    console.error('❌ 需要 GitHub CLI: brew install gh && gh auth login')
    process.exit(1)
  }
  
  try {
    await $`gh auth status`.quiet()
  } catch {
    console.error('❌ 请先登录: gh auth login')
    process.exit(1)
  }
  
  const secrets: Record<string, string> = { E2E_TEST_MNEMONIC: config.mnemonic }
  if (config.address) secrets.E2E_TEST_ADDRESS = config.address
  if (config.secondSecret) secrets.E2E_TEST_SECOND_SECRET = config.secondSecret
  
  for (const [key, value] of Object.entries(secrets)) {
    try {
      await $`echo ${value} | gh secret set ${key}`.quiet()
      console.log(`  ✅ ${key}`)
    } catch (error) {
      console.error(`  ❌ ${key}: ${error}`)
    }
  }
  
  console.log('\n📋 当前 secrets:')
  await $`gh secret list`
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const setLocalFlag = args.includes('--local') || args.includes('--all')
  const setCIFlag = args.includes('--ci') || args.includes('--all')
  
  if (!setLocalFlag && !setCIFlag) {
    console.log(`
配置 E2E 测试密钥

用法:
  bun scripts/set-secret.ts --local   更新 .env.local
  bun scripts/set-secret.ts --ci      配置 GitHub secrets
  bun scripts/set-secret.ts --all     两者都配置

需要输入:
  - 助记词（必需）- 自动派生地址
  - 安全密码/二次密钥（可选）- 如果账号设置了 secondPublicKey

钱包锁在测试代码中固定，不需要配置。
`)
    process.exit(0)
  }
  
  const config = await promptSecrets()
  
  if (setLocalFlag) await setLocal(config)
  if (setCIFlag) await setCI(config)
  
  console.log('\n🎉 完成!')
}

main().catch(console.error)
