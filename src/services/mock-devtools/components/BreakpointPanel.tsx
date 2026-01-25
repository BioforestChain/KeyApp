/**
 * 断点面板 - Chrome DevTools 风格的断点调试界面
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconPlayerPause as Pause,
  IconPlayerPlay as Play,
  IconTrash as Trash,
  IconPlus as Plus,
  IconChevronDown as ChevronDown,
  IconChevronRight as ChevronRight,
  IconX as X,
} from '@tabler/icons-react'

import {
  getBreakpoints,
  setBreakpoint,
  removeBreakpoint,
  subscribeBreakpoints,
  getPausedRequests,
  resumePausedRequest,
  abortPausedRequest,
  type BreakpointConfig,
  type PausedRequest,
} from '@/lib/service-meta'

/** 获取已注册的服务和方法列表 */
function getAvailableServices(): Array<{ service: string; methods: string[] }> {
  // 从 service-meta 获取所有已定义的服务
  // 目前先返回硬编码的列表，后续可以从 ServiceMeta 获取
  return [
    { service: 'clipboard', methods: ['write', 'read'] },
    { service: 'biometric', methods: ['isAvailable', 'verify'] },
    { service: 'storage', methods: ['get', 'set', 'remove'] },
    { service: 'toast', methods: ['show'] },
    { service: 'haptics', methods: ['impact', 'notification', 'vibrate'] },
    { service: 'camera', methods: ['scan'] },
    { service: 'staking', methods: ['getOverview', 'getRecords', 'mint', 'burn'] },
    { service: 'transaction', methods: ['getHistory', 'getDetail'] },
    { service: 'currencyExchange', methods: ['getExchangeRates'] },
  ]
}

/** 暂停请求卡片 - 简化版，详细操作在 Console */
function PausedRequestCard({ 
  request, 
  onOpenConsole 
}: { 
  request: PausedRequest
  onOpenConsole?: ((command: string) => void) | undefined
}) {
  const { t } = useTranslation('devtools')
  // 从 id 中提取数字，如 "req-5" -> "5"
  const idNum = request.id.match(/\d+/)?.[0] || request.id
  const varName = `$p${idNum}`

  return (
    <div className="rounded-lg border border-orange-300 bg-orange-50 p-2 dark:border-orange-700 dark:bg-orange-900/20">
      <div className="flex items-center gap-2">
        <Pause className="size-4 text-orange-500 animate-pulse" />
        <span className="flex-1 font-mono text-xs font-medium">
          {request.breakpoint.service}.{request.breakpoint.method}
        </span>
        <span className="rounded bg-orange-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-orange-800">
          {request.phase}
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500">
        <span>{t('breakpoints.consoleLabel')}</span>
        <code className="text-blue-500">{varName}</code>
        <button
          onClick={() => onOpenConsole?.(varName)}
          className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900"
          title={t('breakpoints.consoleView')}
        >
          →
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => resumePausedRequest(request.id)}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-green-500 py-1 text-xs text-white hover:bg-green-600"
        >
          <Play className="size-3" />
          {t('breakpoints.resume')}
        </button>
        <button
          onClick={() => abortPausedRequest(request.id, new Error('Aborted by user'))}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-red-500 py-1 text-xs text-white hover:bg-red-600"
        >
          <X className="size-3" />
          {t('breakpoints.abort')}
        </button>
      </div>
    </div>
  )
}

