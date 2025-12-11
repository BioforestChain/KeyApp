import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string | undefined
  height?: 'auto' | 'half' | 'full' | undefined
  children: React.ReactNode
  className?: string | undefined
}

const heightClasses = {
  auto: 'max-h-[85vh]',
  half: 'h-[50vh]',
  full: 'h-[100vh]',
}

export function BottomSheet({
  open,
  onClose,
  title,
  height = 'auto',
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? '弹窗'}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl animate-slide-in-bottom safe-area-inset-bottom',
          heightClasses[height],
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>
        
        {/* Title */}
        {title && (
          <div className="px-4 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold text-center">{title}</h2>
          </div>
        )}
        
        {/* Content */}
        <div className={cn('overflow-auto', height === 'auto' ? 'max-h-[calc(85vh-60px)]' : 'flex-1')}>
          {children}
        </div>
      </div>
    </div>
  )
}
