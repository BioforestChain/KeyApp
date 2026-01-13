import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { TxStatusDisplay, type TxStatus } from '@/components/transaction/tx-status-display'
import { PatternLock } from '@/components/security/pattern-lock'
import { PasswordInput } from '@/components/security/password-input'
import { IconAlertCircle, IconLock, IconRefresh } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const meta: Meta = {
  title: 'Sheets/TransferWalletLockJob',
  parameters: {
    layout: 'centered',
  },
}

export default meta

/**
 * 钱包锁验证步骤
 */
export const WalletLockStep: StoryObj = {
  render: () => {
    const [pattern, setPattern] = useState<number[]>([])
    const [error, setError] = useState(false)

    return (
      <div className="w-[375px] rounded-2xl bg-background shadow-xl">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        <div className="px-4 pb-4">
          <h2 className="mb-4 text-center text-lg font-semibold">验证钱包锁</h2>
          <PatternLock
            value={pattern}
            onChange={setPattern}
            onComplete={(nodes) => {
              if (nodes.length < 4) {
                setError(true)
                setPattern([])
              } else {
                setError(false)
              }
            }}
            minPoints={4}
            error={error}
          />
          {error && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-destructive">
              <IconAlertCircle className="size-4" />
              <span>图案错误，请重试</span>
            </div>
          )}
          <button
            type="button"
            className="mt-4 w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            取消
          </button>
        </div>
      </div>
    )
  },
}

/**
 * 二次签名验证步骤
 */
export const TwoStepSecretStep: StoryObj = {
  render: () => {
    const [secret, setSecret] = useState('')
    const [error, setError] = useState<string | null>(null)

    return (
      <div className="w-[375px] rounded-2xl bg-background shadow-xl">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        <div className="space-y-6 p-4">
          <h2 className="text-center text-lg font-semibold">需要安全密码</h2>
          
          <div className="flex items-center justify-center gap-2 text-primary">
            <IconLock className="size-5" />
            <span className="text-sm">该地址已设置安全密码，请输入安全密码确认转账。</span>
          </div>

          <div className="space-y-2">
            <PasswordInput
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value)
                setError(null)
              }}
              placeholder="输入安全密码"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <IconAlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={!secret.trim()}
              onClick={() => setError('安全密码错误')}
              className={cn(
                "w-full rounded-full py-3 font-medium text-primary-foreground transition-colors",
                "bg-primary hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              确认
            </button>

            <button
              type="button"
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )
  },
}

/**
 * 广播中状态
 */
export const BroadcastingState: StoryObj = {
  render: () => {
    return (
      <div className="w-[375px] rounded-2xl bg-background shadow-xl">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        <TxStatusDisplay
          status="broadcasting"
          title={{
            broadcasting: '广播中...',
          }}
          description={{
            broadcasting: '正在将交易广播到网络...',
          }}
        />
      </div>
    )
  },
}

/**
 * 广播成功，等待上链
 */
export const BroadcastedState: StoryObj = {
  render: () => {
    return (
      <div className="w-[375px] rounded-2xl bg-background shadow-xl">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        <TxStatusDisplay
          status="broadcasted"
          txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
          title={{
            broadcasted: '广播成功',
          }}
          description={{
            broadcasted: '交易已广播，等待区块确认...',
          }}
        />
        <div className="px-4 pb-4">
          <button
            type="button"
            className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            关闭
          </button>
        </div>
      </div>
    )
  },
}

/**
 * 广播失败状态
 */
export const FailedState: StoryObj = {
  render: () => {
    const [isRetrying, setIsRetrying] = useState(false)

    return (
      <div className="w-[375px] rounded-2xl bg-background shadow-xl">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        <TxStatusDisplay
          status="failed"
          title={{
            failed: '广播失败',
          }}
          description={{
            failed: '资产余额不足',
          }}
        />
        <div className="space-y-2 px-4 pb-4">
          <button
            type="button"
            onClick={() => {
              setIsRetrying(true)
              setTimeout(() => setIsRetrying(false), 2000)
            }}
            disabled={isRetrying}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <IconRefresh className="size-4" />
            {isRetrying ? '重试中...' : '重试'}
          </button>
          <button
            type="button"
            className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            关闭
          </button>
        </div>
      </div>
    )
  },
}

