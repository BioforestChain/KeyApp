import { cn } from '@/lib/utils'
import { ChainIcon, type ChainType } from '../wallet/chain-icon'
import { AmountDisplay } from '../common'

export interface TokenInfo {
  symbol: string
  name: string
  balance: string
  fiatValue?: string
  chain: ChainType
  icon?: string
  change24h?: number
}

interface TokenItemProps {
  token: TokenInfo
  onClick?: () => void
  showChange?: boolean
  className?: string
}

export function TokenItem({ token, onClick, showChange = false, className }: TokenItemProps) {
  const isClickable = !!onClick

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-colors @container',
        isClickable && 'cursor-pointer hover:bg-muted/50 active:bg-muted',
        className
      )}
    >
      {/* Token Icon */}
      <div className="relative">
        {token.icon ? (
          <img
            src={token.icon}
            alt={token.symbol}
            className="w-10 aspect-square rounded-full @xs:w-12"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={cn(
          'w-10 aspect-square rounded-full bg-gradient-purple flex items-center justify-center text-white font-bold @xs:w-12',
          token.icon && 'hidden'
        )}>
          {token.symbol.charAt(0)}
        </div>
        {/* Chain badge */}
        <ChainIcon
          chain={token.chain}
          size="sm"
          className="absolute -bottom-0.5 -right-0.5 size-4 text-[8px] ring-2 ring-background"
        />
      </div>

      {/* Token Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate @xs:text-base">{token.symbol}</p>
        <p className="text-xs text-muted truncate @xs:text-sm">{token.name}</p>
      </div>

      {/* Balance */}
      <div className="text-right shrink-0">
        <AmountDisplay 
          value={token.balance} 
          weight="semibold" 
          size="sm"
          className="@xs:text-base"
        />
        {token.fiatValue && (
          <p className="text-xs text-muted @xs:text-sm">
            ≈ $<AmountDisplay value={token.fiatValue} size="xs" className="inline" />
            {showChange && token.change24h !== undefined && (
              <AmountDisplay
                value={token.change24h}
                sign="always"
                color="auto"
                size="xs"
                className="ml-1 inline"
              />
            )}
            {showChange && token.change24h !== undefined && '%'}
          </p>
        )}
      </div>
    </div>
  )
}
