import { useState, useCallback, useRef, useEffect } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { Modal } from '@/components/layout/modal';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconAlertCircle as AlertCircle } from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';

export interface FeeEditConfig {
  currentFee: string;
  minFee: string;
  symbol: string;
  decimals?: number;
  presets?: {
    label: string;
    value: string;
  }[];
}

export interface FeeEditResult {
  fee: string;
}

let pendingConfig: FeeEditConfig | null = null;
let pendingCallback: ((result: FeeEditResult) => void) | null = null;

/**
 * 设置手续费编辑回调
 */
export function setFeeEditCallback(
  config: FeeEditConfig,
  onSubmit: (result: FeeEditResult) => void
) {
  pendingConfig = config;
  pendingCallback = onSubmit;
}

function clearFeeEditCallback() {
  pendingConfig = null;
  pendingCallback = null;
}

type FeeEditJobParams = Record<string, never>;

function FeeEditJobContent() {
  const { t } = useTranslation(['transaction', 'common']);
  const { pop } = useFlow();
  useActivityParams<FeeEditJobParams>();

  const configRef = useRef(pendingConfig);
  const callbackRef = useRef(pendingCallback);
  const initialized = useRef(false);

  if (!initialized.current && pendingConfig) {
    configRef.current = pendingConfig;
    callbackRef.current = pendingCallback;
    clearFeeEditCallback();
    initialized.current = true;
  }

  const config = configRef.current;
  const [fee, setFee] = useState(config?.currentFee ?? '');
  const [error, setError] = useState<string>();

  useEffect(() => {
    return () => {
      clearFeeEditCallback();
    };
  }, []);

  const validateFee = useCallback((value: string): string | undefined => {
    if (!config) return undefined;
    
    const numValue = parseFloat(value);
    const minValue = parseFloat(config.minFee);
    
    if (isNaN(numValue) || numValue <= 0) {
      return t('transaction:feeEdit.invalidFee');
    }
    
    if (numValue < minValue) {
      return t('transaction:feeEdit.belowMinFee', { minFee: config.minFee, symbol: config.symbol });
    }
    
    return undefined;
  }, [config, t]);

  const handleFeeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFee(value);
      setError(undefined);
    }
  }, []);

  const handlePresetSelect = useCallback((value: string) => {
    setFee(value);
    setError(undefined);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateFee(fee);
    if (validationError) {
      setError(validationError);
      return;
    }

    callbackRef.current?.({ fee });
    pop();
  }, [fee, validateFee, pop]);

  const handleCancel = useCallback(() => {
    pop();
  }, [pop]);

  if (!config) {
    return null;
  }

  const defaultPresets = [
    { label: t('transaction:feeEdit.presetMin'), value: config.minFee },
  ];

  const presets = config.presets ?? defaultPresets;

  return (
    <Modal>
      <div className="bg-background rounded-2xl p-4" data-testid="fee-edit-modal">
        <h2 className="mb-4 text-center text-lg font-semibold">
          {t('transaction:feeEdit.title')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 当前手续费提示 */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p>{t('transaction:feeEdit.currentFee')}: {config.currentFee} {config.symbol}</p>
            <p>{t('transaction:feeEdit.minFee')}: {config.minFee} {config.symbol}</p>
          </div>

          {/* 预设选项 */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetSelect(preset.value)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm transition-colors',
                  fee === preset.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 自定义输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('transaction:feeEdit.customFee')}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="decimal"
                value={fee}
                onChange={handleFeeChange}
                placeholder={config.minFee}
                className={cn(error && 'border-destructive')}
                data-testid="fee-input"
              />
              <span className="shrink-0 text-sm text-muted-foreground">
                {config.symbol}
              </span>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              {t('common:cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!fee}
            >
              {t('common:confirm')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export const FeeEditJob: ActivityComponentType<FeeEditJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <FeeEditJobContent />
    </ActivityParamsProvider>
  );
};
