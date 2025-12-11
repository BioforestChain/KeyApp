import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { MnemonicDisplay } from '@/components/security/mnemonic-display'
import { PasswordConfirmSheet } from '@/components/security/password-confirm-sheet'
import { useCurrentWallet } from '@/stores'
import { decrypt, type EncryptedData } from '@/lib/crypto'
import { cn } from '@/lib/utils'

/** 自动隐藏时间（毫秒） */
const AUTO_HIDE_TIMEOUT = 30_000

export function ViewMnemonicPage() {
  const navigate = useNavigate()
  const currentWallet = useCurrentWallet()

  // 状态
  const [showPasswordSheet, setShowPasswordSheet] = useState(true)
  const [passwordError, setPasswordError] = useState<string>()
  const [isVerifying, setIsVerifying] = useState(false)
  const [mnemonic, setMnemonic] = useState<string[]>([])
  const [isHidden, setIsHidden] = useState(true)

  // 自动隐藏计时器
  useEffect(() => {
    if (mnemonic.length > 0 && !isHidden) {
      const timer = setTimeout(() => {
        setIsHidden(true)
      }, AUTO_HIDE_TIMEOUT)

      return () => clearTimeout(timer)
    }
  }, [mnemonic.length, isHidden])

  // 页面离开/后台时隐藏助记词
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mnemonic.length > 0) {
        setIsHidden(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [mnemonic.length])

  // 验证密码并解密助记词
  const handleVerifyPassword = useCallback(
    async (password: string) => {
      if (!currentWallet?.encryptedMnemonic) {
        setPasswordError('钱包数据不完整')
        return
      }

      setIsVerifying(true)
      setPasswordError(undefined)

      try {
        const decrypted = await decrypt(
          currentWallet.encryptedMnemonic as EncryptedData,
          password
        )
        const words = decrypted.split(' ')
        setMnemonic(words)
        setIsHidden(false)
        setShowPasswordSheet(false)
      } catch {
        setPasswordError('密码错误')
      } finally {
        setIsVerifying(false)
      }
    },
    [currentWallet]
  )

  // 切换显示/隐藏
  const toggleVisibility = () => {
    setIsHidden((prev) => !prev)
  }

  // 返回设置页
  const handleBack = () => {
    navigate({ to: '/settings' })
  }

  // 取消验证时返回
  const handleCancelVerify = () => {
    setShowPasswordSheet(false)
    handleBack()
  }

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <PageHeader title="查看助记词" onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">请先创建或导入钱包</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title="查看助记词" onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 安全警告 */}
        <div className="flex gap-3 rounded-xl bg-amber-500/10 p-4">
          <AlertTriangle className="size-5 shrink-0 text-amber-500" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              安全提示
            </p>
            <p className="text-muted-foreground">
              请确保周围无人窥视。助记词是恢复钱包的唯一凭证，一旦泄露，资产将面临风险。
            </p>
          </div>
        </div>

        {/* 助记词显示区域 */}
        {mnemonic.length > 0 && (
          <div className="space-y-4 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {mnemonic.length} 位助记词
              </span>
              <button
                onClick={toggleVisibility}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                  'bg-muted hover:bg-muted/80 transition-colors'
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

            <MnemonicDisplay words={mnemonic} hidden={isHidden} />

            {!isHidden && (
              <p className="text-center text-xs text-muted-foreground">
                30秒后将自动隐藏
              </p>
            )}
          </div>
        )}
      </div>

      {/* 密码验证弹窗 */}
      <PasswordConfirmSheet
        open={showPasswordSheet}
        onClose={handleCancelVerify}
        onVerify={handleVerifyPassword}
        title="验证密码"
        description="请输入钱包密码以查看助记词"
        error={passwordError}
        isVerifying={isVerifying}
      />
    </div>
  )
}
