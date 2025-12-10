import { cn } from '@/lib/utils';
import { CheckCircle, ArrowRight, Shield } from 'lucide-react';

interface CreateWalletSuccessProps {
  /** Wallet name */
  walletName: string;
  /** Callback when user chooses to backup mnemonic */
  onBackup?: () => void;
  /** Callback when user chooses to enter wallet */
  onEnterWallet: () => void;
  /** Whether backup is skipped (skipBackup=true) */
  skipBackup?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Success screen shown after wallet creation
 */
export function CreateWalletSuccess({
  walletName,
  onBackup,
  onEnterWallet,
  skipBackup = true,
  className,
}: CreateWalletSuccessProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-8', className)}>
      {/* Success icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
      </div>

      {/* Success message */}
      <h1 className="mb-2 text-2xl font-bold">钱包创建成功！</h1>
      <p className="mb-8 text-center text-muted-foreground">
        您的钱包 <span className="font-medium text-foreground">{walletName}</span> 已创建完成
      </p>

      {/* Backup reminder */}
      {skipBackup && onBackup && (
        <div className="mb-8 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">安全提醒</p>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                请尽快备份助记词，这是恢复钱包的唯一方式。丢失助记词将无法找回您的资产。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="w-full space-y-3">
        {skipBackup && onBackup && (
          <button
            type="button"
            onClick={onBackup}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium text-white transition-colors',
              'bg-primary hover:bg-primary/90',
            )}
          >
            <Shield className="size-5" />
            <span>立即备份助记词</span>
          </button>
        )}

        <button
          type="button"
          onClick={onEnterWallet}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors',
            skipBackup && onBackup
              ? 'border border-border text-foreground hover:bg-muted'
              : 'bg-primary text-white hover:bg-primary/90',
          )}
        >
          <span>{skipBackup && onBackup ? '稍后备份' : '进入钱包'}</span>
          <ArrowRight className="size-5" />
        </button>
      </div>

      {/* Skip backup note */}
      {skipBackup && onBackup && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          您可以稍后在设置中备份助记词
        </p>
      )}
    </div>
  );
}
