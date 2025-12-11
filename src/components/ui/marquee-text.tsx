import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MarqueeTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text content to display */
  children: string
  /** Enable copy-to-clipboard button */
  copyable?: boolean
  /** Animation duration in seconds (default: auto-calculated based on text length) */
  duration?: number
  /** Callback when text is copied */
  onCopy?: () => void
}

/**
 * MarqueeText - Auto-scrolling text for overflowing content
 *
 * Features:
 * - Detects overflow and only animates when needed
 * - Pauses animation on hover/focus
 * - Optional copy-to-clipboard with transient feedback
 */
function MarqueeText({
  children,
  copyable = false,
  duration,
  onCopy,
  className,
  ...props
}: MarqueeTextProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const textRef = React.useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)

  // Detect overflow
  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const textWidth = textRef.current.scrollWidth
        setIsOverflowing(textWidth > containerWidth)
      }
    }

    checkOverflow()

    // Re-check on resize
    const observer = new ResizeObserver(checkOverflow)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [children])

  // Calculate animation duration based on text length
  const animationDuration = React.useMemo(() => {
    if (duration) return duration
    // ~50px per second for comfortable reading
    const textLength = textRef.current?.scrollWidth ?? children.length * 8
    return Math.max(3, textLength / 50)
  }, [duration, children])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(children)
      setIsCopied(true)
      onCopy?.()
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Clipboard API may fail in some contexts
    }
  }

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)
  const handleFocus = () => setIsPaused(true)
  const handleBlur = () => setIsPaused(false)

  return (
    <div
      ref={containerRef}
      data-slot="marquee-text"
      className={cn(
        'relative flex items-center gap-1 overflow-hidden',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      <span
        ref={textRef}
        className={cn(
          'whitespace-nowrap',
          isOverflowing && 'animate-marquee',
          isPaused && 'animate-paused'
        )}
        style={
          isOverflowing
            ? ({ '--marquee-duration': `${animationDuration}s` } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </span>

      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'ml-1 flex-shrink-0 rounded p-0.5',
            'text-muted-foreground hover:text-foreground',
            'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'transition-colors'
          )}
          aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
        >
          {isCopied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      )}
    </div>
  )
}

export { MarqueeText }
