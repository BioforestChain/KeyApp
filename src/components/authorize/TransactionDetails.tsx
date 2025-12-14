import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ChainIcon, type ChainType } from '@/components/wallet/chain-icon'

export interface TransactionDetailsProps {
  /** Sender wallet address */
  from: string
  /** Recipient wallet address */
  to: string
  /** Amount to transfer (formatted string with symbol) */
  amount: string
  /** Network fee (formatted string with symbol) */
  fee?: string
  /** Chain identifier for icon display */
  chainId?: string
  /** Additional class name */
  className?: string
}

const CHAIN_TYPE_MAP: Record<string, ChainType> = {
  ethereum: 'ethereum',
  bitcoin: 'bitcoin',
  tron: 'tron',
  binance: 'binance',
  bsc: 'bsc',
  bfmeta: 'bfmeta',
  ccchain: 'ccchain',
  pmchain: 'pmchain',
  bfchainv2: 'bfchainv2',
  btgmeta: 'btgmeta',
  biwmeta: 'biwmeta',
  ethmeta: 'ethmeta',
  malibu: 'malibu',
  ccc: 'ccc',
}

function formatAddress(address: string): string {
  if (address.length <= 16) return address
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

/**
 * Transaction details display component for signature authorization
 */
export function TransactionDetails({
  from,
  to,
  amount,
  fee,
  chainId,
  className,
}: TransactionDetailsProps) {
  const { t } = useTranslation('authorize')

  const chainType = useMemo(
    () => (chainId ? CHAIN_TYPE_MAP[chainId.toLowerCase()] : undefined),
    [chainId]
  )

  return (
    <section
      className={cn('rounded-xl bg-card p-4 shadow-sm', className)}
      aria-label="Transaction details"
    >
      <div className="space-y-3">
        {/* Chain indicator */}
        {chainType && (
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <ChainIcon chain={chainType} size="sm" />
            <span className="text-sm font-medium capitalize">{chainId}</span>
          </div>
        )}

        {/* From */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('signature.details.from')}
          </span>
          <span className="font-mono text-sm" title={from}>
            {formatAddress(from)}
          </span>
        </div>

        {/* To */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('signature.details.to')}
          </span>
          <span className="font-mono text-sm" title={to}>
            {formatAddress(to)}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('signature.details.amount')}
          </span>
          <span className="text-sm font-medium">{amount}</span>
        </div>

        {/* Fee */}
        {fee && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('signature.details.fee')}
            </span>
            <span className="text-sm text-muted-foreground">{fee}</span>
          </div>
        )}
      </div>
    </section>
  )
}
