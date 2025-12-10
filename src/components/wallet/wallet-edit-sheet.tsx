import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { PasswordConfirmSheet } from '@/components/security/password-confirm-sheet'
import { walletActions, type Wallet } from '@/stores'
import { verifyPassword } from '@/lib/crypto'
import { Pencil, Trash2, AlertTriangle } from 'lucide-react'

interface WalletEditSheetProps {
  /** The wallet to edit */
  wallet: Wallet
  /** Whether the sheet is open */
  open: boolean
  /** Close callback */
  onClose: () => void
  /** Success callback after rename/delete */
  onSuccess?: () => void
  /** Additional class name */
  className?: string
}

type Mode = 'menu' | 'rename' | 'delete-confirm'

/**
 * Sheet for editing wallet (rename/delete)
 */
export function WalletEditSheet({
  wallet,
  open,
  onClose,
  onSuccess,
  className,
}: WalletEditSheetProps) {
  const [mode, setMode] = useState<Mode>('menu')
  const [newName, setNewName] = useState(wallet.name)
  const [passwordError, setPasswordError] = useState<string>()
  const [isVerifying, setIsVerifying] = useState(false)

  // 重置状态
  const handleClose = useCallback(() => {
    setMode('menu')
    setNewName(wallet.name)
    setPasswordError(undefined)
    setIsVerifying(false)
    onClose()
  }, [wallet.name, onClose])

  // 开始重命名
  const handleStartRename = useCallback(() => {
    setNewName(wallet.name)
    setMode('rename')
  }, [wallet.name])

  // 确认重命名
  const handleConfirmRename = useCallback(() => {
    const trimmedName = newName.trim()
    if (!trimmedName) return

    walletActions.updateWalletName(wallet.id, trimmedName)
    onSuccess?.()
    handleClose()
  }, [wallet.id, newName, onSuccess, handleClose])

  // 开始删除流程（显示密码确认）
  const handleStartDelete = useCallback(() => {
    setPasswordError(undefined)
    setMode('delete-confirm')
  }, [])

  // 验证密码并删除
  const handleVerifyAndDelete = useCallback(
    async (password: string) => {
      if (!wallet.encryptedMnemonic) {
        // 没有加密数据，直接删除
        walletActions.deleteWallet(wallet.id)
        onSuccess?.()
        handleClose()
        return
      }

      setIsVerifying(true)
      setPasswordError(undefined)

      try {
        // 验证密码
        const isValid = await verifyPassword(wallet.encryptedMnemonic, password)
        if (!isValid) {
          setPasswordError('密码错误')
          return
        }
        // 密码正确，删除钱包
        walletActions.deleteWallet(wallet.id)
        onSuccess?.()
        handleClose()
      } catch {
        setPasswordError('验证失败')
      } finally {
        setIsVerifying(false)
      }
    },
    [wallet.id, wallet.encryptedMnemonic, onSuccess, handleClose]
  )

  // 返回主菜单
  const handleBackToMenu = useCallback(() => {
    setMode('menu')
    setPasswordError(undefined)
  }, [])

  const canSaveRename = newName.trim().length > 0 && newName.trim() !== wallet.name

  return (
    <>
      {/* 主菜单/重命名 */}
      <BottomSheet
        open={open && mode !== 'delete-confirm'}
        onClose={handleClose}
        title={mode === 'rename' ? '重命名钱包' : '钱包设置'}
        className={className}
      >
        {mode === 'menu' && (
          <div className="p-4 space-y-2">
            {/* 重命名按钮 */}
            <button
              onClick={handleStartRename}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl p-4 transition-colors',
                'hover:bg-muted active:bg-muted/80'
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Pencil className="size-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">重命名</p>
                <p className="text-sm text-muted-foreground">修改钱包名称</p>
              </div>
            </button>

            {/* 删除按钮 */}
            <button
              onClick={handleStartDelete}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl p-4 transition-colors',
                'hover:bg-destructive/10 active:bg-destructive/20'
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-destructive">删除钱包</p>
                <p className="text-sm text-muted-foreground">此操作无法撤销</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'rename' && (
          <div className="p-4 space-y-6">
            {/* 名称输入 */}
            <div className="space-y-2">
              <label htmlFor="wallet-name" className="text-sm font-medium">
                钱包名称
              </label>
              <input
                id="wallet-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="请输入钱包名称"
                maxLength={20}
                autoFocus
                className={cn(
                  'w-full rounded-xl border border-border bg-background px-4 py-3',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
              />
              <p className="text-xs text-muted-foreground text-right">
                {newName.length}/20
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={handleConfirmRename}
                disabled={!canSaveRename}
                className={cn(
                  'w-full rounded-full py-3 font-medium text-white transition-colors',
                  'bg-primary hover:bg-primary/90',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                保存
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
              >
                取消
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
        title="删除钱包"
        description={
          <>
            <span className="flex items-center justify-center gap-2 text-destructive mb-2">
              <AlertTriangle className="size-5" />
              <span className="font-medium">此操作无法撤销</span>
            </span>
            <span className="block">
              请输入密码以确认删除钱包 &ldquo;{wallet.name}&rdquo;
            </span>
          </>
        }
        error={passwordError}
        isVerifying={isVerifying}
      />
    </>
  )
}
