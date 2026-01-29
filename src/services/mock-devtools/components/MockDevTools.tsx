/**
 * MockDevTools 主组件
 * 提供统一的 Mock 服务调试界面
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconBug as Bug,
  IconRefresh as RefreshCw,
  IconAlertTriangle as AlertTriangle,
  IconClock as Clock,
  IconPlayerPause as Pause,
  IconTrash as Trash,
  IconFilter as Filter,
  IconSettings as Settings,
  IconList as List,
  IconTerminal2 as Terminal,
  IconCode as Code,
  IconChevronDown as ChevronDown,
  IconChevronRight as ChevronRight,
  IconCheck as Check,
  IconAlertCircle as AlertCircle,
  IconLoader2 as Loader,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { RequestLogEntry } from '../types'
import {
  subscribe,
  getLogs as getOldLogs,
  clearLogs as clearOldLogs,
  getPausedRequests,
} from '../define-mock'
import {
  getServiceLogs,
  clearServiceLogs,
  subscribeToLogs,
  getPausedRequests as getBreakpointPausedRequests,
  subscribeBreakpoints,
  clearBreakpoints,
  getGlobalDelay,
  setGlobalDelay,
  getGlobalError,
  setGlobalError,
  subscribeSettings,
  resetSettings,
} from '@/lib/service-meta'
import { BreakpointPanel } from './BreakpointPanel'
import { ConsolePanel } from './ConsolePanel'
import { DevPanelShell } from './DevPanelShell'

/** 合并两个日志系统的日志 */
function getLogs(): RequestLogEntry[] {
  const oldLogs = getOldLogs()
  const newLogs = getServiceLogs().map((log): RequestLogEntry => ({
    id: log.id,
    timestamp: log.timestamp,
    service: log.service,
    method: log.member,
    input: log.input,
    output: log.output,
    error: log.error,
    status: log.status,
    duration: log.duration,
    intercepted: false,
    originalInput: undefined,
    originalOutput: undefined,
  }))
  // 合并并按时间排序
  return [...oldLogs, ...newLogs].toSorted((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/** 清除所有日志 */
function clearLogs(): void {
  clearOldLogs()
  clearServiceLogs()
}

export interface MockDevToolsProps {
  /** 初始是否展开 */
  defaultOpen?: boolean
  /** 位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

type TabId = 'logs' | 'services' | 'intercept' | 'console' | 'settings'

/** 格式化时间 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
}

/** 状态图标 */
function StatusIcon({ status }: { status: RequestLogEntry['status'] }) {
  switch (status) {
    case 'pending':
      return <Loader className="size-3 animate-spin text-blue-500" />
    case 'success':
      return <Check className="size-3 text-green-500" />
    case 'error':
      return <AlertCircle className="size-3 text-red-500" />
    case 'intercepted':
      return <Pause className="size-3 text-orange-500" />
  }
}

function formatDuration(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  return `${ms}ms`
}

/** 显示耗时的组件 - 支持 pending 状态实时更新 */
function DurationDisplay({ log }: { log: RequestLogEntry }) {
  const [elapsed, setElapsed] = useState(() =>
    log.status === 'pending' ? Date.now() - log.timestamp.getTime() : log.duration ?? 0
  )

  useEffect(() => {
    if (log.status !== 'pending') {
      setElapsed(log.duration ?? 0)
      return
    }
    // pending 状态每 500ms 更新一次
    const timer = setInterval(() => {
      setElapsed(Date.now() - log.timestamp.getTime())
    }, 500)
    return () => clearInterval(timer)
  }, [log.status, log.duration, log.timestamp])

  return (
    <span className={cn('font-mono text-gray-400', log.status === 'pending' && 'text-blue-500')}>
      {formatDuration(elapsed)}
    </span>
  )
}

/** 请求日志面板 */
function LogsPanel({
  filter,
  onFilterChange,
}: {
  filter: string
  onFilterChange: (f: string) => void
}) {
  const { t } = useTranslation('devtools')
  const [logs, setLogs] = useState<RequestLogEntry[]>(() => getLogs())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const refreshLogs = () => setLogs(getLogs())
    // 订阅旧日志系统
    const unsubOld = subscribe('log', refreshLogs)
    // 订阅新日志系统
    const unsubNew = subscribeToLogs(refreshLogs)
    return () => {
      unsubOld()
      unsubNew()
    }
  }, [])

  const filteredLogs = useMemo(() => {
    if (!filter) return logs
    const lower = filter.toLowerCase()
    return logs.filter(
      (log) =>
        log.service.toLowerCase().includes(lower) ||
        log.method.toLowerCase().includes(lower),
    )
  }, [logs, filter])

  return (
    <div className="flex h-full flex-col">
      {/* 过滤器 */}
      <div className="flex items-center gap-2 border-b p-2 dark:border-gray-700">
        <Filter className="size-4 text-gray-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={t('logs.filterPlaceholder')}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => clearLogs()}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          title={t('logs.clear')}
        >
          <Trash className="size-4" />
        </button>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Clock className="size-8" />
            <p className="mt-2 text-sm">{t('logs.empty')}</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <div key={log.id} className="text-xs">
                <button
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className={cn(
                    'flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800',
                    log.intercepted && 'bg-orange-50 dark:bg-orange-900/20',
                  )}
                >
                  <StatusIcon status={log.status} />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {log.service}.<span className="text-blue-600 dark:text-blue-400">{log.method}</span>
                  </span>
                  <span className="flex-1" />
                  <DurationDisplay log={log} />
                  <span className="text-gray-400">{formatTime(log.timestamp)}</span>
                  {expandedId === log.id ? (
                    <ChevronDown className="size-3 text-gray-400" />
                  ) : (
                    <ChevronRight className="size-3 text-gray-400" />
                  )}
                </button>

                {/* 展开详情 */}
                {expandedId === log.id && (
                  <div className="space-y-2 bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
                    <div>
                      <span className="text-gray-500">{t('logs.input')}</span>
                      <pre className="mt-1 overflow-auto rounded bg-gray-100 p-2 text-[10px] dark:bg-gray-900">
                        {JSON.stringify(log.input, null, 2)}
                      </pre>
                    </div>
                    {log.output !== undefined && (
                      <div>
                        <span className="text-gray-500">{t('logs.output')}</span>
                        <pre className="mt-1 overflow-auto rounded bg-gray-100 p-2 text-[10px] dark:bg-gray-900">
                          {JSON.stringify(log.output, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.error && (
                      <div className="text-red-500">
                        <span>{t('logs.error')}</span> {log.error}
                      </div>
                    )}
                    {log.intercepted && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <AlertTriangle className="size-3" />
                        {t('logs.intercepted')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



/** 设置面板 */
function SettingsPanel() {
  const { t } = useTranslation('devtools')
  const [globalDelay, setDelay] = useState(() => getGlobalDelay())
  const [hasError, setHasError] = useState(() => getGlobalError() !== null)
  const [errorMessage, setErrorMessage] = useState(() => getGlobalError()?.message || '')

  // 订阅设置变更
  useEffect(() => {
    return subscribeSettings((settings) => {
      setDelay(settings.globalDelay)
      setHasError(settings.globalError !== null)
      if (settings.globalError) {
        setErrorMessage(settings.globalError.message)
      }
    })
  }, [])

  const handleDelayChange = useCallback((value: number) => {
    setGlobalDelay(value)
  }, [])

  // 错误开关 - 直接读取当前状态避免闭包问题
  const handleErrorToggle = useCallback(() => {
    const currentError = getGlobalError()
    if (currentError) {
      setGlobalError(null)
    } else {
      setGlobalError(new Error(errorMessage || t('settings.defaultError')))
    }
  }, [errorMessage, t])

  // 错误信息变化时，如果已启用错误则同步更新
  const handleErrorMessageChange = useCallback((message: string) => {
    setErrorMessage(message)
    // 如果错误已启用，同步更新错误对象
    if (getGlobalError()) {
      setGlobalError(new Error(message || t('settings.defaultError')))
    }
  }, [t])

  const handleResetAll = useCallback(() => {
    resetSettings()
    clearLogs()
    clearBreakpoints()
    setErrorMessage('')
  }, [])

  return (
    <div className="flex h-full flex-col overflow-auto p-3">
      <div className="space-y-4">
        {/* 全局延迟 */}
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <label className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>{t('settings.globalDelay')}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10000"
                step="100"
                value={globalDelay}
                onChange={(e) => handleDelayChange(Number(e.target.value))}
                className="w-20 rounded border bg-transparent px-2 py-0.5 text-right font-mono text-blue-500 dark:border-gray-600"
              />
              <span className="text-gray-500">{t('settings.ms')}</span>
            </div>
          </label>
          <input
            type="range"
            min="0"
            max="3000"
            step="100"
            value={Math.min(globalDelay, 3000)}
            onChange={(e) => handleDelayChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>{t('settings.delayMarks.zero')}</span>
            <span>{t('settings.delayMarks.one')}</span>
            <span>{t('settings.delayMarks.two')}</span>
            <span>{t('settings.delayMarks.three')}</span>
          </div>
        </div>

        {/* 模拟错误 */}
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('settings.mockError')}</label>
            <button
              onClick={handleErrorToggle}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                hasError ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600',
              )}
            >
              <span
                className={cn(
                  'inline-block size-4 transform rounded-full bg-white transition-transform',
                  hasError ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>
          <input
            type="text"
            value={errorMessage}
            onChange={(e) => handleErrorMessageChange(e.target.value)}
            placeholder={t('settings.errorPlaceholder')}
            className="mt-2 w-full rounded border bg-transparent px-2 py-1 text-xs dark:border-gray-600"
          />
          {hasError && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
              <AlertTriangle className="size-3" />
              {t('settings.errorNotice')}
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="space-y-2">
          <button
            onClick={handleResetAll}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            <RefreshCw className="size-4" />
            {t('settings.resetAll')}
          </button>
          <button
            onClick={() => clearLogs()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-500 py-2 text-sm font-medium text-white hover:bg-gray-600"
          >
            <Trash className="size-4" />
            {t('settings.clearLogs')}
          </button>
          <button
            onClick={() => clearBreakpoints()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-500 py-2 text-sm font-medium text-white hover:bg-gray-600"
          >
            <Trash className="size-4" />
            {t('settings.clearBreakpoints')}
          </button>
        </div>

        {/* 说明 */}
        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <p className="font-medium">{t('settings.tipTitle')}</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[10px]">
            <li>{t('settings.tipDelay')}</li>
            <li>{t('settings.tipError')}</li>
            <li>{t('settings.tipBreakpoint')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/** MockDevTools 主组件 */
export function MockDevTools({ defaultOpen = false, position = 'bottom-right' }: MockDevToolsProps) {
  const { t } = useTranslation('devtools')
  const [activeTab, setActiveTab] = useState<TabId>('logs')
  const [logFilter, setLogFilter] = useState('')
  const [logCount, setLogCount] = useState(() => getLogs().length)
  const [pausedCount, setPausedCount] = useState(
    () => getPausedRequests().length + getBreakpointPausedRequests().length
  )
  const [consoleInitialCommand, setConsoleInitialCommand] = useState<string | undefined>()

  // 从 BreakpointPanel 打开 Console 并执行命令
  const handleOpenConsole = useCallback((command: string) => {
    setConsoleInitialCommand(command)
    setActiveTab('console')
  }, [])

  useEffect(() => {
    const updateLogCount = () => setLogCount(getLogs().length)
    const updatePausedCount = () =>
      setPausedCount(getPausedRequests().length + getBreakpointPausedRequests().length)
    // 订阅旧日志系统
    const unsub1 = subscribe('log', updateLogCount)
    // 订阅新日志系统
    const unsub2 = subscribeToLogs(updateLogCount)
    const unsub3 = subscribe('pause', updatePausedCount)
    const unsub4 = subscribe('resume', updatePausedCount)
    const unsub5 = subscribeBreakpoints(updatePausedCount)
    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      unsub5()
    }
  }, [])

  const tabs: { id: TabId; icon: typeof List; label: string; badge: number | undefined }[] = [
    { id: 'logs', icon: List, label: t('tabs.logs'), badge: logCount > 0 ? logCount : undefined },
    { id: 'intercept', icon: Terminal, label: t('tabs.breakpoints'), badge: pausedCount > 0 ? pausedCount : undefined },
    { id: 'console', icon: Code, label: t('tabs.console'), badge: undefined },
    { id: 'settings', icon: Settings, label: t('tabs.settings'), badge: undefined },
  ]

  return (
    <DevPanelShell
      title={t('title')}
      icon={Bug}
      buttonTitle={t('button.open')}
      helpText={t('help.shortcuts')}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      defaultOpen={defaultOpen}
      position={position}
      buttonBadge={pausedCount > 0 ? pausedCount : undefined}
      buttonPulse={pausedCount > 0}
      footer={
        <>
          {t('footer.mode')} • {t('footer.logs', { count: logCount })}
          {pausedCount > 0 && <span className="text-orange-500"> • {t('footer.paused', { count: pausedCount })}</span>}
        </>
      }
    >
      {activeTab === 'logs' && <LogsPanel filter={logFilter} onFilterChange={setLogFilter} />}
      {activeTab === 'intercept' && <BreakpointPanel onOpenConsole={handleOpenConsole} />}
      {activeTab === 'console' && <ConsolePanel initialCommand={consoleInitialCommand} />}
      {activeTab === 'settings' && <SettingsPanel />}
    </DevPanelShell>
  )
}

export default MockDevTools
