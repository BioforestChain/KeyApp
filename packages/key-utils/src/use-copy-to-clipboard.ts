'use client'
import { useState, useCallback } from 'react'

export interface UseCopyToClipboardOptions {
  timeout?: number
  onCopy?: () => void
  onError?: (error: Error) => void
}

export interface UseCopyToClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<void>
  reset: () => void
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { timeout = 2000, onCopy, onError } = options
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        onCopy?.()
        setTimeout(() => setCopied(false), timeout)
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to copy')
        onError?.(err)
        
      }
    },
    [timeout, onCopy, onError],
  )

  const reset = useCallback(() => {
    setCopied(false)
  }, [])

  return { copied, copy, reset }
}
