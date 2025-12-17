import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@/stackflow';
import { IconEye as Eye, IconEyeOff as EyeOff, IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { MnemonicDisplay } from '@/components/security/mnemonic-display';
import { PasswordConfirmSheet } from '@/components/security/password-confirm-sheet';
import { useCurrentWallet } from '@/stores';
import { decrypt, type EncryptedData } from '@/lib/crypto';
import { cn } from '@/lib/utils';

/** 自动隐藏时间（毫秒） */
const AUTO_HIDE_TIMEOUT = 30_000;

export function ViewMnemonicPage() {
  const { goBack } = useNavigation();
  const currentWallet = useCurrentWallet();
  const keyType = currentWallet?.keyType ?? 'mnemonic';
  const isArbitrary = keyType === 'arbitrary';

  // 状态
  const [showPasswordSheet, setShowPasswordSheet] = useState(true);
  const [passwordError, setPasswordError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [secret, setSecret] = useState('');
  const [isHidden, setIsHidden] = useState(true);

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

  // 验证密码并解密助记词
  const handleVerifyPassword = useCallback(
    async (password: string) => {
      if (!currentWallet?.encryptedMnemonic) {
        setPasswordError('钱包数据不完整');
        return;
      }

      setIsVerifying(true);
      setPasswordError(undefined);

      try {
        const decrypted = await decrypt(currentWallet.encryptedMnemonic as EncryptedData, password);
        setSecret(decrypted);
        setIsHidden(false);
        setShowPasswordSheet(false);
      } catch {
        setPasswordError('密码错误');
      } finally {
        setIsVerifying(false);
      }
    },
    [currentWallet],
  );

  // 切换显示/隐藏
  const toggleVisibility = () => {
    setIsHidden((prev) => !prev);
  };

  // 取消验证时返回
  const handleCancelVerify = () => {
    setShowPasswordSheet(false);
    goBack();
  };

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={isArbitrary ? '查看密钥' : '查看助记词'} onBack={goBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">请先创建或导入钱包</p>
        </div>
      </div>
    );
  }

  const mnemonicWords = isArbitrary ? [] : secret.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={isArbitrary ? '查看密钥' : '查看助记词'} onBack={goBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 安全警告 */}
        <div className="flex gap-3 rounded-xl bg-amber-500/10 p-4">
          <AlertTriangle className="size-5 shrink-0 text-amber-500" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">安全提示</p>
            <p className="text-muted-foreground">
              请确保周围无人窥视。{isArbitrary ? '密钥' : '助记词'}一旦泄露，资产将面临风险。
            </p>
          </div>
        </div>

        {/* 助记词显示区域 */}
        {secret.length > 0 && (
          <div className="bg-card space-y-4 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isArbitrary ? `${secret.length} 字符` : `${mnemonicWords.length} 位助记词`}
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
                    显示
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3.5" />
                    隐藏
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

            {!isHidden && <p className="text-muted-foreground text-center text-xs">30秒后将自动隐藏</p>}
          </div>
        )}
      </div>

      {/* 密码验证弹窗 */}
      <PasswordConfirmSheet
        open={showPasswordSheet}
        onClose={handleCancelVerify}
        onVerify={handleVerifyPassword}
        title="验证密码"
        description={isArbitrary ? '请输入钱包密码以查看密钥' : '请输入钱包密码以查看助记词'}
        error={passwordError}
        isVerifying={isVerifying}
      />
    </div>
  );
}