/**
 * 交易已确认（上链成功）
 */
export const ConfirmedState: StoryObj = {
  render: () => {
    const [countdown, setCountdown] = useState(5)

    return (
      <div className="w-[375px] rounded-2xl bg-background shadow-xl">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        <TxStatusDisplay
          status="confirmed"
          txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
          title={{
            confirmed: '转账成功',
          }}
          description={{
            confirmed: `${countdown}秒后自动关闭`,
          }}
        />
        <div className="px-4 pb-4">
          <button
            type="button"
            className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            关闭 ({countdown}s)
          </button>
        </div>
      </div>
    )
  },
}

/**
 * 完整流程演示
 */
export const FullFlow: StoryObj = {
  render: () => {
    type Step = 'wallet_lock' | 'two_step' | 'broadcasting' | 'broadcasted' | 'confirmed' | 'failed'
    const [step, setStep] = useState<Step>('wallet_lock')
    const [pattern, setPattern] = useState<number[]>([])

    const renderContent = () => {
      switch (step) {
        case 'wallet_lock':
          return (
            <div className="p-4">
              <h2 className="mb-4 text-center text-lg font-semibold">验证钱包锁</h2>
              <PatternLock
                value={pattern}
                onChange={setPattern}
                onComplete={() => setStep('broadcasting')}
                minPoints={4}
              />
              <button
                type="button"
                onClick={() => setStep('two_step')}
                className="mt-4 w-full py-2 text-center text-sm text-primary"
              >
                模拟需要安全密码 →
              </button>
            </div>
          )
        case 'two_step':
          return (
            <div className="space-y-4 p-4">
              <h2 className="text-center text-lg font-semibold">需要安全密码</h2>
              <PasswordInput placeholder="输入安全密码" />
              <button
                type="button"
                onClick={() => setStep('broadcasting')}
                className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground"
              >
                确认
              </button>
            </div>
          )
        case 'broadcasting':
          setTimeout(() => setStep('broadcasted'), 1500)
          return (
            <TxStatusDisplay
              status="broadcasting"
              title={{ broadcasting: '广播中...' }}
              description={{ broadcasting: '正在将交易广播到网络...' }}
            />
          )
        case 'broadcasted':
          return (
            <>
              <TxStatusDisplay
                status="broadcasted"
                txHash="0x1234...abcd"
                title={{ broadcasted: '广播成功' }}
                description={{ broadcasted: '交易已广播，等待区块确认...' }}
              />
              <div className="space-y-2 px-4 pb-4">
                <button
                  type="button"
                  onClick={() => setStep('confirmed')}
                  className="w-full rounded-full bg-green-500 py-2 text-sm text-white"
                >
                  模拟上链成功
                </button>
                <button
                  type="button"
                  onClick={() => setStep('failed')}
                  className="w-full rounded-full bg-red-500 py-2 text-sm text-white"
                >
                  模拟广播失败
                </button>
              </div>
            </>
          )
        case 'confirmed':
          return (
            <>
              <TxStatusDisplay
                status="confirmed"
                txHash="0x1234...abcd"
                title={{ confirmed: '转账成功' }}
                description={{ confirmed: '交易已成功上链' }}
              />
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => { setStep('wallet_lock'); setPattern([]) }}
                  className="w-full py-2 text-center text-sm text-muted-foreground"
                >
                  重新开始
                </button>
              </div>
            </>
          )
        case 'failed':
          return (
            <>
              <TxStatusDisplay
                status="failed"
                title={{ failed: '广播失败' }}
                description={{ failed: '资产余额不足' }}
              />
              <div className="space-y-2 px-4 pb-4">
                <button
                  type="button"
                  onClick={() => setStep('broadcasting')}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-medium text-primary-foreground"
                >
                  <IconRefresh className="size-4" />
                  重试
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('wallet_lock'); setPattern([]) }}
                  className="w-full py-2 text-center text-sm text-muted-foreground"
                >
                  关闭
                </button>
              </div>
            </>
          )
      }
    }

    return (
      <div className="w-[375px] rounded-2xl bg-background shadow-xl">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        {renderContent()}
      </div>
    )
  },
}
