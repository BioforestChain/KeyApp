import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFlow } from '@/stackflow';
import { setPasswordConfirmCallback } from '@/stackflow/activities/sheets';
import { IconEye as Eye, IconEyeOff as EyeOff, IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { MnemonicDisplay } from '@/components/security/mnemonic-display';
import { useCurrentWallet } from '@/stores';
import { decrypt, type EncryptedData } from '@/lib/crypto';
import { cn } from '@/lib/utils';

/** 自动隐藏时间（毫秒） */
const AUTO_HIDE_TIMEOUT = 30_000;

export function ViewMnemonicPage() {
  const { t } = useTranslation('settings');
  const { goBack } = useNavigation();
  const { push } = useFlow();
  const currentWallet = useCurrentWallet();
  const keyType = currentWallet?.keyType ?? 'mnemonic';
  const isArbitrary = keyType === 'arbitrary';

  // 状态
  const [secret, setSecret] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const hasShownPasswordSheet = useRef(false);

  // 自动隐藏计时器
  useEffect(() => {
    if (secret.length > 0 && !isHidden) {
      const timer = setTimeout(() => {
        setIsHidden(true);
      }, AUTO_HIDE_TIMEOUT);

      return () => clearTimeout(timer);
    }
  }, [secret.length, isHidden]);

  // 页面离开/后台时隐藏助记词
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && secret.length > 0) {
        setIsHidden(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [secret.length]);

  // 打开密码验证 Sheet
  useEffect(() => {
    if (hasShownPasswordSheet.current || !currentWallet?.encryptedMnemonic) return;
    hasShownPasswordSheet.current = true;

    // 设置密码验证回调
    setPasswordConfirmCallback(async (password: string) => {
      try {
        const decrypted = await decrypt(currentWallet.encryptedMnemonic as EncryptedData, password);
        setSecret(decrypted);
        setIsHidden(false);
        return true;
      } catch {
        return false;
      }
    });

    // 打开密码验证 Sheet
    push("PasswordConfirmSheetActivity", {
      title: t('viewMnemonic.verifyTitle'),
      description: isArbitrary ? t('viewMnemonic.verifyDescKey') : t('viewMnemonic.verifyDescMnemonic'),
    });
  }, [currentWallet, push, t, isArbitrary]);

  // 切换显示/隐藏
  const toggleVisibility = () => {
    setIsHidden((prev) => !prev);
  };

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={isArbitrary ? t('viewMnemonic.titleKey') : t('viewMnemonic.titleMnemonic')} onBack={goBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('viewMnemonic.noWallet')}</p>
        </div>
      </div>
    );
  }

  const mnemonicWords = isArbitrary ? [] : secret.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={isArbitrary ? t('viewMnemonic.titleKey') : t('viewMnemonic.titleMnemonic')} onBack={goBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 安全警告 */}
        <div className="flex gap-3 rounded-xl bg-amber-500/10 p-4">
          <AlertTriangle className="size-5 shrink-0 text-amber-500" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">{t('viewMnemonic.securityTip')}</p>
            <p className="text-muted-foreground">
              {isArbitrary ? t('viewMnemonic.securityWarningKey') : t('viewMnemonic.securityWarningMnemonic')}
            </p>
          </div>
        </div>

        {/* 助记词显示区域 */}
        {secret.length > 0 && (
          <div className="bg-card space-y-4 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isArbitrary ? t('viewMnemonic.charCount', { count: secret.length }) : t('viewMnemonic.wordCount', { count: mnemonicWords.length })}
              </span>
              <button
                onClick={toggleVisibility}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                  'bg-muted hover:bg-muted/80 transition-colors',
                )}
              >
                {isHidden ? (
                  <>
                    <Eye className="size-3.5" />
                    {t('viewMnemonic.show')}
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3.5" />
                    {t('viewMnemonic.hide')}
                  </>
                )}
              </button>
            </div>

            {isArbitrary ? (
              <textarea
                value={secret}
                readOnly
                rows={4}
                data-testid="secret-textarea"
                className={cn(
                  'bg-background w-full resize-none rounded-lg border px-3 py-3 font-mono text-sm',
                  'focus:outline-none',
                  isHidden ? '[-webkit-text-security:disc]' : '[-webkit-text-security:none]',
                )}
              />
            ) : (
              <MnemonicDisplay words={mnemonicWords} hidden={isHidden} />
            )}

            {!isHidden && <p className="text-muted-foreground text-center text-xs">{t('viewMnemonic.autoHideNote')}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
