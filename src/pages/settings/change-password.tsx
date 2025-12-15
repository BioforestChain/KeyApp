import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PasswordInput } from '@/components/security/password-input';
import { useCurrentWallet, walletActions } from '@/stores';
import { decrypt, encrypt, type EncryptedData } from '@/lib/crypto';
import { cn } from '@/lib/utils';

/** 最小密码长度 */
const MIN_PASSWORD_LENGTH = 8;

export function ChangePasswordPage() {
  const navigate = useNavigate();
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
        setError('钱包数据不完整');
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
          navigate({ to: '/settings' });
        }, 2000);
      } catch {
        setError('当前密码不正确');
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentWallet, currentPassword, newPassword, navigate],
  );

  // 返回设置页
  const handleBack = () => {
    navigate({ to: '/settings' });
  };

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title="修改密码" onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">请先创建或导入钱包</p>
        </div>
      </div>
    );
  }

  // 成功状态
  if (success) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title="修改密码" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <div className="bg-secondary/10 flex size-16 items-center justify-center rounded-full">
            <Check className="text-secondary size-8" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">密码修改成功</h2>
            <p className="text-muted-foreground mt-1 text-sm">正在返回设置页面...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title="修改密码" onBack={handleBack} />

      <form onSubmit={handleSubmit} className="flex-1 space-y-6 p-4">
        {/* 当前密码 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">当前密码</label>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="请输入当前密码"
            disabled={isSubmitting}
          />
        </div>

        {/* 新密码 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">新密码</label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={`请输入新密码（至少 ${MIN_PASSWORD_LENGTH} 位）`}
            showStrength
            disabled={isSubmitting}
          />
        </div>

        {/* 确认新密码 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">确认新密码</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入新密码"
            disabled={isSubmitting}
          />
          {confirmPassword && !confirmPasswordValid && <p className="text-destructive text-sm">两次输入的密码不一致</p>}
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
          {isSubmitting ? '修改中...' : '确认修改'}
        </button>
      </form>
    </div>
  );
}
