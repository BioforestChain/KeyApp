import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { PatternLock, patternToString } from './pattern-lock';
import { IconCircle, GradientButton } from '@/components/common';
import {
  IconShieldCheck as ShieldCheck,
  IconChevronRight as ArrowRight,
  IconRefresh as Refresh,
} from '@tabler/icons-react';

export interface PatternLockSetupProps {
  /** 设置完成回调，返回图案字符串 */
  onComplete: (patternKey: string) => void;
  /** 最少需要连接的点数 */
  minPoints?: number;
  /** 额外的 className */
  className?: string;
}

type SetupStep = 'set' | 'confirm';

/**
 * 图案锁设置组件
 * 
 * 两步流程：
 * 1. 设置图案
 * 2. 确认图案
 */
export function PatternLockSetup({
  onComplete,
  minPoints = 4,
  className,
}: PatternLockSetupProps) {
  const { t } = useTranslation('security');
  
  const [step, setStep] = useState<SetupStep>('set');
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [secondPattern, setSecondPattern] = useState<number[]>([]);
  const [error, setError] = useState(false);

  // 第一次绘制完成 - 只更新状态，不自动跳转
  const handleFirstComplete = useCallback((_pattern: number[]) => {
    // 用户需要手动点击"下一步"按钮进入确认步骤
  }, []);

  // 第二次绘制完成（确认）
  const handleSecondComplete = useCallback((pattern: number[]) => {
    if (pattern.length >= minPoints) {
      const firstStr = patternToString(firstPattern);
      const secondStr = patternToString(pattern);
      
      if (firstStr === secondStr) {
        // 图案匹配，完成设置
        onComplete(firstStr);
      } else {
        // 图案不匹配，显示错误
        setError(true);
        setTimeout(() => {
          setError(false);
          setSecondPattern([]);
        }, 1500);
      }
    }
  }, [firstPattern, minPoints, onComplete]);

  // 重新设置
  const handleReset = useCallback(() => {
    setStep('set');
    setFirstPattern([]);
    setSecondPattern([]);
    setError(false);
  }, []);

  const isFirstValid = firstPattern.length >= minPoints;

  return (
    <div className={cn('space-y-6', className)}>
      {/* 标题区域 */}
      <div className="text-center">
        <IconCircle icon={<ShieldCheck className="size-full" />} variant="primary" size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">
          {step === 'set' ? t('patternLock.setTitle') : t('patternLock.confirmTitle')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {step === 'set' ? t('patternLock.setDesc') : t('patternLock.confirmDesc')}
        </p>
      </div>

      {/* 图案锁 */}
      {step === 'set' ? (
        <PatternLock
          value={firstPattern}
          onChange={setFirstPattern}
          onComplete={handleFirstComplete}
          minPoints={minPoints}
          data-testid="pattern-lock-set"
        />
      ) : (
        <PatternLock
          value={secondPattern}
          onChange={setSecondPattern}
          onComplete={handleSecondComplete}
          minPoints={minPoints}
          error={error}
          data-testid="pattern-lock-confirm"
        />
      )}

      {/* 错误提示 - 固定高度避免布局抖动 */}
      <div className="h-5">
        {error && (
          <p className="text-destructive text-center text-sm animate-in fade-in" data-testid="pattern-lock-mismatch">
            {t('patternLock.mismatch')}
          </p>
        )}
      </div>

      {/* 操作按钮 - 固定高度避免布局抖动 */}
      <div className="h-12">
        {step === 'set' && isFirstValid && (
          <GradientButton
            variant="mint"
            className="w-full"
            onClick={() => setStep('confirm')}
            data-testid="pattern-lock-next-button"
          >
            {t('patternLock.confirmTitle')}
            <ArrowRight className="ml-2 size-4" />
          </GradientButton>
        )}

        {step === 'confirm' && (
          <button
            type="button"
            onClick={handleReset}
            className="mx-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="pattern-lock-reset-button"
          >
            <Refresh className="size-4" />
            {t('patternLock.reset')}
          </button>
        )}
      </div>
    </div>
  );
}
