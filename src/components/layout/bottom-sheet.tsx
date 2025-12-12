import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

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

// Focusable element selector
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function BottomSheet({
  open,
  onClose,
  title,
  height = 'auto',
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const { t } = useTranslation()

  // Store the previously focused element when opening
  useEffect(() => {
    if (open) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Focus first focusable element when sheet opens
  useEffect(() => {
    if (open && sheetRef.current) {
      // Slight delay to ensure the sheet is fully rendered
      const timeoutId = setTimeout(() => {
        const firstFocusable = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        if (firstFocusable) {
          firstFocusable.focus()
        } else {
          // If no focusable element, focus the sheet itself
          sheetRef.current?.focus()
        }
      }, 50)
      return () => clearTimeout(timeoutId)
    }
  }, [open])

  // Restore focus when sheet closes
  useEffect(() => {
    if (!open && previousActiveElementRef.current) {
      previousActiveElementRef.current.focus()
      previousActiveElementRef.current = null
    }
  }, [open])

  // Handle keyboard navigation (Escape and Tab)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    // Focus trap: keep focus within the sheet
    if (e.key === 'Tab' && sheetRef.current) {
      const focusableElements = sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]

      if (focusableElements.length === 0) return

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

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
        aria-label={title ?? t('a11y.closeDialog')}
        tabIndex={-1}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl animate-slide-in-bottom safe-area-inset-bottom focus:outline-none',
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
