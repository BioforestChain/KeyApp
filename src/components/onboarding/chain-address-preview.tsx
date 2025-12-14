import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressDisplay } from '@/components/wallet/address-display'
import { ChainIcon } from '@/components/wallet/chain-icon'
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

  const metaById = useMemo(() => {
    const map = new Map<string, ChainConfig>()
    for (const config of enabledBioforestChainConfigs ?? []) map.set(config.id, config)
    return map
  }, [enabledBioforestChainConfigs])

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
        <div className="space-y-3 px-4 py-4" data-testid="address-preview-loading">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 animate-pulse">
              <div className="size-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {addresses.map((item) => {
            const meta = metaById.get(item.chainId)
            return (
              <div key={item.chainId} className="flex items-center gap-3 px-4 py-3">
                <ChainIcon chain={item.chainId} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{meta?.name ?? item.chainId}</div>
                  <div className="mt-1">
                    <AddressDisplay address={item.address} />
                  </div>
                </div>
              </div>
            )
          })}

          {addresses.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              —
            </div>
          )}
        </div>
      )}
    </div>
  )
}
