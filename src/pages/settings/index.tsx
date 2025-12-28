import { useState, useEffect } from 'react';
import { useNavigation } from '@/stackflow';
import { useFlow } from '@/stackflow/stackflow';
import { useTranslation } from 'react-i18next';
import {
  IconWallet as Wallet,
  IconAddressBook as BookUser,
  IconLock as Lock,
  IconEye as Eye,
  IconCircleKey as KeyRound,
  IconShieldLock as ShieldLock,
  IconLanguage as Languages,
  IconCoin as DollarSign,
  IconPalette as Palette,
  IconNetwork as Network,
  IconLink as Link,
  IconInfoCircle as Info,
  IconDatabase as Database,
  IconWorld,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCurrentWallet, useLanguage, useCurrency, useTheme, chainConfigStore, chainConfigSelectors } from '@/stores';
import { SettingsItem } from './settings-item';
import { SettingsSection } from './settings-section';
import { AppearanceSheet } from '@/components/settings/appearance-sheet';
import { hasTwoStepSecretSet, submitSetTwoStepSecret, getSetTwoStepSecretFee } from '@/hooks/use-send.bioforest';
import { setSetTwoStepSecretCallback } from '@/stackflow/activities/sheets';

/** 支持的语言显示名称映射 */
const LANGUAGE_NAMES: Record<string, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
};

/** 支持的货币显示名称映射 */
const CURRENCY_NAMES: Record<string, string> = {
  USD: 'USD ($)',
  CNY: 'CNY (¥)',
  EUR: 'EUR (€)',
  JPY: 'JPY (¥)',
  KRW: 'KRW (₩)',
};

