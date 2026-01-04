/**
 * SFTP 上传工具
 *
 * 用于将 dweb (plaoc) 打包产物上传到 SFTP 服务器
 */

import SftpClient from 'ssh2-sftp-client'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}i${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}!${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
}

/**
 * SFTP 上传配置
 */
export type SftpUploadConfig = {
  /** SFTP URL，格式: sftp://host:port */
  url: string
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 本地源目录 */
  sourceDir: string
  /** 项目名称（用于日志） */
  projectName: string
}

/**
 * 解析 SFTP URL
 */
function parseSftpUrl(url: string): { host: string; port: number } {
  try {
    const urlObj = new URL(url)
    return {
      host: urlObj.hostname,
      port: urlObj.port ? parseInt(urlObj.port, 10) : 22,
    }
  } catch {
    // 如果 URL 解析失败，尝试直接作为主机名处理
    return { host: url, port: 22 }
  }
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * 上传文件到 SFTP 服务器
 *
 * @param config 上传配置
 * @param maxRetries 最大重试次数
 */
export async function uploadToSftp(config: SftpUploadConfig, maxRetries = 3): Promise<void> {
  const { url, username, password, sourceDir, projectName } = config

  // 解析 SFTP URL
  const { host, port } = parseSftpUrl(url)

  // 检查源目录是否存在
  if (!existsSync(sourceDir)) {
    throw new Error(`源目录不存在: ${sourceDir}`)
  }

  log.info(`准备上传 ${projectName} 到 SFTP 服务器: ${host}:${port}`)
  log.info(`源目录: ${sourceDir}`)
  log.info(`用户名: ${username}`)

  let lastError: Error | null = null

  // 重试机制
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = new SftpClient()

    try {
      log.info(`尝试连接 SFTP 服务器 (${attempt}/${maxRetries})...`)

      await client.connect({
        host,
        port,
        username,
        password,
        readyTimeout: 30000,
        retries: 3,
        retry_factor: 2,
        retry_minTimeout: 2000,
      })

      log.success(`SFTP 连接成功: ${host}`)

      // 获取当前工作目录
      const remoteDir = await client.cwd()
      log.info(`远程工作目录: ${remoteDir}`)

      // 获取要上传的文件列表
      const entries = readdirSync(sourceDir, { withFileTypes: true })
      const files = entries.filter((f) => f.isFile())

      if (files.length === 0) {
        log.warn(`源目录中没有文件可上传: ${sourceDir}`)
        return
      }

      log.info(`开始上传 ${files.length} 个文件...`)

      let uploadedCount = 0

      for (const file of files) {
        const localPath = join(sourceDir, file.name)
        const remotePath = posix.join(remoteDir, file.name)
        const fileSize = statSync(localPath).size

        log.info(`上传: ${file.name} (${formatSize(fileSize)})`)

        // 单个文件上传重试
        let fileUploaded = false
        for (let fileAttempt = 1; fileAttempt <= 3; fileAttempt++) {
          try {
            await client.fastPut(localPath, remotePath, {
              step: (transferred: number, _chunk: number, total: number) => {
                const percent = Math.round((transferred / total) * 100)
                process.stdout.write(`\r  进度: ${percent}%`)
              },
            })
            process.stdout.write('\n')
            log.success(`  ${file.name} 上传成功`)
            uploadedCount++
            fileUploaded = true
            break
          } catch (fileError) {
            log.warn(`  ${file.name} 上传失败 (${fileAttempt}/3): ${fileError}`)
            if (fileAttempt < 3) {
              await new Promise((r) => setTimeout(r, 2000))
            }
          }
        }

        if (!fileUploaded) {
          throw new Error(`文件 ${file.name} 上传失败，已重试 3 次`)
        }

        // 短暂暂停，避免服务器过载
        await new Promise((r) => setTimeout(r, 500))
      }

      log.success(`SFTP 上传完成! 项目: ${projectName}, 成功: ${uploadedCount}/${files.length}`)
      return
    } catch (error) {
      lastError = error as Error
      log.error(`SFTP 上传失败 (${attempt}/${maxRetries}): ${error}`)

      if (attempt < maxRetries) {
        const delaySeconds = attempt * 2
        log.info(`等待 ${delaySeconds} 秒后重试...`)
        await new Promise((r) => setTimeout(r, delaySeconds * 1000))
      }
    } finally {
      try {
        await client.end()
      } catch {
        // 忽略关闭连接时的错误
      }
    }
  }

  // 所有重试都失败了
  log.error(`SFTP 上传最终失败: ${projectName}，已重试 ${maxRetries} 次`)

  // 提供故障排除建议
  console.log(`\n故障排除建议:`)
  console.log(`1. 使用第三方工具验证 SFTP 连接`)
  console.log(`2. 检查 SFTP 服务器状态和网络连接`)
  console.log(`3. 确认 SFTP 用户有写入权限`)
  console.log(`4. 检查防火墙和端口设置`)
  console.log(`5. 尝试使用 FileZilla 等 SFTP 客户端手动测试`)

  throw lastError || new Error(`SFTP 上传失败`)
}
