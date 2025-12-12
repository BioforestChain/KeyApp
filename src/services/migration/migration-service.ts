/**
 * 迁移服务
 *
 * 编排 mpay 数据检测 → 密码验证 → 数据转换 → 导入 的完整流程
 */

import type {
  MigrationStatus,
  MigrationProgress,
  MpayDetectionResult,
  IMigrationService,
} from './types'
import {
  detectMpayData,
  readMpayWallets,
  readMpayAddresses,
  readMpayAddressBook,
} from './mpay-reader'
import { verifyMpayPassword } from './mpay-crypto'
import {
  transformMpayData,
  transformAddressBookEntry,
  type TransformResult,
} from './mpay-transformer'
import { walletActions } from '@/stores/wallet'
import { addressBookActions } from '@/stores/address-book'

const MIGRATION_STATUS_KEY = 'keyapp_migration_status'

/**
 * 迁移服务实现
 */
class MigrationServiceImpl implements IMigrationService {
  private status: MigrationStatus = 'idle'
  private retryCount = 0
  private readonly maxRetries = 3

  constructor() {
    this.loadStatus()
  }

  private loadStatus(): void {
    try {
      const stored = localStorage.getItem(MIGRATION_STATUS_KEY)
      if (stored && this.isValidStatus(stored)) {
        this.status = stored as MigrationStatus
      }
    } catch {
      // ignore
    }
  }

  private saveStatus(status: MigrationStatus): void {
    this.status = status
    try {
      localStorage.setItem(MIGRATION_STATUS_KEY, status)
    } catch {
      // ignore
    }
  }

  private isValidStatus(status: string): boolean {
    return ['idle', 'detected', 'in_progress', 'completed', 'skipped', 'error'].includes(status)
  }

  getStatus(): MigrationStatus {
    return this.status
  }

  async detect(): Promise<MpayDetectionResult> {
    const result = await detectMpayData()
    if (result.hasData && this.status === 'idle') {
      this.saveStatus('detected')
    }
    return result
  }

  async verifyPassword(password: string): Promise<boolean> {
    const wallets = await readMpayWallets()
    if (wallets.length === 0) {
      return false
    }

    // 尝试解密第一个钱包的 importPhrase
    const firstWallet = wallets[0]
    if (!firstWallet?.importPhrase) {
      return false
    }

    const isValid = await verifyMpayPassword(password, firstWallet.importPhrase)

    if (!isValid) {
      this.retryCount++
      if (this.retryCount >= this.maxRetries) {
        // 达到最大重试次数，提示用户
        console.warn('Password verification failed 3 times')
      }
    } else {
      this.retryCount = 0
    }

    return isValid
  }

  async migrate(
    password: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<void> {
    this.saveStatus('in_progress')

    try {
      // Step 1: 检测
      onProgress?.({
        step: 'detecting',
        percent: 10,
      })

      const detection = await this.detect()
      if (!detection.hasData) {
        throw new Error('No mpay data found')
      }

      // Step 2: 验证密码
      onProgress?.({
        step: 'verifying',
        percent: 20,
      })

      const isPasswordValid = await this.verifyPassword(password)
      if (!isPasswordValid) {
        throw new Error('Password verification failed')
      }

      // Step 3: 读取数据
      onProgress?.({
        step: 'reading',
        percent: 30,
        totalWallets: detection.walletCount,
        processedWallets: 0,
      })

      const [wallets, addresses] = await Promise.all([
        readMpayWallets(),
        readMpayAddresses(),
      ])

      // Step 4: 转换数据
      onProgress?.({
        step: 'transforming',
        percent: 50,
        totalWallets: wallets.length,
        processedWallets: 0,
      })

      const transformResult = await transformMpayData(wallets, addresses, password)

      // Step 5: 导入数据
      onProgress?.({
        step: 'importing',
        percent: 70,
        totalWallets: transformResult.wallets.length,
        processedWallets: 0,
      })

      await this.importWallets(transformResult, (processed, total, currentName) => {
        onProgress?.({
          step: 'importing',
          percent: 70 + Math.floor((processed / total) * 25),
          currentWallet: currentName,
          totalWallets: total,
          processedWallets: processed,
        })
      })

      // Step 6: 导入地址簿联系人
      onProgress?.({
        step: 'importing_contacts',
        percent: 96,
      })

      const addressBookEntries = await readMpayAddressBook()
      const contacts = addressBookEntries.map(transformAddressBookEntry)
      addressBookActions.importContacts(contacts)

      // Step 7: 完成
      onProgress?.({
        step: 'complete',
        percent: 100,
        totalWallets: transformResult.wallets.length,
        processedWallets: transformResult.wallets.length,
      })

      this.saveStatus('completed')
    } catch (error) {
      this.saveStatus('error')
      throw error
    }
  }

  private async importWallets(
    result: TransformResult,
    onProgress: (processed: number, total: number, currentName: string) => void
  ): Promise<void> {
    const { wallets } = result
    const total = wallets.length

    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i]
      if (!wallet) continue

      onProgress(i, total, wallet.name)

      // 使用 walletActions.importWallet 导入
      // 只有当 encryptedMnemonic 存在时才传入
      const walletData: Parameters<typeof walletActions.importWallet>[0] = {
        name: wallet.name,
        address: wallet.address,
        chain: wallet.chain,
        chainAddresses: wallet.chainAddresses,
      }
      if (wallet.encryptedMnemonic) {
        walletData.encryptedMnemonic = wallet.encryptedMnemonic
      }
      walletActions.importWallet(walletData)

      // 小延迟确保 UI 更新
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    onProgress(total, total, '')
  }

  async skip(): Promise<void> {
    this.saveStatus('skipped')
  }

  /**
   * 重置迁移状态（用于测试或重新迁移）
   */
  reset(): void {
    this.saveStatus('idle')
    this.retryCount = 0
  }

  /**
   * 获取剩余重试次数
   */
  getRemainingRetries(): number {
    return Math.max(0, this.maxRetries - this.retryCount)
  }
}

// 单例
export const migrationService = new MigrationServiceImpl()

export type { TransformResult }