/** 断点编辑卡片 */
function BreakpointCard({
  bp,
  onUpdate,
  onRemove,
}: {
  bp: BreakpointConfig
  onUpdate: (bp: BreakpointConfig) => void
  onRemove: () => void
}) {
  const { t } = useTranslation('devtools')
  const [expanded, setExpanded] = useState(false)

  const updateInput = (updates: Partial<NonNullable<BreakpointConfig['input']>>) => {
    onUpdate({
      ...bp,
      input: { ...bp.input, ...updates },
    })
  }

  const updateOutput = (updates: Partial<NonNullable<BreakpointConfig['output']>>) => {
    onUpdate({
      ...bp,
      output: { ...bp.output, ...updates },
    })
  }

  const hasAnyConfig =
    bp.delayMs ||
    bp.input?.pause ||
    bp.input?.inject ||
    bp.output?.pause ||
    bp.output?.inject

  return (
    <div className="rounded-lg border dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <span className="flex-1 font-mono text-xs font-medium">
          {bp.service}.{bp.method}
        </span>
        {/* 延迟控制 */}
        <label className="flex items-center gap-1 text-[10px]">
          <input
            type="checkbox"
            checked={!!bp.delayMs}
            onChange={(e) => onUpdate({ ...bp, delayMs: e.target.checked ? 500 : undefined })}
            className="size-3"
          />
          <input
            type="number"
            value={bp.delayMs || ''}
            onChange={(e) => onUpdate({ ...bp, delayMs: Number(e.target.value) || undefined })}
            placeholder={t('breakpoints.ms')}
            className="w-12 rounded border bg-transparent px-1 py-0.5 text-[10px] dark:border-gray-600"
            disabled={!bp.delayMs}
          />
          {t('breakpoints.ms')}
        </label>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash className="size-3.5" />
        </button>
      </div>

      {/* 展开的详细配置 */}
      {expanded && (
        <div className="space-y-2 border-t p-2 dark:border-gray-700">
          {/* Input 断点 */}
          <div className="rounded bg-blue-50 p-2 dark:bg-blue-900/20">
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              <span className="size-2 rounded-full bg-blue-500" />
              {t('breakpoints.input')}
              <span className="text-gray-400">{t('breakpoints.inputHint')}</span>
            </div>
            <div className="space-y-1.5">
              {/* 暂停 */}
              <label className="flex items-center gap-2 text-[10px]">
                <input
                  type="checkbox"
                  checked={bp.input?.pause || false}
                  onChange={(e) => updateInput({ pause: e.target.checked })}
                  className="size-3"
                />
                <span>{t('breakpoints.pause')}</span>
                <input
                  type="text"
                  value={bp.input?.pauseCondition || ''}
                  onChange={(e) => updateInput({ pauseCondition: e.target.value || undefined })}
                  placeholder={t('breakpoints.pauseConditionPlaceholder')}
                  className="flex-1 rounded border bg-transparent px-1.5 py-0.5 text-[10px] font-mono dark:border-gray-600"
                  disabled={!bp.input?.pause}
                />
              </label>
              {/* 注入 */}
              <label className="flex items-start gap-2 text-[10px]">
                <input
                  type="checkbox"
                  checked={!!bp.input?.inject}
                  onChange={(e) => updateInput({ inject: e.target.checked ? '' : undefined })}
                  className="mt-1 size-3"
                />
                <span className="mt-0.5">{t('breakpoints.inject')}</span>
                <textarea
                  value={bp.input?.inject || ''}
                  onChange={(e) => updateInput({ inject: e.target.value || undefined })}
                  placeholder={t('breakpoints.injectInputPlaceholder')}
                  className="flex-1 resize-none rounded border bg-transparent px-1.5 py-1 font-mono text-[10px] dark:border-gray-600"
                  rows={2}
                  disabled={bp.input?.inject === undefined}
                />
              </label>
            </div>
          </div>

          {/* Output 断点 */}
          <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-green-600 dark:text-green-400">
              <span className="size-2 rounded-full bg-green-500" />
              {t('breakpoints.output')}
              <span className="text-gray-400">{t('breakpoints.outputHint')}</span>
            </div>
            <div className="space-y-1.5">
              {/* 暂停 */}
              <label className="flex items-center gap-2 text-[10px]">
                <input
                  type="checkbox"
                  checked={bp.output?.pause || false}
                  onChange={(e) => updateOutput({ pause: e.target.checked })}
                  className="size-3"
                />
                <span>{t('breakpoints.pause')}</span>
                <input
                  type="text"
                  value={bp.output?.pauseCondition || ''}
                  onChange={(e) => updateOutput({ pauseCondition: e.target.value || undefined })}
                  placeholder={t('breakpoints.pauseConditionPlaceholder')}
                  className="flex-1 rounded border bg-transparent px-1.5 py-0.5 text-[10px] font-mono dark:border-gray-600"
                  disabled={!bp.output?.pause}
                />
              </label>
              {/* 注入 */}
              <label className="flex items-start gap-2 text-[10px]">
                <input
                  type="checkbox"
                  checked={!!bp.output?.inject}
                  onChange={(e) => updateOutput({ inject: e.target.checked ? '' : undefined })}
                  className="mt-1 size-3"
                />
                <span className="mt-0.5">{t('breakpoints.inject')}</span>
                <textarea
                  value={bp.output?.inject || ''}
                  onChange={(e) => updateOutput({ inject: e.target.value || undefined })}
                  placeholder={t('breakpoints.injectOutputPlaceholder')}
                  className="flex-1 resize-none rounded border bg-transparent px-1.5 py-1 font-mono text-[10px] dark:border-gray-600"
                  rows={2}
                  disabled={bp.output?.inject === undefined}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 未展开时显示摘要 */}
      {!expanded && hasAnyConfig && (
        <div className="flex flex-wrap gap-1 border-t px-2 py-1 dark:border-gray-700">
          {bp.delayMs && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] dark:bg-gray-800">
              {t('breakpoints.summary.delay', { ms: bp.delayMs })}
            </span>
          )}
          {bp.input?.pause && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] dark:bg-blue-900">
              {t('breakpoints.summary.inputPause')}
            </span>
          )}
          {bp.input?.inject && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] dark:bg-blue-900">
              {t('breakpoints.summary.inputInject')}
            </span>
          )}
          {bp.output?.pause && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] dark:bg-green-900">
              {t('breakpoints.summary.outputPause')}
            </span>
          )}
          {bp.output?.inject && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] dark:bg-green-900">
              {t('breakpoints.summary.outputInject')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** 添加断点对话框 */
function AddBreakpointDialog({
  onAdd,
  onClose,
}: {
  onAdd: (service: string, method: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation('devtools')
  const services = useMemo(() => getAvailableServices(), [])
  const [selectedService, setSelectedService] = useState(services[0]?.service || '')
  const [selectedMethod, setSelectedMethod] = useState(services[0]?.methods[0] || '')

  const currentMethods = useMemo(
    () => services.find((s) => s.service === selectedService)?.methods || [],
    [services, selectedService],
  )

  useEffect(() => {
    if (currentMethods.length > 0 && !currentMethods.includes(selectedMethod)) {
      setSelectedMethod(currentMethods[0] ?? '')
    }
  }, [currentMethods, selectedMethod])

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">{t('breakpoints.addDialogTitle')}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-2">
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full rounded border bg-transparent px-2 py-1.5 text-sm dark:border-gray-600"
        >
          {services.map((s) => (
            <option key={s.service} value={s.service}>
              {s.service}
            </option>
          ))}
        </select>
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full rounded border bg-transparent px-2 py-1.5 text-sm dark:border-gray-600"
        >
          {currentMethods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            onAdd(selectedService, selectedMethod)
            onClose()
          }}
          className="w-full rounded bg-orange-500 py-1.5 text-sm text-white hover:bg-orange-600"
        >
          {t('breakpoints.add')}
        </button>
      </div>
    </div>
  )
}

/** 断点面板主组件 */
export function BreakpointPanel({ 
  onOpenConsole 
}: { 
  onOpenConsole?: ((command: string) => void) | undefined
} = {}) {
  const { t } = useTranslation('devtools')
  const [breakpoints, setBreakpoints] = useState<BreakpointConfig[]>(() => getBreakpoints())
  const [pausedReqs, setPausedReqs] = useState<PausedRequest[]>(() => getPausedRequests())
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    return subscribeBreakpoints(() => {
      setBreakpoints(getBreakpoints())
      setPausedReqs(getPausedRequests())
    })
  }, [])

  const handleAdd = useCallback((service: string, method: string) => {
    setBreakpoint({ service, method })
  }, [])

  const handleUpdate = useCallback((bp: BreakpointConfig) => {
    setBreakpoint(bp)
  }, [])

  const handleRemove = useCallback((service: string, method: string) => {
    removeBreakpoint(service, method)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-2 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500">{t('breakpoints.title')}</span>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1 rounded bg-orange-500 px-2 py-0.5 text-xs text-white hover:bg-orange-600"
        >
          <Plus className="size-3" />
          {t('breakpoints.add')}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {/* 添加对话框 */}
        {showAddDialog && (
          <div className="mb-3">
            <AddBreakpointDialog onAdd={handleAdd} onClose={() => setShowAddDialog(false)} />
          </div>
        )}

        {/* 暂停的请求 */}
        {pausedReqs.length > 0 && (
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-1 text-xs font-medium text-orange-500">
              <Pause className="size-3" />
              {t('breakpoints.pausedCount', { count: pausedReqs.length })}
            </div>
            <div className="space-y-2">
              {pausedReqs.map((req) => (
                <PausedRequestCard key={req.id} request={req} onOpenConsole={onOpenConsole} />
              ))}
            </div>
          </div>
        )}

        {/* 断点列表 */}
        {breakpoints.length === 0 && !showAddDialog ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Pause className="size-8" />
            <p className="mt-2 text-xs">{t('breakpoints.emptyTitle')}</p>
            <p className="mt-1 text-[10px]">{t('breakpoints.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {breakpoints.map((bp) => (
              <BreakpointCard
                key={`${bp.service}.${bp.method}`}
                bp={bp}
                onUpdate={handleUpdate}
                onRemove={() => handleRemove(bp.service, bp.method)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
