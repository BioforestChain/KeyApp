/**
 * useMpayDetection hook
 *
 * 检测 mpay 钱包数据并提供迁移状态
 */

import { useState, useEffect, useCallback } from 'react'
import { detectMpayData } from '../services/migration/mpay-reader'
import type { MpayDetectionResult, MigrationStatus } from '../services/migration/types'

const MIGRATION_STATUS_KEY = 'keyapp_migration_status'

interface UseMpayDetectionResult {
  /** 检测结果 */
  detection: MpayDetectionResult | null
  /** 是否正在检测 */
  isDetecting: boolean
  /** 迁移状态 */
  status: MigrationStatus
  /** 是否需要显示迁移提示 */
  shouldPromptMigration: boolean
  /** 重新检测 */
  redetect: () => Promise<void>
  /** 更新迁移状态 */
  setStatus: (status: MigrationStatus) => void
}

/**
 * 从 localStorage 读取迁移状态
 */
function loadMigrationStatus(): MigrationStatus {
  try {
    const stored = localStorage.getItem(MIGRATION_STATUS_KEY)
    if (stored && ['idle', 'detected', 'in_progress', 'completed', 'skipped', 'error'].includes(stored)) {
      return stored as MigrationStatus
    }
  } catch {
    // ignore
  }
  return 'idle'
}

/**
 * 保存迁移状态到 localStorage
 */
function saveMigrationStatus(status: MigrationStatus): void {
  try {
    localStorage.setItem(MIGRATION_STATUS_KEY, status)
  } catch {
    // ignore
  }
}

/**
 * 检测 mpay 数据并管理迁移状态
 */
export function useMpayDetection(): UseMpayDetectionResult {
  const [detection, setDetection] = useState<MpayDetectionResult | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)
  const [status, setStatusInternal] = useState<MigrationStatus>(loadMigrationStatus)

  const setStatus = useCallback((newStatus: MigrationStatus) => {
    setStatusInternal(newStatus)
    saveMigrationStatus(newStatus)
  }, [])

  const detect = useCallback(async () => {
    setIsDetecting(true)
    try {
      const result = await detectMpayData()
      setDetection(result)

      // 如果是首次检测且有数据，更新状态为 detected
      if (status === 'idle' && result.hasData) {
        setStatus('detected')
      }
    } catch (error) {
      console.error('Failed to detect mpay data:', error)
      setDetection({
        hasData: false,
        walletCount: 0,
        addressCount: 0,
        hasSettings: false,
        addressBookCount: 0,
      })
    } finally {
      setIsDetecting(false)
    }
  }, [status, setStatus])

  useEffect(() => {
    detect()
  }, []) // 只在挂载时检测一次

  // 判断是否需要显示迁移提示
  const shouldPromptMigration =
    !isDetecting &&
    detection?.hasData === true &&
    (status === 'idle' || status === 'detected')

  return {
    detection,
    isDetecting,
    status,
    shouldPromptMigration,
    redetect: detect,
    setStatus,
  }
}

export { MIGRATION_STATUS_KEY }
