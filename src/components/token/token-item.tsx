import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { ChainIcon, TokenIcon, type ChainType } from '../wallet';
import { AmountDisplay, AnimatedAmount } from '../common';
import { currencies, useCurrency } from '@/stores';
import { getExchangeRate, useExchangeRate } from '@/hooks/use-exchange-rate';

function parseFiatNumber(input: string): number | null {
  const normalized = input.replaceAll(',', '').trim();
  if (normalized.length === 0) return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  balance: string;
  /** Token decimals (default: 8 for bioforest chains) */
  decimals?: number | undefined;
  fiatValue?: string | undefined;
  chain: ChainType;
  icon?: string | undefined;
  change24h?: number | undefined;
}

/** Context passed to renderActions for conditional rendering */
export interface TokenItemContext {
  /** Chain type of the token */
  chainType: ChainType;
  /** Whether this is a BioForest chain (supports destroy) */
  isBioforestChain: boolean;
  /** Whether this is the main/native asset of the chain */
  isMainAsset: boolean;
  /** Whether this asset can be destroyed (bioforest + non-main asset) */
  canDestroy: boolean;
}

interface TokenItemProps {
  token: TokenInfo;
  onClick?: (() => void) | undefined;
  showChange?: boolean | undefined;
  /** Whether balance is loading (shows animation) */
  loading?: boolean | undefined;
  className?: string | undefined;
  testId?: string | undefined;
  /** 
   * Render prop for custom actions (e.g., dropdown menu)
   * Receives the token and context for conditional rendering
   */
  renderActions?: ((token: TokenInfo, context: TokenItemContext) => React.ReactNode) | undefined;
  /** Main asset symbol of the chain (used to determine isMainAsset) */
  mainAssetSymbol?: string | undefined;
}

// BioForest chain types that support asset destruction
const BIOFOREST_CHAINS = new Set<ChainType>([
  'bfmeta',
  'ccchain',
  'pmchain',
  'bfchainv2',
  'btgmeta',
  'biwmeta',
  'ethmeta',
  'malibu',
]);

export function TokenItem({ 
  token, 
  onClick, 
  showChange = false, 
  loading = false, 
  className, 
  testId,
  renderActions,
  mainAssetSymbol,
}: TokenItemProps) {
  const isClickable = !!onClick;
  const { t } = useTranslation(['currency', 'common']);
  const currency = useCurrency();

  // Compute context for renderActions
  const isBioforestChain = BIOFOREST_CHAINS.has(token.chain);
  const isMainAsset = mainAssetSymbol 
    ? token.symbol.toUpperCase() === mainAssetSymbol.toUpperCase()
    : false;
  const canDestroy = isBioforestChain && !isMainAsset;

  const context: TokenItemContext = {
    chainType: token.chain,
    isBioforestChain,
    isMainAsset,
    canDestroy,
  };

  const shouldFetchRate = token.fiatValue !== undefined && currency !== 'USD';
  const {
    data: exchangeRateData,
    isLoading: exchangeRateLoading,
    error: exchangeRateError,
  } = useExchangeRate('USD', shouldFetchRate ? [currency] : []);
  const exchangeRate = shouldFetchRate ? getExchangeRate(exchangeRateData, currency) : undefined;

  const usdFiatValue = token.fiatValue !== undefined ? parseFiatNumber(token.fiatValue) : null;
  const normalizedFiatValue =
    token.fiatValue !== undefined ? (usdFiatValue !== null ? String(usdFiatValue) : token.fiatValue) : undefined;

  const canConvert = currency !== 'USD' && exchangeRate !== undefined && usdFiatValue !== null;
  const fiatSymbol = canConvert ? currencies[currency].symbol : currencies.USD.symbol;
  const displayFiatValue =
    canConvert && usdFiatValue !== null ? String(usdFiatValue * exchangeRate) : normalizedFiatValue;

  const exchangeStatusMessage =
    shouldFetchRate && !canConvert
      ? exchangeRateError
        ? t('exchange.error')
        : exchangeRateLoading
          ? t('exchange.loading')
          : t('exchange.unavailable')
      : null;

  return (
    <div
      {...(testId && { 'data-testid': testId })}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      aria-label={isClickable ? t('common:a11y.tokenDetails', { token: token.symbol }) : undefined}
      className={cn(
        '@container flex items-center gap-3 rounded-xl p-3 transition-colors',
        isClickable && 'hover:bg-muted/50 active:bg-muted cursor-pointer',
        className,
      )}
    >
      {/* Token Icon */}
      <div className="relative">
        <TokenIcon
          symbol={token.symbol}
          chainId={token.chain}
          imageUrl={token.icon}
          size="lg"
        />
        {/* Chain badge */}
        <ChainIcon
          chain={token.chain}
          size="sm"
          className="ring-background absolute -right-0.5 -bottom-0.5 size-4 text-[8px] ring-2"
        />
      </div>

      {/* Token Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium @xs:text-base">{token.symbol}</p>
        <p className="text-muted-foreground truncate text-xs @xs:text-sm">{token.name}</p>
      </div>

      {/* Balance */}
      <div className="shrink-0 text-right">
        <AnimatedAmount
          value={token.balance}
          loading={loading}
          decimals={token.decimals ?? 8}
          fixedDecimals
          className="text-sm @xs:text-base"
        />
        {displayFiatValue && !loading && (
          <p className="text-muted-foreground text-xs @xs:text-sm" title={exchangeStatusMessage ?? undefined}>
            ≈ {fiatSymbol}
            <AmountDisplay value={displayFiatValue} size="xs" className="inline" />
            {showChange && token.change24h !== undefined && (
              <AmountDisplay value={token.change24h} sign="always" color="auto" size="xs" className="ml-1 inline" />
            )}
            {showChange && token.change24h !== undefined && '%'}
          </p>
        )}
        {loading && (
          <p className="text-muted-foreground animate-pulse text-xs @xs:text-sm">
            ≈ --
          </p>
        )}
      </div>

      {/* Custom actions slot */}
      {renderActions && (
        <div 
          className="shrink-0" 
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {renderActions(token, context)}
        </div>
      )}
    </div>
  );
}
