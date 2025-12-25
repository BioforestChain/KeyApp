import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ChainIcon } from './chain-icon';
import { IconCopy as Copy, IconCheck as Check } from '@tabler/icons-react';
import { clipboardService } from '@/services/clipboard';

interface ChainAddressDisplayProps {
  /** 链 ID */
  chainId: string;
  /** 链图标 URL（可选，从 chain-config 获取） */
  chainIcon?: string | undefined;
  /** 链符号（可选，用于 fallback） */
  chainSymbol?: string | undefined;
  /** 地址 */
  address: string;
  /** 是否可复制 */
  copyable?: boolean | undefined;
  /** 复制回调 */
  onCopy?: (() => void) | undefined;
  /** 尺寸 */
  size?: 'sm' | 'md' | undefined;
  /** 额外样式 */
  className?: string | undefined;
}

function truncateAddress(address: string, size: 'sm' | 'md'): string {
  const maxLength = size === 'sm' ? 16 : 20;
  if (address.length <= maxLength) return address;
  const startChars = size === 'sm' ? 6 : 8;
  const endChars = size === 'sm' ? 4 : 6;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * 链地址显示组件
 * 
 * 组合显示链图标和地址，支持复制功能
 * 
 * @example
 * <ChainAddressDisplay
 *   chainId={chainConfig.id}
 *   chainIcon={chainConfig.icon}
 *   address="0x1234...5678"
 *   copyable
 * />
 */
export function ChainAddressDisplay({
  chainId,
  chainIcon,
  chainSymbol,
  address,
  copyable = true,
  onCopy,
  size = 'md',
  className,
}: ChainAddressDisplayProps) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await clipboardService.write({ text: address });
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy address');
    }
  }, [address, onCopy]);

  const iconSize = size === 'sm' ? 'sm' : 'md';
  const truncated = truncateAddress(address, size);

  if (!copyable) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <ChainIcon
          chainId={chainId}
          iconUrl={chainIcon}
          symbol={chainSymbol}
          size={iconSize}
        />
        <span
          className={cn(
            'font-mono',
            size === 'sm' ? 'text-xs' : 'text-sm',
          )}
          title={address}
        >
          {truncated}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'flex items-center gap-2 transition-colors',
        'hover:text-primary focus-visible:ring-ring rounded focus:outline-none focus-visible:ring-2',
        className,
      )}
      title={address}
      aria-label={copied ? t('copiedToClipboard') : `${t('copy')} ${address}`}
    >
      <ChainIcon
        chainId={chainId}
        iconUrl={chainIcon}
        symbol={chainSymbol}
        size={iconSize}
      />
      <span
        className={cn(
          'font-mono',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
      >
        {truncated}
      </span>
      {copied ? (
        <Check className="size-4 shrink-0 text-green-500" aria-hidden="true" />
      ) : (
        <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
    </button>
  );
}
