import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressDisplay } from '@/components/wallet/address-display'
import { deriveBioforestAddresses } from '@/lib/crypto'
import type { ChainConfig } from '@/services/chain-config'
import { cn } from '@/lib/utils'

export interface DerivedAddress {
  chainId: string
  address: string
}

interface ChainAddressPreviewProps {
  secret: string
  enabledBioforestChainConfigs?: readonly ChainConfig[] | null | undefined
  onDerived?: (addresses: DerivedAddress[]) => void
  className?: string
}

export function ChainAddressPreview({
  secret,
  enabledBioforestChainConfigs,
  onDerived,
  className,
}: ChainAddressPreviewProps) {
  const { t } = useTranslation(['onboarding'])
  const [isLoading, setIsLoading] = useState(false)
  const [addresses, setAddresses] = useState<DerivedAddress[]>([])

  useEffect(() => {
    const trimmed = secret.trim()
    if (!trimmed) {
      setIsLoading(false)
      setAddresses([])
      onDerived?.([])
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
      const derived = deriveBioforestAddresses(trimmed, enabledBioforestChainConfigs)
      setAddresses(derived)
      onDerived?.(derived)
      setIsLoading(false)
    }, 120)

    return () => clearTimeout(timer)
  }, [enabledBioforestChainConfigs, onDerived, secret])

  return (
    <div className={cn('overflow-hidden rounded-xl bg-card shadow-sm', className)}>
      <div className="space-y-1 px-4 py-3">
        <div className="text-sm font-medium">{t('onboarding:addressPreview.title')}</div>
        <div className="text-xs text-muted-foreground">{t('onboarding:addressPreview.subtitle')}</div>
      </div>

      <div className="h-px bg-border" />

      {isLoading ? (
        <div className="px-4 py-3 animate-pulse" data-testid="address-preview-loading">
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
      ) : addresses.length > 0 ? (
        <div className="px-4 py-3">
          <AddressDisplay address={addresses[0]!.address} />
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          —
        </div>
      )}
    </div>
  )
}
