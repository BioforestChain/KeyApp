/**
 * DevPanelShell - 可复用的浮动调试面板外壳
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { IconX as X } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export type DevPanelPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type DevPanelTab<T extends string> = {
  id: T
  icon: ComponentType<{ className?: string }>
  label: string
  badge?: number
}

export interface DevPanelShellProps<T extends string> {
  title: string
  icon: ComponentType<{ className?: string }>
  buttonTitle: string
  tabs: DevPanelTab<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
  children: ReactNode
  footer?: ReactNode
  helpText?: ReactNode
  defaultOpen?: boolean
  position?: DevPanelPosition
  buttonBadge?: number
  buttonPulse?: boolean
  panelSize?: { width: number; height: number }
  buttonSize?: { width: number; height: number }
  panelClassName?: string
  enableTabShortcuts?: boolean
}

const DEFAULT_BUTTON_SIZE = { width: 48, height: 48 }
const DEFAULT_PANEL_SIZE = { width: 380, height: 480 }
const PADDING = 16

function getWindowSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  return { width: window.innerWidth, height: window.innerHeight }
}

/**
 * 根据相对位置(0-1)、元素尺寸、屏幕尺寸计算实际像素位置
 * 自动处理边缘碰撞检测
 */
function calculatePosition(
  relativePos: { x: number; y: number },
  elementSize: { width: number; height: number },
  screenSize: { width: number; height: number },
): { x: number; y: number } {
  const availableWidth = screenSize.width - elementSize.width - PADDING * 2
  const availableHeight = screenSize.height - elementSize.height - PADDING * 2

  const targetX = PADDING + relativePos.x * Math.max(0, availableWidth)
  const targetY = PADDING + relativePos.y * Math.max(0, availableHeight)

  const x = Math.max(PADDING, Math.min(screenSize.width - elementSize.width - PADDING, targetX))
  const y = Math.max(PADDING, Math.min(screenSize.height - elementSize.height - PADDING, targetY))

  return { x, y }
}

/**
 * 从像素位置反推相对位置(0-1)
 */
function pixelToRelative(
  pixelPos: { x: number; y: number },
  elementSize: { width: number; height: number },
  screenSize: { width: number; height: number },
): { x: number; y: number } {
  const availableWidth = screenSize.width - elementSize.width - PADDING * 2
  const availableHeight = screenSize.height - elementSize.height - PADDING * 2

  const x = availableWidth > 0 ? (pixelPos.x - PADDING) / availableWidth : 0
  const y = availableHeight > 0 ? (pixelPos.y - PADDING) / availableHeight : 0

  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  }
}

function getInitialRelativePos(position: DevPanelPosition): { x: number; y: number } {
  switch (position) {
    case 'bottom-left':
      return { x: 0, y: 1 }
    case 'top-right':
      return { x: 1, y: 0 }
    case 'top-left':
      return { x: 0, y: 0 }
    case 'bottom-right':
    default:
      return { x: 1, y: 1 }
  }
}

