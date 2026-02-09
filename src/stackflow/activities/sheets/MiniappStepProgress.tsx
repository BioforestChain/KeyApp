import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

interface MiniappStepProgressProps {
  currentStep: number;
  totalSteps: number;
  percent: number;
  className?: string;
}

export function MiniappStepProgress({ currentStep, totalSteps, percent, className }: MiniappStepProgressProps) {
  const { t } = useTranslation('common');

  return (
    <div className={className} data-testid="miniapp-step-progress">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{t('stepProgress')}</span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {t('stepFraction', { current: currentStep, total: totalSteps })}
        </span>
      </div>
      <Progress value={percent} className="w-full" aria-label={t('stepProgressAriaLabel')} />
    </div>
  );
}

