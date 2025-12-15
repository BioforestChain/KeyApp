/**
 * 迁移进度步骤
 */

import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { MigrationProgress } from '@/services/migration/types';

interface MigrationProgressStepProps {
  /** 当前进度 */
  progress: MigrationProgress;
}

const STEP_LABELS: Record<MigrationProgress['step'], string> = {
  detecting: 'progress.detecting',
  verifying: 'progress.verifying',
  reading: 'progress.reading',
  transforming: 'progress.transforming',
  importing: 'progress.importing',
  importing_contacts: 'progress.importing_contacts',
  complete: 'progress.complete',
};

const STEP_DEFAULTS: Record<MigrationProgress['step'], string> = {
  detecting: '检测数据...',
  verifying: '验证密码...',
  reading: '读取钱包数据...',
  transforming: '转换数据格式...',
  importing: '导入钱包...',
  importing_contacts: '导入联系人...',
  complete: '迁移完成',
};

export function MigrationProgressStep({ progress }: MigrationProgressStepProps) {
  const { t } = useTranslation('migration');

  const stepLabel = t(STEP_LABELS[progress.step], {
    defaultValue: STEP_DEFAULTS[progress.step],
  });

  const isComplete = progress.step === 'complete';

  return (
    <div className="flex flex-col items-center gap-6 p-6" data-testid="migration-progress-step">
      <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
        {isComplete ? (
          <CheckCircle2 className="text-primary size-8" />
        ) : (
          <Loader2 className="text-primary size-8 animate-spin" />
        )}
      </div>

      <div className="w-full space-y-4 text-center">
        <h2 className="text-xl font-semibold">
          {isComplete
            ? t('progress.title.complete', { defaultValue: '迁移完成' })
            : t('progress.title.migrating', { defaultValue: '正在迁移...' })}
        </h2>

        <p className="text-muted-foreground text-sm">{stepLabel}</p>

        {progress.currentWallet && (
          <p className="text-muted-foreground text-sm">
            {t('progress.currentWallet', {
              defaultValue: '当前: {{name}}',
              name: progress.currentWallet,
            })}
          </p>
        )}

        {progress.totalWallets !== undefined && progress.processedWallets !== undefined && (
          <p className="text-muted-foreground text-sm">
            {t('progress.walletCount', {
              defaultValue: '{{processed}} / {{total}} 个钱包',
              processed: progress.processedWallets,
              total: progress.totalWallets,
            })}
          </p>
        )}

        <Progress value={progress.percent} className="h-2" data-testid="migration-progress-bar" />

        <p className="text-muted-foreground text-xs">{progress.percent}%</p>
      </div>
    </div>
  );
}
