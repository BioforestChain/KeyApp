'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'
import type { TruncationMode } from '@biochain/key-utils'
import { useRenderElement } from '../utils/use-render-element'
import type { KeyUIComponentProps } from '../utils/types'
import { useAddressDisplay } from './use-address-display'

export interface AddressDisplayState {
  copied: boolean
  truncated: boolean
  mode: TruncationMode
}

export interface AddressDisplayProps
  extends Omit<KeyUIComponentProps<'button', AddressDisplayState>, 'children'> {
  address: string
  mode?: TruncationMode
  startChars?: number
  endChars?: number
  placeholder?: string
  copyable?: boolean
  onCopy?: () => void
  testId?: string
}

export const AddressDisplay = React.forwardRef(function AddressDisplay(
  componentProps: AddressDisplayProps,
  forwardedRef: React.ForwardedRef<HTMLElement>,
) {
  const {
    address,
    mode = 'auto',
    startChars,
    endChars,
    placeholder = '---',
    copyable = true,
    onCopy,
    testId,
    className,
    render,
    style,
    ...elementProps
  } = componentProps

  const { displayText, containerRef, copied, copy, truncated } = useAddressDisplay({
    address,
    mode,
    startChars,
    endChars,
    copyable,
    onCopy,
  })

  const state: AddressDisplayState = React.useMemo(
    () => ({
      copied,
      truncated,
      mode,
    }),
    [copied, truncated, mode],
  )

  const displayValue = address ? displayText : placeholder
  const isReady = displayText !== ''

  const defaultClassName = cn(
    'relative font-mono text-sm',
    copyable && 'flex w-full items-center gap-1.5 transition-colors hover:text-primary focus-visible:ring-ring rounded focus:outline-none focus-visible:ring-2',
  )

  if (!copyable) {
    return useRenderElement('span', { className, render, style }, {
      state,
      ref: [forwardedRef, containerRef as React.Ref<HTMLElement>],
      props: {
        ...elementProps,
        title: address,
        'aria-label': address,
        ...(testId && { 'data-testid': testId }),
      },
      defaultClassName,
    }) as React.ReactElement
  }

  const handleClick = () => {
    copy()
  }

  return (
    <button
      ref={(el) => {
        ;(containerRef as React.MutableRefObject<HTMLElement | null>).current = el
        if (typeof forwardedRef === 'function') {
          forwardedRef(el)
        } else if (forwardedRef) {
          ;(forwardedRef as React.MutableRefObject<HTMLElement | null>).current = el
        }
      }}
      type="button"
      onClick={handleClick}
      {...(testId && { 'data-testid': testId })}
      className={cn(
        defaultClassName,
        typeof className === 'function' ? className(state) : className,
      )}
      style={typeof style === 'function' ? style(state) : style}
      title={address}
      aria-label={copied ? `已复制 ${address}` : `复制 ${address}`}
      {...elementProps}
    >
      <span className="relative min-w-0 flex-1">
        <span className="invisible" aria-hidden="true">
          0
        </span>
        <span
          {...(testId && { 'data-testid': `${testId}-text` })}
          className={cn('absolute inset-0 truncate', !isReady && 'invisible')}
          aria-hidden="true"
        >
          {displayValue}
        </span>
      </span>
      {copied ? (
        <CheckIcon className="text-green-500 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <CopyIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? '已复制到剪贴板' : ''}
      </span>
    </button>
  )
})

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export namespace AddressDisplay {
  export type State = AddressDisplayState
  export type Props = AddressDisplayProps
}
