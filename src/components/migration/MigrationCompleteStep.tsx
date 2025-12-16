/**
 * 迁移完成步骤
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconCircleCheck as CheckCircle2,
  IconCircleX as XCircle,
  IconAlertTriangle as AlertTriangle,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { WhatsNewSheet } from './WhatsNewSheet';

interface MigrationCompleteStepProps {
  /** 是否成功 */
  success: boolean;
  /** 导入的钱包数量 */
  walletCount?: number;
  /** 跳过的地址数量 */
  skippedCount?: number;
  /** 错误信息 */
  errorMessage?: string;
  /** 前往首页 */
  onGoHome: () => void;
  /** 重试 */
  onRetry?: () => void;
}

export function MigrationCompleteStep({
  success,
  walletCount = 0,
  skippedCount = 0,
  errorMessage,
  onGoHome,
  onRetry,
}: MigrationCompleteStepProps) {
  const { t } = useTranslation('migration');
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 p-6" data-testid="migration-complete-step">
      <div
        className={`flex size-16 items-center justify-center rounded-full ${
          success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}
      >
        {success ? (
          <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="size-8 text-red-600 dark:text-red-400" />
        )}
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">
          {success ? t('welcome_title') : t('complete.error.title', { defaultValue: '迁移失败' })}
        </h2>

        {success ? (
          <>
            <p className="text-muted-foreground text-sm">{t('welcome_subtitle')}</p>
            <p className="text-muted-foreground">
              {t('complete.success.description', {
                defaultValue: '已成功导入 {{count}} 个钱包',
                count: walletCount,
              })}
            </p>
            {skippedCount > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="size-4" />
                <span>
                  {t('complete.success.skipped', {
                    defaultValue: '{{count}} 个地址因不支持的链类型被跳过',
                    count: skippedCount,
                  })}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            {errorMessage ||
              t('complete.error.description', {
                defaultValue: '迁移过程中发生错误，请重试',
              })}
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button onClick={onGoHome} size="lg" data-testid="migration-go-home-btn">
          {success
            ? t('complete.goHome', { defaultValue: '进入钱包' })
            : t('complete.skip', { defaultValue: '跳过，创建新钱包' })}
        </Button>
        {success && (
          <Button
            variant="outline"
            onClick={() => setWhatsNewOpen(true)}
            size="lg"
            data-testid="migration-whats-new-btn"
          >
            {t('whats_new')}
          </Button>
        )}
        {!success && onRetry && (
          <Button variant="outline" onClick={onRetry} size="lg" data-testid="migration-retry-btn">
            {t('complete.retry', { defaultValue: '重试' })}
          </Button>
        )}
      </div>

      <WhatsNewSheet open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />
    </div>
  );
}