export function SettingsPage() {
  const { navigate } = useNavigation();
  const { push } = useFlow();
  const { t } = useTranslation(['settings', 'common', 'security']);
  const currentWallet = useCurrentWallet();
  const currentLanguage = useLanguage();
  const currentCurrency = useCurrency();
  const currentTheme = useTheme();
  const [appearanceSheetOpen, setAppearanceSheetOpen] = useState(false);
  const [twoStepSecretStatus, setTwoStepSecretStatus] = useState<'loading' | 'set' | 'not_set' | 'unavailable'>('loading');

  // Check if pay password is set for BioForest chain
  useEffect(() => {
    async function checkTwoStepSecret() {
      if (!currentWallet) {
        setTwoStepSecretStatus('unavailable');
        return;
      }
      
      // Find BioForest chain address
      const bfmAddress = currentWallet.chainAddresses.find(
        (ca) => ca.chain === 'bfmeta' || ca.chain === 'bfm'
      );
      
      if (!bfmAddress) {
        setTwoStepSecretStatus('unavailable');
        return;
      }

      try {
        const chainConfig = chainConfigSelectors.getChainById(chainConfigStore.state, 'bfmeta');
        if (!chainConfig) {
          setTwoStepSecretStatus('unavailable');
          return;
        }
        
        const hasPassword = await hasTwoStepSecretSet(chainConfig, bfmAddress.address);
        setTwoStepSecretStatus(hasPassword ? 'set' : 'not_set');
      } catch {
        setTwoStepSecretStatus('unavailable');
      }
    }
    
    checkTwoStepSecret();
  }, [currentWallet]);

  const getThemeDisplayName = () => {
    return t(`settings:appearance.${currentTheme}`);
  };

  const getTwoStepSecretStatusText = () => {
    switch (twoStepSecretStatus) {
      case 'loading':
        return '...';
      case 'set':
        return t('security:twoStepSecret.alreadySet');
      case 'not_set':
        return t('security:twoStepSecret.notSet');
      default:
        return t('settings:notSupported');
    }
  };

  const handleSetTwoStepSecret = async () => {
    if (twoStepSecretStatus !== 'not_set' || !currentWallet) return;

    const bfmAddress = currentWallet.chainAddresses.find(
      (ca) => ca.chain === 'bfmeta' || ca.chain === 'bfm'
    );
    if (!bfmAddress) return;

    const chainConfig = chainConfigSelectors.getChainById(chainConfigStore.state, 'bfmeta');
    if (!chainConfig) return;

    // Get fee first
    const fee = await getSetTwoStepSecretFee(chainConfig);

    // Set callback before pushing
    setSetTwoStepSecretCallback(
      async (newTwoStepSecret: string, walletPassword: string) => {
        const result = await submitSetTwoStepSecret({
          chainConfig,
          walletId: currentWallet.id,
          password: walletPassword,
          fromAddress: bfmAddress.address,
          newTwoStepSecret,
        });

        if (result.status === 'ok') {
          setTwoStepSecretStatus('set');
          return { success: true, txHash: result.txHash };
        } else if (result.status === 'password') {
          return { success: false, error: t('security:passwordConfirm.verifying') };
        } else if (result.status === 'already_set') {
          setTwoStepSecretStatus('set');
          return { success: false, error: t('security:twoStepSecret.alreadySet') };
        } else {
          return { success: false, error: result.message };
        }
      },
      fee ?? undefined,
      // checkConfirmed callback - 检查交易是否上链
      async () => {
        const { getAddressInfo } = await import('@/services/bioforest-sdk');
        const apiUrl = chainConfig.api?.url;
        const apiPath = chainConfig.api?.path ?? chainConfig.id;
        if (!apiUrl) return false;
        try {
          const info = await getAddressInfo(apiUrl, apiPath, bfmAddress.address);
          return !!info.secondPublicKey;
        } catch {
          return false;
        }
      }
    );

    push('SetTwoStepSecretJob', { chainName: 'BioForest Chain' });
  };

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('common:a11y.tabSettings')} />

      <div className="flex-1 space-y-4 p-4">
        {/* 钱包信息头 */}
        {currentWallet && (
          <div className="bg-card flex items-center gap-4 rounded-xl p-4 shadow-sm">
            <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full text-2xl">
              {currentWallet.name.slice(0, 1)}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">{currentWallet.name}</h2>
              <p className="text-muted-foreground text-sm">
                {t('settings:chainAddressCount', { count: currentWallet.chainAddresses.length })}
              </p>
            </div>
          </div>
        )}

        {/* 钱包管理 */}
        <SettingsSection title={t('settings:sections.walletManagement')}>
          <SettingsItem
            icon={<Wallet size={20} />}
            label={t('settings:items.walletManagement')}
            onClick={() => navigate({ to: `/wallet/${currentWallet?.id ?? ''}` })}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<Link size={20} />}
            label={t('settings:items.walletChains')}
            onClick={() => navigate({ to: '/settings/wallet-chains' })}
            testId="wallet-chains-button"
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<BookUser size={20} />}
            label={t('settings:items.addressBook')}
            onClick={() => navigate({ to: '/address-book' })}
          />
        </SettingsSection>

        {/* 安全 */}
        <SettingsSection title={t('settings:sections.security')}>
          <SettingsItem
            icon={<Lock size={20} />}
            label={t('settings:items.appLock')}
            value={t('settings:notSupported')}
            disabled
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<Eye size={20} />}
            label={t('settings:items.viewMnemonic')}
            onClick={() => navigate({ to: '/settings/mnemonic' })}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<KeyRound size={20} />}
            label={t('settings:items.changeWalletLock')}
            onClick={() => navigate({ to: '/settings/wallet-lock' })}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<ShieldLock size={20} />}
            label={t('security:twoStepSecret.setup')}
            value={getTwoStepSecretStatusText()}
            onClick={handleSetTwoStepSecret}
            disabled={twoStepSecretStatus === 'set' || twoStepSecretStatus === 'unavailable'}
            testId="set-pay-password-button"
          />
        </SettingsSection>

        {/* 偏好设置 */}
        <SettingsSection title={t('settings:sections.preferences')}>
          <SettingsItem
            icon={<Languages size={20} />}
            label={t('settings:items.language')}
            value={LANGUAGE_NAMES[currentLanguage]}
            onClick={() => navigate({ to: '/settings/language' })}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<DollarSign size={20} />}
            label={t('settings:items.currency')}
            value={CURRENCY_NAMES[currentCurrency]}
            onClick={() => navigate({ to: '/settings/currency' })}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<Palette size={20} />}
            label={t('settings:items.appearance')}
            value={getThemeDisplayName()}
            onClick={() => setAppearanceSheetOpen(true)}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<Network size={20} />}
            label={t('settings:items.chainConfig')}
            onClick={() => navigate({ to: '/settings/chains' })}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<IconWorld size={20} />}
            label="小程序可信源"
            onClick={() => navigate({ to: '/settings/sources' })}
          />
        </SettingsSection>

        {/* 关于 */}
        <SettingsSection title={t('settings:sections.about')}>
          <SettingsItem
            icon={<Info size={20} />}
            label={t('settings:items.aboutApp')}
            value="v1.0.0"
            onClick={() => {
              // TODO: 关于页面
            }}
          />
          <div className="bg-border mx-4 h-px" />
          <SettingsItem
            icon={<Database size={20} />}
            label={t('settings:items.storage')}
            onClick={() => navigate({ to: '/settings/storage' })}
            testId="storage-button"
          />
        </SettingsSection>
      </div>

      <AppearanceSheet
        open={appearanceSheetOpen}
        onOpenChange={setAppearanceSheetOpen}
      />
    </div>
  );
}