export function DevPanelShell<T extends string>({
  title,
  icon: Icon,
  buttonTitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  footer,
  helpText,
  defaultOpen = false,
  position = 'bottom-right',
  buttonBadge,
  buttonPulse,
  panelSize = DEFAULT_PANEL_SIZE,
  buttonSize = DEFAULT_BUTTON_SIZE,
  panelClassName,
  enableTabShortcuts = true,
}: DevPanelShellProps<T>) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [relativePos, setRelativePos] = useState(() => getInitialRelativePos(position))
  const [screenSize, setScreenSize] = useState(() => getWindowSize())
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; relX: number; relY: number } | null>(null)
  const hasDraggedRef = useRef(false)
  const DRAG_THRESHOLD = 5

  const elementSize = isOpen ? panelSize : buttonSize
  const buttonPos = useMemo(() => calculatePosition(relativePos, buttonSize, screenSize), [relativePos, buttonSize, screenSize])
  const panelPos = useMemo(() => calculatePosition(relativePos, panelSize, screenSize), [relativePos, panelSize, screenSize])

  useEffect(() => {
    if (!isOpen || !enableTabShortcuts) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey) return

      const key = event.key
      const code = event.code
      const lowerKey = key.toLowerCase()
      const isLeft =
        key === 'ArrowLeft' ||
        code === 'ArrowLeft' ||
        lowerKey === 'arrowleft' ||
        lowerKey === 'b'
      const isRight =
        key === 'ArrowRight' ||
        code === 'ArrowRight' ||
        lowerKey === 'arrowright' ||
        lowerKey === 'f'
      if (!isLeft && !isRight) return

      event.preventDefault()
      event.stopPropagation()

      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
      if (currentIndex === -1) return

      const nextIndex = isLeft
        ? Math.max(0, currentIndex - 1)
        : Math.min(tabs.length - 1, currentIndex + 1)

      if (nextIndex !== currentIndex) {
        onTabChange(tabs[nextIndex].id)
      }
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [activeTab, enableTabShortcuts, isOpen, onTabChange, tabs])

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getWindowSize())
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
    return undefined
  }, [])

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        relX: relativePos.x,
        relY: relativePos.y,
      }
      hasDraggedRef.current = false
      setIsDragging(true)
    },
    [relativePos],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (hasDraggedRef.current) {
        e.preventDefault()
        return
      }
      setIsOpen(true)
    },
    [],
  )

  useEffect(() => {
    if (!isDragging) return undefined

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return

      e.preventDefault()
      e.stopPropagation()

      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY

      const deltaX = clientX - dragStartRef.current.x
      const deltaY = clientY - dragStartRef.current.y

      if (!hasDraggedRef.current && (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)) {
        hasDraggedRef.current = true
      }

      if (hasDraggedRef.current) {
        const startPixelPos = calculatePosition(
          { x: dragStartRef.current.relX, y: dragStartRef.current.relY },
          elementSize,
          screenSize,
        )
        const newPixelPos = { x: startPixelPos.x + deltaX, y: startPixelPos.y + deltaY }
        const newRelativePos = pixelToRelative(newPixelPos, elementSize, screenSize)
        setRelativePos(newRelativePos)
      }
    }

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('mousemove', handleMove, { capture: true })
    document.addEventListener('mouseup', handleEnd, { capture: true })
    document.addEventListener('touchmove', handleMove, { passive: false, capture: true })
    document.addEventListener('touchend', handleEnd, { capture: true })

    return () => {
      document.removeEventListener('mousemove', handleMove, { capture: true })
      document.removeEventListener('mouseup', handleEnd, { capture: true })
      document.removeEventListener('touchmove', handleMove, { capture: true } as EventListenerOptions)
      document.removeEventListener('touchend', handleEnd, { capture: true })
    }
  }, [isDragging, elementSize, screenSize])

  const stopPropagation = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) {
    return (
      <button
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleClick}
        className={cn(
          'fixed z-[9999] flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg',
          isDragging ? 'cursor-grabbing' : 'cursor-pointer hover:scale-110 transition-transform',
          buttonPulse && 'animate-pulse',
        )}
        style={{
          left: buttonPos.x,
          top: buttonPos.y,
          width: buttonSize.width,
          height: buttonSize.height,
          touchAction: 'none',
        }}
        title={buttonTitle}
      >
        <Icon className="size-6" />
        {typeof buttonBadge === 'number' && buttonBadge > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs">
            {buttonBadge > 99 ? '99+' : buttonBadge}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-[9999] flex flex-col overflow-hidden rounded-lg border bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900',
        panelClassName,
      )}
      style={{ left: panelPos.x, top: panelPos.y, width: panelSize.width, height: panelSize.height }}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
    >
      {/* Tabs + Title (顶部) */}
      <div
        className={cn(
          'flex items-center gap-2 bg-orange-500 px-2 py-1.5 text-white select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        style={{ touchAction: 'none' }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="flex items-center gap-1.5 pr-2">
          <Icon className="size-4" />
          <span className="text-xs font-semibold">{title}</span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10',
              )}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(false)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="rounded p-1 hover:bg-white/20"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Help line */}
      {helpText && (
        <div className="border-b px-3 py-1 text-[10px] text-gray-500 dark:border-gray-700">
          {helpText}
        </div>
      )}

      <div className="flex-1 overflow-hidden">{children}</div>

      {footer && (
        <div className="border-t px-3 py-1.5 text-center text-[10px] text-gray-400 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  )
}
