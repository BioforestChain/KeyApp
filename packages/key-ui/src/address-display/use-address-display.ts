'use client'
import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import {
  truncateAddress,
  truncateAddressAuto,
  measureText,
  getComputedFont,
  useCopyToClipboard,
} from '@biochain/key-utils'
import type { TruncationMode } from '@biochain/key-utils'

export interface UseAddressDisplayOptions {
  address: string
  mode?: TruncationMode
  startChars?: number
  endChars?: number
  copyable?: boolean
  onCopy?: () => void
}

export interface UseAddressDisplayReturn {
  displayText: string
  containerRef: React.RefObject<HTMLElement | null>
  copied: boolean
  copy: () => Promise<void>
  truncated: boolean
}

export function useAddressDisplay(options: UseAddressDisplayOptions): UseAddressDisplayReturn {
  const {
    address,
    mode = 'auto',
    startChars,
    endChars,
    copyable = true,
    onCopy,
  } = options

  const containerRef = useRef<HTMLElement | null>(null)
  const [displayText, setDisplayText] = useState<string>(address)
  const [truncated, setTruncated] = useState(false)

  const { copied, copy: copyToClipboard } = useCopyToClipboard({
    timeout: 2000,
    onCopy,
  })

  const copy = useCallback(async () => {
    if (copyable && address) {
      await copyToClipboard(address)
    }
  }, [copyable, address, copyToClipboard])

  const updateDisplay = useCallback(() => {
    if (!address) {
      setDisplayText('')
      setTruncated(false)
      return
    }

    // Fixed truncation with startChars/endChars
    if (startChars !== undefined || endChars !== undefined) {
      const start = startChars ?? 6
      const end = endChars ?? 4
      const result = truncateAddress(address, { start, end })
      setDisplayText(result)
      setTruncated(result !== address)
      return
    }

    // Mode-based truncation
    if (mode === 'full') {
      setDisplayText(address)
      setTruncated(false)
      return
    }

    if (mode !== 'auto') {
      const result = truncateAddress(address, mode)
      setDisplayText(result)
      setTruncated(result !== address)
      return
    }

    // Auto mode: responsive truncation
    const container = containerRef.current
    if (!container) {
      setDisplayText(address)
      setTruncated(false)
      return
    }

    const font = getComputedFont(container)
    const iconSpace = copyable ? 24 : 0
    const availableWidth = container.clientWidth - iconSpace

    if (availableWidth <= 0) {
      setDisplayText(address)
      setTruncated(false)
      return
    }

    const result = truncateAddressAuto(address, availableWidth, font, measureText)
    setDisplayText(result)
    setTruncated(result !== address)
  }, [address, mode, startChars, endChars, copyable])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      updateDisplay()
      return
    }

    updateDisplay()

    const observer = new ResizeObserver(updateDisplay)
    observer.observe(container)

    return () => observer.disconnect()
  }, [updateDisplay])

  return {
    displayText,
    containerRef,
    copied,
    copy,
    truncated,
  }
}
