import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconCopy as Copy, IconCheck as Check, IconX as Failed } from '@tabler/icons-react'
import { clipboardService } from '@/services/clipboard'

type CopyStatus = 'idle' | 'copied' | 'failed'

interface CopyableTextProps {
  text: string
  displayText?: string
  className?: string
  iconClassName?: string
  onCopy?: () => void
  testId?: string
}

export function CopyableText({
  text,
  displayText,
  className,
  iconClassName,
  onCopy,
  testId,
}: CopyableTextProps) {
  const { t } = useTranslation('common')
  const [status, setStatus] = useState<CopyStatus>('idle')

  const handleCopy = useCallback(async () => {
    try {
      await clipboardService.write({ text })
      setStatus('copied')
      onCopy?.()
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('failed')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }, [text, onCopy])

  const StatusIcon = status === 'copied' ? Check : status === 'failed' ? Failed : Copy
  const iconColor =
    status === 'copied'
      ? 'text-green-500'
      : status === 'failed'
        ? 'text-red-500'
        : 'text-muted-foreground'

  return (
    <button
      type="button"
      onClick={handleCopy}
      {...(testId && { 'data-testid': testId })}
      className={cn(
        'inline-flex items-center gap-1.5 font-mono transition-colors',
        'hover:text-primary focus-visible:ring-ring rounded focus:outline-none focus-visible:ring-2',
        className,
      )}
      title={text}
      aria-label={status === 'copied' ? t('copiedToClipboard') : t('clickToCopy')}
    >
      <span className="break-all">{displayText ?? text}</span>
      <StatusIcon className={cn('size-4 shrink-0', iconColor, iconClassName)} aria-hidden="true" />
      <span role="status" aria-live="polite" className="sr-only">
        {status === 'copied' ? t('copiedToClipboard') : ''}
      </span>
    </button>
  )
}
