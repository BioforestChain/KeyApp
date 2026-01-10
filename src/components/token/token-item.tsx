import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { IconDotsVertical } from '@tabler/icons-react';
import { ChainIcon, TokenIcon, type ChainType } from '../wallet';
import { AmountDisplay, AnimatedAmount } from '../common';
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { currencies, useCurrency } from '@/stores';
import { getExchangeRate, useExchangeRate } from '@/hooks/use-exchange-rate';
import { Button } from '../ui/button';

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

/** Menu item for token actions dropdown */
export interface TokenMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  /** Condition to show this item (default: true) */
  show?: boolean;
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
   * Render prop for custom actions (e.g., action buttons on the right)
   * Receives the token and context for conditional rendering
   */
  renderActions?: ((token: TokenInfo, context: TokenItemContext) => React.ReactNode) | undefined;
  /** Main asset symbol of the chain (used to determine isMainAsset) */
  mainAssetSymbol?: string | undefined;
  /**
   * Menu items for the context menu (right-click on desktop)
   * Function receives token and context, returns array of menu items
   */
  menuItems?: ((token: TokenInfo, context: TokenItemContext) => TokenMenuItem[]) | undefined;
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
  menuItems,
}: TokenItemProps) {
  const isClickable = !!onClick;
  const { t } = useTranslation(['currency', 'common']);
  const currency = useCurrency();

  // Compute context for renderActions
  const isBioforestChain = BIOFOREST_CHAINS.has(token.chain);
  const isMainAsset = mainAssetSymbol ? token.symbol.toUpperCase() === mainAssetSymbol.toUpperCase() : false;
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

  // Content to render inside the item
  const itemContent = (
    <>
      {/* Token Icon */}
      <ItemMedia variant="image" className="overflow-visible">
        <div className="relative size-full">
          <TokenIcon
            symbol={token.symbol}
            chainId={token.chain}
            imageUrl={token.icon}
            size="lg"
            className="size-full"
          />
          {/* Chain badge - 40% of parent size, positioned at bottom-right */}
          <ChainIcon
            chain={token.chain}
            size="sm"
            className="bg-background ring-background absolute -right-[10%] -bottom-[10%] size-[40%]! text-[0.2em] ring-2"
          />
        </div>
      </ItemMedia>

      {/* Token Info */}
      <ItemContent>
        <ItemTitle>{token.symbol}</ItemTitle>
        <ItemDescription>{token.name}</ItemDescription>
      </ItemContent>

      {/* Balance and Actions */}
      <ItemActions>
        <div className="text-right">
          <AnimatedAmount
            value={token.balance}
            loading={loading}
            decimals={token.decimals ?? 8}
            className="text-sm"
          />
          {displayFiatValue && !loading && (
            <p className="text-muted-foreground text-xs" title={exchangeStatusMessage ?? undefined}>
              ≈ {fiatSymbol}
              <AmountDisplay value={displayFiatValue} size="xs" className="inline" />
              {showChange && token.change24h !== undefined && (
                <AmountDisplay value={token.change24h} sign="always" color="auto" size="xs" className="ml-1 inline" />
              )}
              {showChange && token.change24h !== undefined && '%'}
            </p>
          )}
          {loading && <p className="text-muted-foreground animate-pulse text-xs">≈ --</p>}
        </div>
      </ItemActions>
    </>
  );

  // Get menu items if provided
  const items = menuItems?.(token, context).filter((item) => item.show !== false) ?? [];
  
  // When there are menu items (which render as buttons), Item cannot be a button
  // to avoid button nesting hydration errors
  const hasMenuItems = items.length > 0;
  const shouldRenderAsButton = isClickable && !hasMenuItems;

  return (
    <Item
      {...(testId && { 'data-testid': testId })}
      variant="default"
      size="default"
      render={shouldRenderAsButton ? <button type="button" /> : undefined}
      onClick={shouldRenderAsButton ? onClick : undefined}
      aria-label={shouldRenderAsButton ? t('common:a11y.tokenDetails', { token: token.symbol }) : undefined}
      className={cn(isClickable && 'hover:bg-muted/50 active:bg-muted cursor-pointer', className)}
    >
      {/* When we have menu items, wrap content in a clickable div */}
      {hasMenuItems && isClickable ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          }}
          aria-label={t('common:a11y.tokenDetails', { token: token.symbol })}
          className="flex flex-1 items-center gap-2.5 outline-none"
        >
          {itemContent}
        </div>
      ) : (
        itemContent
      )}

      {/* More button with dropdown menu - min 44x44 touch target */}
      {items.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t('common:a11y.more', '更多操作')}
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-lg"
              />
            }
          >
            <IconDotsVertical className="text-muted-foreground size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            {items.map((item, index) => (
              <DropdownMenuItem key={index} onClick={item.onClick} variant={item.variant}>
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Custom actions slot */}
      {renderActions && !menuItems && (
        <ItemActions onClick={(e) => e.stopPropagation()}>{renderActions(token, context)}</ItemActions>
      )}
    </Item>
  );
}
