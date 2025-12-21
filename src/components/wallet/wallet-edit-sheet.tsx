import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { PasswordConfirmSheet } from '@/components/security/password-confirm-sheet';
import { walletActions, type Wallet } from '@/stores';
import { verifyPassword } from '@/lib/crypto';
import { IconPencil as Pencil, IconTrash as Trash2 } from '@tabler/icons-react';

interface WalletEditSheetProps {
  /** The wallet to edit */
  wallet: Wallet;
  /** Whether the sheet is open */
  open: boolean;
  /** Close callback */
  onClose: () => void;
  /** Success callback after rename/delete */
  onSuccess?: (action: 'rename' | 'delete') => void;
  /** Initial mode when opening */
  initialMode?: Mode;
  /** Additional class name */
  className?: string;
}

type Mode = 'menu' | 'rename' | 'delete-confirm';

/**
 * Sheet for editing wallet (rename/delete)
 */
export function WalletEditSheet({ wallet, open, onClose, onSuccess, initialMode, className }: WalletEditSheetProps) {
  const { t } = useTranslation('wallet');
  const [mode, setMode] = useState<Mode>('menu');
  const [newName, setNewName] = useState(wallet.name);
  const [passwordError, setPasswordError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync initial mode when opening
  useEffect(() => {
    if (!open) return;
    setMode(initialMode ?? 'menu');
    setNewName(wallet.name);
    setPasswordError(undefined);
    setIsVerifying(false);
  }, [initialMode, open, wallet.name]);

  // 重置状态
  const handleClose = useCallback(() => {
    setMode('menu');
    setNewName(wallet.name);
    setPasswordError(undefined);
    setIsVerifying(false);
    onClose();
  }, [wallet.name, onClose]);

  // 开始重命名
  const handleStartRename = useCallback(() => {
    setNewName(wallet.name);
    setMode('rename');
  }, [wallet.name]);

  // 确认重命名
  const handleConfirmRename = useCallback(() => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    walletActions.updateWalletName(wallet.id, trimmedName);
    onSuccess?.('rename');
    handleClose();
  }, [wallet.id, newName, onSuccess, handleClose]);

  // 开始删除流程（显示密码确认）
  const handleStartDelete = useCallback(() => {
    setPasswordError(undefined);
    setMode('delete-confirm');
  }, []);

  // 验证密码并删除
  const handleVerifyAndDelete = useCallback(
    async (password: string) => {
      if (!wallet.encryptedMnemonic) {
        // 没有加密数据，直接删除
        walletActions.deleteWallet(wallet.id);
        onSuccess?.('delete');
        handleClose();
        return;
      }

      setIsVerifying(true);
      setPasswordError(undefined);

      try {
        // 验证密码
        const isValid = await verifyPassword(wallet.encryptedMnemonic, password);
        if (!isValid) {
          setPasswordError(t('editSheet.passwordError'));
          return;
        }
        // 密码正确，删除钱包
        walletActions.deleteWallet(wallet.id);
        onSuccess?.('delete');
        handleClose();
      } catch {
        setPasswordError(t('editSheet.verifyFailed'));
      } finally {
        setIsVerifying(false);
      }
    },
    [wallet.id, wallet.encryptedMnemonic, onSuccess, handleClose],
  );

  // 返回主菜单
  const handleBackToMenu = useCallback(() => {
    setMode('menu');
    setPasswordError(undefined);
  }, []);

  const canSaveRename = newName.trim().length > 0 && newName.trim() !== wallet.name;

  return (
    <>
      {/* 主菜单/重命名 */}
      <BottomSheet
        open={open && mode !== 'delete-confirm'}
        onClose={handleClose}
        title={mode === 'rename' ? t('editSheet.renameTitle') : t('editSheet.title')}
        className={className}
      >
        {mode === 'menu' && (
          <div className="space-y-2 p-4">
            {/* 重命名按钮 */}
            <button
              onClick={handleStartRename}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl p-4 transition-colors',
                'hover:bg-muted active:bg-muted/80',
              )}
            >
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
                <Pencil className="text-primary size-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{t('editSheet.rename')}</p>
                <p className="text-muted-foreground text-sm">{t('editSheet.renameDesc')}</p>
              </div>
            </button>

            {/* 删除按钮 */}
            <button
              onClick={handleStartDelete}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl p-4 transition-colors',
                'hover:bg-destructive/10 active:bg-destructive/20',
              )}
            >
              <div className="bg-destructive/10 flex size-10 items-center justify-center rounded-full">
                <Trash2 className="text-destructive size-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-destructive font-medium">{t('editSheet.delete')}</p>
                <p className="text-muted-foreground text-sm">{t('editSheet.deleteDesc')}</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'rename' && (
          <div className="space-y-6 p-4">
            {/* 名称输入 */}
            <div className="space-y-2">
              <label htmlFor="wallet-name" className="text-sm font-medium">
                {t('editSheet.walletName')}
              </label>
              <input
                id="wallet-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('editSheet.walletNamePlaceholder')}
                maxLength={20}
                autoFocus
                className={cn(
                  'border-border bg-background w-full rounded-xl border px-4 py-3',
                  'focus:ring-primary focus:ring-2 focus:outline-none',
                )}
              />
              <p className="text-muted-foreground text-right text-xs">{newName.length}/20</p>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={handleConfirmRename}
                disabled={!canSaveRename}
                className={cn(
                  'w-full rounded-full py-3 font-medium text-white transition-colors',
                  'bg-primary hover:bg-primary/90',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {t('editSheet.save')}
              </button>
              <button
                onClick={handleBackToMenu}
                className="text-muted-foreground hover:text-foreground w-full py-2 text-center text-sm"
              >
                {t('editSheet.cancel')}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 删除密码确认 */}
      <PasswordConfirmSheet
        open={open && mode === 'delete-confirm'}
        onClose={handleBackToMenu}
        onVerify={handleVerifyAndDelete}
        title={t('editSheet.deleteTitle')}
        description={t('editSheet.deleteWarning', { name: wallet.name })}
        error={passwordError}
        isVerifying={isVerifying}
      />
    </>
  );
}
