/**
 * MigrationContext
 *
 * 全局迁移状态管理，提供迁移检测和状态给整个应用
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { detectMpayData } from '../services/migration/mpay-reader'
import type { MpayDetectionResult, MigrationStatus, MigrationProgress } from '../services/migration/types'

const MIGRATION_STATUS_KEY = 'keyapp_migration_status'

interface MigrationContextValue {
  /** 检测结果 */
  detection: MpayDetectionResult | null
  /** 是否正在检测 */
  isDetecting: boolean
  /** 迁移状态 */
  status: MigrationStatus
  /** 迁移进度 (迁移中时可用) */
  progress: MigrationProgress | null
  /** 是否需要显示迁移提示 */
  shouldPromptMigration: boolean
  /** 重新检测 */
  redetect: () => Promise<void>
  /** 更新迁移状态 */
  setStatus: (status: MigrationStatus) => void
  /** 更新迁移进度 */
  setProgress: (progress: MigrationProgress | null) => void
  /** 开始迁移 */
  startMigration: () => void
  /** 完成迁移 */
  completeMigration: () => void
  /** 跳过迁移 */
  skipMigration: () => void
  /** 迁移失败 */
  failMigration: () => void
}

const MigrationContext = createContext<MigrationContextValue | null>(null)

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

interface MigrationProviderProps {
  children: ReactNode
}

export function MigrationProvider({ children }: MigrationProviderProps) {
  const [detection, setDetection] = useState<MpayDetectionResult | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)
  const [status, setStatusInternal] = useState<MigrationStatus>(loadMigrationStatus)
  const [progress, setProgress] = useState<MigrationProgress | null>(null)

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
      if (loadMigrationStatus() === 'idle' && result.hasData) {
        setStatus('detected')
      }
    } catch (error) {
      console.error('Failed to detect mpay data:', error)
      setDetection({
        hasData: false,
        walletCount: 0,
        addressCount: 0,
        hasSettings: false,
      })
    } finally {
      setIsDetecting(false)
    }
  }, [setStatus])

  useEffect(() => {
    detect()
  }, [detect])

  const startMigration = useCallback(() => {
    setStatus('in_progress')
    setProgress({
      step: 'detecting',
      percent: 0,
    })
  }, [setStatus])

  const completeMigration = useCallback(() => {
    setStatus('completed')
    setProgress(null)
  }, [setStatus])

  const skipMigration = useCallback(() => {
    setStatus('skipped')
    setProgress(null)
  }, [setStatus])

  const failMigration = useCallback(() => {
    setStatus('error')
    setProgress(null)
  }, [setStatus])

  // 判断是否需要显示迁移提示
  const shouldPromptMigration =
    !isDetecting &&
    detection?.hasData === true &&
    (status === 'idle' || status === 'detected')

  const value: MigrationContextValue = {
    detection,
    isDetecting,
    status,
    progress,
    shouldPromptMigration,
    redetect: detect,
    setStatus,
    setProgress,
    startMigration,
    completeMigration,
    skipMigration,
    failMigration,
  }

  return (
    <MigrationContext.Provider value={value}>
      {children}
    </MigrationContext.Provider>
  )
}

/**
 * 使用迁移上下文
 */
export function useMigration(): MigrationContextValue {
  const context = useContext(MigrationContext)
  if (!context) {
    throw new Error('useMigration must be used within a MigrationProvider')
  }
  return context
}

/**
 * 可选的迁移上下文 (不抛出错误)
 */
export function useMigrationOptional(): MigrationContextValue | null {
  return useContext(MigrationContext)
}

export { MIGRATION_STATUS_KEY }
