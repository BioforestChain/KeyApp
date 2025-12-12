/**
 * 迁移密码输入步骤
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MigrationPasswordStepProps {
  /** 验证密码 */
  onVerify: (password: string) => Promise<boolean>
  /** 跳过迁移 */
  onSkip: () => void
  /** 剩余重试次数 */
  remainingRetries: number
  /** 是否正在验证 */
  isVerifying?: boolean
}

export function MigrationPasswordStep({
  onVerify,
  onSkip,
  remainingRetries,
  isVerifying = false,
}: MigrationPasswordStepProps) {
  const { t } = useTranslation('migration')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = useCallback(async () => {
    if (!password.trim()) {
      setError(t('password.required', { defaultValue: '请输入密码' }))
      return
    }

    setError(null)
    const isValid = await onVerify(password)

    if (!isValid) {
      setError(
        t('password.incorrect', {
          defaultValue: '密码错误，剩余 {{count}} 次重试',
          count: remainingRetries - 1,
        })
      )
      setPassword('')
    }
  }, [password, onVerify, remainingRetries, t])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isVerifying) {
        handleVerify()
      }
    },
    [handleVerify, isVerifying]
  )

  const showRetryWarning = remainingRetries <= 1

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          {t('password.title', { defaultValue: '验证 mpay 密码' })}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('password.description', {
            defaultValue: '请输入您的 mpay 钱包密码以继续迁移',
          })}
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('password.placeholder', { defaultValue: '输入密码' })}
            disabled={isVerifying}
            className={cn(error && 'border-destructive')}
            autoFocus
            data-testid="migration-password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" />
            <span>{error}</span>
          </div>
        )}

        {showRetryWarning && !error && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="size-4" />
            <span>
              {t('password.lastRetry', {
                defaultValue: '注意：这是最后一次重试机会',
              })}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={handleVerify}
          disabled={isVerifying || !password.trim()}
          size="lg"
          data-testid="migration-password-submit"
        >
          {isVerifying
            ? t('password.verifying', { defaultValue: '验证中...' })
            : t('password.verify', { defaultValue: '验证密码' })}
        </Button>
        <Button
          variant="outline"
          onClick={onSkip}
          disabled={isVerifying}
          size="lg"
          data-testid="migration-skip-btn"
        >
          {t('password.skip', { defaultValue: '跳过，创建新钱包' })}
        </Button>
      </div>
    </div>
  )
}
