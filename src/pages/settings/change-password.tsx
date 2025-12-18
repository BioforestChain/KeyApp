import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { IconAlertCircle as AlertCircle, IconCheck as Check } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { PasswordInput } from '@/components/security/password-input';
import { useCurrentWallet, walletActions } from '@/stores';
import { decrypt, encrypt, type EncryptedData } from '@/lib/crypto';
import { cn } from '@/lib/utils';

/** 最小密码长度 */
const MIN_PASSWORD_LENGTH = 8;

export function ChangePasswordPage() {
  const { t } = useTranslation('settings');
  const { goBack } = useNavigation();
  const currentWallet = useCurrentWallet();

  // 表单状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI 状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  // 验证
  const currentPasswordValid = currentPassword.length > 0;
  const newPasswordValid = newPassword.length >= MIN_PASSWORD_LENGTH;
  const confirmPasswordValid = confirmPassword === newPassword && confirmPassword.length > 0;
  const canSubmit = currentPasswordValid && newPasswordValid && confirmPasswordValid && !isSubmitting && !success;

  // 提交处理
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentWallet?.encryptedMnemonic) {
        setError(t('changePassword.walletIncomplete'));
        return;
      }

      setIsSubmitting(true);
      setError(undefined);

      try {
        // 1. 验证当前密码（解密助记词）
        const mnemonic = await decrypt(currentWallet.encryptedMnemonic as EncryptedData, currentPassword);

        // 2. 用新密码重新加密
        const newEncryptedMnemonic = await encrypt(mnemonic, newPassword);

        // 3. 更新钱包
        walletActions.updateWalletEncryptedMnemonic(currentWallet.id, newEncryptedMnemonic);

        setSuccess(true);

        // 2秒后返回设置页
        setTimeout(() => {
          goBack();
        }, 2000);
      } catch {
        setError(t('changePassword.currentPasswordError'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentWallet, currentPassword, newPassword, goBack],
  );

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('changePassword.title')} onBack={goBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('changePassword.noWallet')}</p>
        </div>
      </div>
    );
  }

  // 成功状态
  if (success) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('changePassword.title')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <div className="bg-secondary/10 flex size-16 items-center justify-center rounded-full">
            <Check className="text-secondary size-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">{t('changePassword.success')}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{t('changePassword.returning')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('changePassword.title')} onBack={goBack} />

      <form onSubmit={handleSubmit} className="flex-1 space-y-6 p-4">
        {/* 当前密码 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('changePassword.currentPassword')}</label>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('changePassword.currentPasswordPlaceholder')}
            disabled={isSubmitting}
          />
        </div>

        {/* 新密码 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('changePassword.newPassword')}</label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('changePassword.newPasswordPlaceholder', { min: MIN_PASSWORD_LENGTH })}
            showStrength
            disabled={isSubmitting}
          />
        </div>

        {/* 确认新密码 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('changePassword.confirmPassword')}</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('changePassword.confirmPasswordPlaceholder')}
            disabled={isSubmitting}
          />
          {confirmPassword && !confirmPasswordValid && <p className="text-destructive text-sm">{t('changePassword.passwordMismatch')}</p>}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'w-full rounded-full py-3 font-medium text-white transition-colors',
            'bg-primary hover:bg-primary/90',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isSubmitting ? t('changePassword.submitting') : t('changePassword.submit')}
        </button>
      </form>
    </div>
  );
}
