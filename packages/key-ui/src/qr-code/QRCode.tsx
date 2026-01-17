'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'

export interface QRCodeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
  level?: 'L' | 'M' | 'Q' | 'H'
  includeMargin?: boolean
  logoUrl?: string
  logoSize?: number
  className?: string
  renderFn?: (props: { value: string; size: number; level: string }) => React.ReactNode
}

export function QRCode({
  value,
  size = 200,
  level = 'M',
  logoUrl,
  logoSize = 40,
  className,
  renderFn,
}: QRCodeProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl bg-white p-4',
        className
      )}
    >
      {renderFn ? (
        renderFn({ value, size, level })
      ) : (
        <div
          className="flex items-center justify-center bg-muted text-muted-foreground text-xs"
          style={{ width: size, height: size }}
        >
          {value.slice(0, 20)}...
        </div>
      )}
      {logoUrl && (
        <div
          className="absolute rounded-lg bg-white p-1"
          style={{
            width: logoSize + 8,
            height: logoSize + 8,
          }}
        >
          <img
            src={logoUrl}
            alt="Logo"
            className="size-full object-contain"
            style={{ width: logoSize, height: logoSize }}
          />
        </div>
      )}
    </div>
  )
}

export interface AddressQRCodeProps {
  address: string
  chain?: string
  size?: number
  className?: string
  renderFn?: QRCodeProps['renderFn']
}

export function AddressQRCode({
  address,
  chain,
  size = 200,
  className,
  renderFn,
}: AddressQRCodeProps) {
  const getQRValue = () => {
    switch (chain) {
      case 'ethereum':
        return `ethereum:${address}`
      case 'bitcoin':
        return `bitcoin:${address}`
      case 'tron':
        return address
      default:
        return address
    }
  }

  return (
    <QRCode
      value={getQRValue()}
      size={size}
      level="H"
      className={className}
      renderFn={renderFn}
    />
  )
}

export namespace QRCode {
  export type Props = QRCodeProps
}

export namespace AddressQRCode {
  export type Props = AddressQRCodeProps
}
