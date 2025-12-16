import { cn } from '@/lib/utils';
import {
  IconAlertTriangle as AlertTriangle,
  IconChevronRight as ArrowRight,
  IconWallet as Wallet,
} from '@tabler/icons-react';
import type { DuplicateCheckResult } from '@/services/wallet/types';

interface CollisionConfirmDialogProps {
  /** Duplicate check result */
  result: DuplicateCheckResult;
  /** Confirm replacement callback */
  onConfirm: () => void;
  /** Cancel callback */
  onCancel: () => void;
  /** Whether action is in progress */
  isLoading?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Collision confirmation dialog
 * Shown when recovering a mnemonic that would replace an existing private-key wallet
 */
export function CollisionConfirmDialog({
  result,
  onConfirm,
  onCancel,
  isLoading = false,
  className,
}: CollisionConfirmDialogProps) {
  if (!result.isDuplicate || result.type !== 'privateKey' || !result.matchedWallet) {
    return null;
  }

  const { matchedWallet } = result;

  return (
    <div className={cn('rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4', className)}>
      {/* Warning header */}
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-yellow-500/20 p-2">
          <AlertTriangle className="size-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-yellow-700">检测到地址冲突</h3>
          <p className="mt-1 text-sm text-yellow-600/80">即将导入的助记词包含已存在的钱包地址</p>
        </div>
      </div>

      {/* Collision details */}
      <div className="bg-background/50 mt-4 rounded-lg p-3">
        <div className="flex items-center gap-3">
          {/* Existing wallet */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Wallet className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">{matchedWallet.name}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">私钥导入的钱包</p>
          </div>

          <ArrowRight className="text-muted-foreground size-4" />

          {/* New wallet */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Wallet className="text-primary size-4" />
              <span className="text-sm font-medium">新钱包</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">助记词恢复</p>
          </div>
        </div>

        {/* Matched address */}
        <div className="border-muted-foreground/30 mt-3 rounded border border-dashed px-2 py-1.5">
          <p className="text-muted-foreground truncate font-mono text-xs">{matchedWallet.matchedAddress}</p>
        </div>
      </div>

      {/* Warning message */}
      <p className="mt-3 text-sm text-yellow-600/80">
        确认后，<span className="font-medium">「{matchedWallet.name}」</span> 将被删除，
        新的助记词钱包将包含所有相关地址。
      </p>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            'border-input flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium',
            'hover:bg-muted/50 transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'flex-1 rounded-lg bg-yellow-600 px-4 py-2.5 text-sm font-medium text-white',
            'transition-colors hover:bg-yellow-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isLoading ? '处理中...' : '确认替换'}
        </button>
      </div>
    </div>
  );
}
