import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { IconCircleCheck as CheckCircle, IconCheck as Check } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { IconCircle, GradientButton, LoadingSpinner, Alert } from '@/components/common';
import { ChainSelector } from '@/components/onboarding/chain-selector';
import { PatternLock, patternToString } from '@/components/security/pattern-lock';
import { useCurrentWallet, useChainConfigs, useSelectedChain, walletActions } from '@/stores';

type Step = 'select' | 'verify' | 'saving' | 'success';

export function WalletChainsPage() {
  const { t } = useTranslation(['wallet', 'onboarding', 'security', 'common']);
  const { goBack } = useNavigation();
  const currentWallet = useCurrentWallet();
  const chainConfigs = useChainConfigs();
  const currentSelectedChain = useSelectedChain();

  const [step, setStep] = useState<Step>('select');
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [pattern, setPattern] = useState<number[]>([]);
  const [verifyError, setVerifyError] = useState(false);
  const initializedRef = useRef(false);

  // 初始化选中的链
  useEffect(() => {
    if (!initializedRef.current && currentWallet) {
      setSelectedChains(currentWallet.chainAddresses.map((ca) => ca.chain));
      initializedRef.current = true;
    }
  }, [currentWallet]);

  // 检查是否有变化
  const hasChanges = useCallback(() => {
    if (!currentWallet) return false;
    const currentChains = new Set(currentWallet.chainAddresses.map((ca) => ca.chain));
    if (currentChains.size !== selectedChains.length) return true;
    return selectedChains.some((chain) => !currentChains.has(chain));
  }, [currentWallet, selectedChains]);

  // 继续到验证步骤
  const handleContinue = useCallback(() => {
    if (!hasChanges()) {
      goBack();
      return;
    }
    setStep('verify');
  }, [hasChanges, goBack]);

  // 验证钱包锁并保存
  const handlePatternComplete = useCallback(
    async (nodes: number[]) => {
      if (!currentWallet || nodes.length < 4) return;

      setVerifyError(false);
      setStep('saving');

      try {
        const patternKey = patternToString(nodes);
        await walletActions.updateWalletChainAddresses(
          currentWallet.id,
          selectedChains,
          patternKey,
          chainConfigs
        );
        
        // 如果当前选中的链不在新的链列表中，自动切换到第一个可用的链
        if (!selectedChains.includes(currentSelectedChain) && selectedChains.length > 0) {
          walletActions.setSelectedChain(selectedChains[0]!);
        }
        
        setStep('success');
        setTimeout(() => {
          goBack();
        }, 1500);
      } catch (error) {
        console.error('Failed to update chain addresses:', error);
        if (error instanceof Error && error.message.includes('decrypt')) {
          setVerifyError(true);
          setPattern([]);
          setStep('verify');
          setTimeout(() => {
            setVerifyError(false);
          }, 1500);
        } else {
          // 其他错误返回选择步骤
          setStep('select');
        }
      }
    },
    [currentWallet, selectedChains, chainConfigs, goBack]
  );

  // 无钱包
  if (!currentWallet) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <PageHeader title={t('wallet:chains.title')} onBack={goBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <Alert variant="warning">{t('wallet:chains.noWallet')}</Alert>
        </div>
      </div>
    );
  }

  // 保存中
  if (step === 'saving') {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <PageHeader title={t('wallet:chains.title')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">{t('wallet:chains.saving')}</p>
        </div>
      </div>
    );
  }

  // 成功
  if (step === 'success') {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <PageHeader title={t('wallet:chains.title')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
            <Check className="size-8 text-green-500" />
          </div>
          <p className="font-medium">{t('wallet:chains.success')}</p>
        </div>
      </div>
    );
  }

  // 验证钱包锁
  if (step === 'verify') {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <PageHeader
          title={t('wallet:chains.verifyTitle')}
          onBack={() => {
            setStep('select');
            setPattern([]);
          }}
        />
        <div className="flex-1 p-4">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold">{t('wallet:chains.verifyTitle')}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('wallet:chains.verifyDesc')}
            </p>
          </div>

          <PatternLock
            value={pattern}
            onChange={setPattern}
            onComplete={handlePatternComplete}
            minPoints={4}
            error={verifyError}
            data-testid="wallet-chains-pattern"
          />
        </div>
      </div>
    );
  }

  // 选择链 - 复用创建钱包的样式
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <PageHeader title={t('wallet:chains.title')} onBack={goBack} />
      <div className="flex-1 space-y-6 p-4">
        <div className="text-center">
          <IconCircle icon={CheckCircle} variant="success" size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-bold">{t('onboarding:chainSelector.title')}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{t('onboarding:chainSelector.subtitle')}</p>
        </div>

        {chainConfigs.length === 0 ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <ChainSelector
            data-testid="wallet-chains-selector"
            chains={chainConfigs}
            selectedChains={selectedChains}
            onSelectionChange={setSelectedChains}
          />
        )}

        <GradientButton
          variant="mint"
          className="w-full"
          data-testid="wallet-chains-save"
          disabled={selectedChains.length === 0}
          onClick={handleContinue}
        >
          {hasChanges() ? t('common:save') : t('common:done')}
        </GradientButton>
      </div>
    </div>
  );
}
