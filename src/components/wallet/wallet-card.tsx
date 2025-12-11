import { cn } from '@/lib/utils'
import { AddressDisplay } from './address-display'

export interface WalletInfo {
  id: string
  name: string
  address: string
  balance: string
  fiatValue?: string | undefined
  chainName?: string | undefined
  isBackedUp?: boolean | undefined
}

export interface WalletCardProps {
  wallet: WalletInfo
  onCopyAddress?: (() => void) | undefined
  onTransfer?: (() => void) | undefined
  onReceive?: (() => void) | undefined
  className?: string | undefined
}

export function WalletCard({
  wallet,
  onCopyAddress,
  onTransfer,
  onReceive,
  className,
}: WalletCardProps) {
  return (
    <div className={cn('@container', className)}>
      <div
        className={cn(
          'rounded-2xl bg-gradient-purple p-4 text-white',
          '@xs:p-5 @md:p-6'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 @xs:mb-5">
          <div className="flex items-center gap-2 @xs:gap-3">
            <div className="w-8 aspect-square rounded-full bg-white/20 flex items-center justify-center @xs:w-10">
              <span className="text-sm font-bold @xs:text-base">
                {wallet.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-sm @xs:text-base">{wallet.name}</h3>
              {wallet.chainName && (
                <p className="text-xs text-white/70">{wallet.chainName}</p>
              )}
            </div>
          </div>
          
          {wallet.isBackedUp === false && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              未备份
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="mb-4 @xs:mb-5">
          <p className="text-2xl font-bold @xs:text-3xl @md:text-4xl">{wallet.balance}</p>
          {wallet.fiatValue && (
            <p className="text-sm text-white/70 mt-1 @xs:text-base">≈ ${wallet.fiatValue}</p>
          )}
        </div>

        {/* Address */}
        <div className="flex items-center justify-between">
          <AddressDisplay
            address={wallet.address}
            {...(onCopyAddress && { onCopy: onCopyAddress })}
            className="text-white/80 hover:text-white [&_svg]:text-white/60"
          />
        </div>

        {/* Actions */}
        {(onTransfer || onReceive) && (
          <div className="flex gap-2 mt-4 @xs:gap-3 @xs:mt-5">
            {onTransfer && (
              <button
                type="button"
                onClick={onTransfer}
                className="flex-1 py-2 px-4 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors @xs:py-2.5 @xs:text-base"
              >
                转账
              </button>
            )}
            {onReceive && (
              <button
                type="button"
                onClick={onReceive}
                className="flex-1 py-2 px-4 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors @xs:py-2.5 @xs:text-base"
              >
                收款
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
