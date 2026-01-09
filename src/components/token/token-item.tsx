import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { ChainIcon, TokenIcon, type ChainType } from '../wallet';
import { AmountDisplay, AnimatedAmount } from '../common';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
   * Render prop for custom actions (e.g., dropdown menu)
   * Receives the token and context for conditional rendering
   * @deprecated Use menuItems instead for dropdown menu
   */
  renderActions?: ((token: TokenInfo, context: TokenItemContext) => React.ReactNode) | undefined;
  /** Main asset symbol of the chain (used to determine isMainAsset) */
  mainAssetSymbol?: string | undefined;
  /**
   * Context menu handler - triggered by:
   * - Right click (desktop)
   * - Long press (mobile)
   * - More button click
   * @deprecated Use menuItems instead for dropdown menu
   */
  onContextMenu?: ((event: React.MouseEvent | React.TouchEvent | null, token: TokenInfo, context: TokenItemContext) => void) | undefined;
  /**
   * Menu items for the dropdown menu (recommended approach)
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
  onContextMenu,
  menuItems,
}: TokenItemProps) {
  const isClickable = !!onClick;
  const { t } = useTranslation(['currency', 'common']);
  const currency = useCurrency();
  
  // Long press support for mobile
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = React.useRef(false);

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

  // Context menu handlers
  const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
    if (onContextMenu) {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu(e, token, context);
    }
  }, [onContextMenu, token, context]);

  const handleMoreButtonClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, token, context);
  }, [onContextMenu, token, context]);

  // Long press handlers for touch devices
  const handleTouchStart = React.useCallback(() => {
    if (!onContextMenu) return;
    
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onContextMenu(null, token, context);
    }, 500); // 500ms long press
  }, [onContextMenu, token, context]);

  const handleTouchEnd = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchMove = React.useCallback(() => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

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
      <ItemMedia variant="image">
        <div className="relative size-full">
          <TokenIcon
            symbol={token.symbol}
            chainId={token.chain}
            imageUrl={token.icon}
            size="lg"
            className="size-full"
          />
          {/* Chain badge */}
          <ChainIcon
            chain={token.chain}
            size="sm"
            className="ring-background absolute -right-0.5 -bottom-0.5 size-4 text-[8px] ring-2"
          />
        </div>
      </ItemMedia>

      {/* Token Info */}
      <ItemContent>
        <ItemTitle>{token.symbol}</ItemTitle>
        <ItemDescription>{token.name}</ItemDescription>
      </ItemContent>

      {/* Balance */}
      <ItemActions>
        <div className="text-right">
          <AnimatedAmount
            value={token.balance}
            loading={loading}
            decimals={token.decimals ?? 8}
            fixedDecimals
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
          {loading && (
            <p className="text-muted-foreground animate-pulse text-xs">
              ≈ --
            </p>
          )}
        </div>
      </ItemActions>
    </>
  );

  // If menuItems is provided, wrap with ContextMenu for better touch interaction
  if (menuItems) {
    const items = menuItems(token, context).filter((item) => item.show !== false);
    
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Item
            {...(testId && { 'data-testid': testId })}
            variant="default"
            size="default"
            render={isClickable ? <button type="button" /> : undefined}
            onClick={onClick}
            aria-label={isClickable ? t('common:a11y.tokenDetails', { token: token.symbol }) : undefined}
            className={cn(
              'cursor-pointer hover:bg-muted/50 active:bg-muted',
              className,
            )}
          >
            {itemContent}
          </Item>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {items.map((item, index) => (
            <ContextMenuItem
              key={index}
              onClick={item.onClick}
              variant={item.variant}
            >
              {item.icon}
              {item.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Legacy: onContextMenu handler
  if (onContextMenu) {
    return (
      <Item
        {...(testId && { 'data-testid': testId })}
        variant="default"
        size="default"
        render={isClickable ? <button type="button" /> : undefined}
        onClick={onClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        aria-label={isClickable ? t('common:a11y.tokenDetails', { token: token.symbol }) : undefined}
        className={cn(
          'cursor-pointer hover:bg-muted/50 active:bg-muted',
          className,
        )}
      >
        {itemContent}
      </Item>
    );
  }

  // Default: no menu
  return (
    <Item
      {...(testId && { 'data-testid': testId })}
      variant="default"
      size="default"
      render={isClickable ? <button type="button" /> : undefined}
      onClick={onClick}
      aria-label={isClickable ? t('common:a11y.tokenDetails', { token: token.symbol }) : undefined}
      className={cn(
        isClickable && 'cursor-pointer hover:bg-muted/50 active:bg-muted',
        className,
      )}
    >
      {itemContent}
      {/* Custom actions slot (deprecated) */}
      {renderActions && (
        <ItemActions onClick={(e) => e.stopPropagation()}>
          {renderActions(token, context)}
        </ItemActions>
      )}
    </Item>
  );
}
