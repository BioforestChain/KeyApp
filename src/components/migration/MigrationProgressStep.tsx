/**
 * 迁移进度步骤
 */

import { useTranslation } from 'react-i18next';
import { IconLoader2 as Loader2, IconCircleCheck as CheckCircle2 } from '@tabler/icons-react';
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

export function MigrationProgressStep({ progress }: MigrationProgressStepProps) {
  const { t } = useTranslation('migration');

  const stepLabel = t(STEP_LABELS[progress.step]);

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
          {isComplete ? t('progress.title.complete') : t('progress.title.migrating')}
        </h2>

        <p className="text-muted-foreground text-sm">{stepLabel}</p>

        {progress.currentWallet && (
          <p className="text-muted-foreground text-sm">
            {t('progress.currentWallet', {
              name: progress.currentWallet,
            })}
          </p>
        )}

        {progress.totalWallets !== undefined && progress.processedWallets !== undefined && (
          <p className="text-muted-foreground text-sm">
            {t('progress.walletCount', {
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
