import { useState, useCallback } from 'react'
import type { BioAccount } from '@aspect-aspect/bio-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Step = 'connect' | 'select-source' | 'select-target' | 'confirm' | 'success'

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [sourceAccount, setSourceAccount] = useState<BioAccount | null>(null)
  const [targetAccount, setTargetAccount] = useState<BioAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK 未初始化')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const accounts = await window.bio.request<BioAccount[]>({
        method: 'bio_requestAccounts',
      })

      if (accounts.length > 0) {
        setStep('select-source')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelectSource = useCallback(async () => {
    if (!window.bio) return

    setLoading(true)
    setError(null)

    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: 'bioforest' }],
      })
      setSourceAccount(account)
      setStep('select-target')
    } catch (err) {
      setError(err instanceof Error ? err.message : '选择失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelectTarget = useCallback(async () => {
    if (!window.bio || !sourceAccount) return

    setLoading(true)
    setError(null)

    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_pickWallet',
        params: [{ chain: 'bioforest', exclude: sourceAccount.address }],
      })
      setTargetAccount(account)
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : '选择失败')
    } finally {
      setLoading(false)
    }
  }, [sourceAccount])

  const handleConfirm = useCallback(async () => {
    if (!window.bio || !sourceAccount) return

    setLoading(true)
    setError(null)

    try {
      await window.bio.request<string>({
        method: 'bio_signMessage',
        params: [{
          message: `Authorize asset transfer from ${sourceAccount.address} to ${targetAccount?.address}`,
          address: sourceAccount.address,
        }],
      })

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '签名失败')
    } finally {
      setLoading(false)
    }
  }, [sourceAccount, targetAccount])

  const handleReset = useCallback(() => {
    setStep('connect')
    setSourceAccount(null)
    setTargetAccount(null)
    setError(null)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">一键传送</CardTitle>
          <CardDescription>将资产从一个钱包转移到另一个钱包</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 'connect' && (
            <div className="flex flex-col items-center gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-center text-sm">
                连接钱包以开始传送
              </p>
              <Button 
                className="w-full h-11" 
                onClick={handleConnect} 
                disabled={loading}
              >
                {loading ? '连接中...' : '连接钱包'}
              </Button>
            </div>
          )}

          {step === 'select-source' && (
            <div className="flex flex-col items-center gap-4">
              <StepIndicator current={1} total={3} />
              <p className="text-muted-foreground text-center text-sm">
                选择源地址（资产转出方）
              </p>
              <Button 
                className="w-full h-11" 
                onClick={handleSelectSource} 
                disabled={loading}
              >
                {loading ? '选择中...' : '选择源地址'}
              </Button>
            </div>
          )}

          {step === 'select-target' && (
            <div className="flex flex-col gap-4">
              <StepIndicator current={2} total={3} />
              <AddressCard label="源地址" address={sourceAccount?.address} />
              <p className="text-muted-foreground text-center text-sm">
                选择目标地址（资产接收方）
              </p>
              <Button 
                className="w-full h-11" 
                onClick={handleSelectTarget} 
                disabled={loading}
              >
                {loading ? '选择中...' : '选择目标地址'}
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex flex-col gap-4">
              <StepIndicator current={3} total={3} />
              <AddressCard label="从" address={sourceAccount?.address} />
              <div className="flex justify-center">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
              <AddressCard label="到" address={targetAccount?.address} />
              <Button 
                className="w-full h-11" 
                onClick={handleConfirm} 
                disabled={loading}
              >
                {loading ? '签名中...' : '确认传送'}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="size-16 rounded-full bg-success/10 flex items-center justify-center">
                <svg className="size-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">传送请求已提交！</p>
              <Button 
                variant="secondary"
                className="w-full h-11" 
                onClick={handleReset}
              >
                再次传送
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "size-2 rounded-full transition-colors",
            i + 1 <= current ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}

function AddressCard({ label, address }: { label: string; address?: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-xs break-all">{address}</div>
    </div>
  )
}
