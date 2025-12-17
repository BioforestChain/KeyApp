import { cn } from '@/lib/utils';
import { IconCheck as Check } from '@tabler/icons-react';

interface Step {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* 步骤圆点 */}
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-primary/30 ring-2',
                isPending && 'bg-muted text-muted-foreground',
              )}
            >
              {isCompleted ? <Check className="size-4" /> : index + 1}
            </div>

            {/* 连接线 */}
            {index < steps.length - 1 && (
              <div
                className={cn('mx-2 h-0.5 w-8 transition-colors', index < currentIndex ? 'bg-primary' : 'bg-muted')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** 简化版：只显示进度条 */
interface ProgressStepsProps {
  total: number;
  current: number;
  className?: string;
}

export function ProgressSteps({ total, current, className }: ProgressStepsProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn('h-1 flex-1 rounded-full transition-colors', index < current ? 'bg-primary' : 'bg-muted')}
        />
      ))}
    </div>
  );
}
