/**
 * mpay 迁移页面
 *
 * 完整迁移流程: 检测 → 密码验证 → 进度 → 完成
 */

import { useState, useCallback } from 'react';
import { useNavigation } from '@/stackflow';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft as ArrowLeft, IconDownload as Download, IconAlertCircle as AlertCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useMigration } from '@/contexts/MigrationContext';
import { MigrationPasswordStep } from '@/components/migration/MigrationPasswordStep';
import { MigrationProgressStep } from '@/components/migration/MigrationProgressStep';
import { MigrationCompleteStep } from '@/components/migration/MigrationCompleteStep';
import { migrationService } from '@/services/migration/migration-service';
import type { MigrationProgress } from '@/services/migration/types';

type MigrationStep = 'detected' | 'password' | 'progress' | 'complete';

interface MigrationResult {
  success: boolean;
  walletCount: number;
  skippedCount: number;
  errorMessage?: string;
}

export function MigrationPage() {
  const { t } = useTranslation('migration');
  const { navigate } = useNavigation();
  const { detection, isDetecting, setProgress, completeMigration, skipMigration, failMigration } = useMigration();

  // 当前步骤
  const [step, setStep] = useState<MigrationStep>('detected');
  // 密码验证状态
  const [isVerifying, setIsVerifying] = useState(false);
  // 当前进度
  const [progress, setLocalProgress] = useState<MigrationProgress>({
    step: 'detecting',
    percent: 0,
  });
  // 迁移结果
  const [result, setResult] = useState<MigrationResult>({
    success: false,
    walletCount: 0,
    skippedCount: 0,
  });

  const handleBack = useCallback(() => {
    navigate({ to: '/welcome' });
  }, [navigate]);

  const handleSkip = useCallback(() => {
    skipMigration();
    navigate({ to: '/wallet/create' });
  }, [navigate, skipMigration]);

  const handleStartMigration = useCallback(() => {
    setStep('password');
  }, []);

  const handleVerifyPassword = useCallback(
    async (password: string): Promise<boolean> => {
      setIsVerifying(true);
      try {
        const isValid = await migrationService.verifyPassword(password);
        if (isValid) {
          // 密码验证通过，开始迁移
          setStep('progress');

          // 执行迁移
          try {
            await migrationService.migrate(password, (prog) => {
              setLocalProgress(prog);
              setProgress(prog);
            });

            // 迁移成功
            setResult({
              success: true,
              walletCount: detection?.walletCount ?? 0,
              skippedCount: 0, // TODO: 从 transform result 获取实际跳过数
            });
            completeMigration();
            setStep('complete');
          } catch (error) {
            // 迁移失败
            setResult({
              success: false,
              walletCount: 0,
              skippedCount: 0,
              errorMessage: error instanceof Error ? error.message : String(error),
            });
            failMigration();
            setStep('complete');
          }
        }
        return isValid;
      } finally {
        setIsVerifying(false);
      }
    },
    [detection?.walletCount, setProgress, completeMigration, failMigration],
  );

  const handleGoHome = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  const handleRetry = useCallback(() => {
    // 重试：回到密码步骤
    setStep('password');
    setResult({
      success: false,
      walletCount: 0,
      skippedCount: 0,
    });
  }, []);

  // 如果没有检测到 mpay 数据，显示提示
  if (!isDetecting && !detection?.hasData) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <div className="flex items-center gap-2 p-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('title', { defaultValue: '钱包迁移' })}</h1>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
            <AlertCircle className="text-muted-foreground size-8" />
          </div>
          <p className="text-muted-foreground mb-8 text-center">
            {t('noDataFound', { defaultValue: '未检测到 mpay 钱包数据' })}
          </p>
          <Button onClick={handleBack}>{t('goBack', { defaultValue: '返回' })}</Button>
        </div>
      </div>
    );
  }

  // 渲染当前步骤
  const renderStep = () => {
    switch (step) {
      case 'detected':
        return (
          <div className="flex flex-1 flex-col items-center justify-center px-8" data-testid="migration-detected-step">
            <div className="bg-primary/10 mb-4 flex size-16 items-center justify-center rounded-full">
              <Download className="text-primary size-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">{t('detected.title', { defaultValue: '检测到 mpay 钱包' })}</h2>
            <p className="text-muted-foreground mb-8 text-center">
              {t('detected.description', {
                defaultValue: '发现 {{count}} 个钱包可以迁移到 KeyApp',
                count: detection?.walletCount ?? 0,
              })}
            </p>

            <div className="w-full max-w-sm space-y-3">
              <Button className="w-full" size="lg" onClick={handleStartMigration} data-testid="migration-start-btn">
                {t('startMigration', { defaultValue: '开始迁移' })}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleSkip}
                data-testid="migration-skip-btn"
              >
                {t('skipMigration', { defaultValue: '跳过，创建新钱包' })}
              </Button>
            </div>
          </div>
        );

      case 'password':
        return (
          <MigrationPasswordStep
            onVerify={handleVerifyPassword}
            onSkip={handleSkip}
            remainingRetries={migrationService.getRemainingRetries()}
            isVerifying={isVerifying}
          />
        );

      case 'progress':
        return <MigrationProgressStep progress={progress} />;

      case 'complete':
        return (
          <MigrationCompleteStep
            success={result.success}
            walletCount={result.walletCount}
            skippedCount={result.skippedCount}
            {...(result.errorMessage !== undefined && { errorMessage: result.errorMessage })}
            onGoHome={handleGoHome}
            onRetry={handleRetry}
          />
        );
    }
  };

  // 是否显示返回按钮（进度中不显示）
  const showBackButton = step !== 'progress';

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {showBackButton && (
        <div className="flex items-center gap-2 p-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('title', { defaultValue: '钱包迁移' })}</h1>
        </div>
      )}

      {renderStep()}
    </div>
  );
}

export default MigrationPage;
