import { useState, useCallback } from 'react'
import type { BioAccount } from '@aspect-aspect/bio-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

type Step = 'connect' | 'input' | 'confirm' | 'pending' | 'success'

const FORGE_ADDRESS = '0xForge...' // Forge contract address
const ETH_TO_BIO_RATE = 10000 // 1 ETH = 10000 BIO

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [ethAccount, setEthAccount] = useState<BioAccount | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const bioAmount = amount ? (parseFloat(amount) * ETH_TO_BIO_RATE).toFixed(2) : '0'

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK 未初始化')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: 'ethereum' }],
      })
      setEthAccount(account)
      setStep('input')
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!window.bio || !ethAccount || !amount) return
    setStep('confirm')
  }, [ethAccount, amount])

  const handleForge = useCallback(async () => {
    if (!window.bio || !ethAccount || !amount) return

    setLoading(true)
    setError(null)

    try {
      const result = await window.bio.request<{ txHash: string }>({
        method: 'bio_sendTransaction',
        params: [{
          from: ethAccount.address,
          to: FORGE_ADDRESS,
          amount: amount,
          chain: 'ethereum',
        }],
      })

      setTxHash(result.txHash)
      setStep('pending')

      // Simulate backend processing
      setTimeout(() => {
        setStep('success')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '交易失败')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }, [ethAccount, amount])

  const handleReset = useCallback(() => {
    setStep('connect')
    setEthAccount(null)
    setAmount('')
    setError(null)
    setTxHash(null)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">锻造</CardTitle>
          <CardDescription>将 ETH 转换为 Bio Token</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 'connect' && (
            <div className="flex flex-col items-center gap-4">
              <div className="size-16 rounded-full bg-chain-ethereum/10 flex items-center justify-center">
                <svg className="size-8 text-chain-ethereum" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1.5l-8 13.5 8 4.5 8-4.5-8-13.5zm0 18l-8-4.5 8 7 8-7-8 4.5z"/>
                </svg>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 w-full text-center">
                <div className="text-sm text-muted-foreground">兑换比率</div>
                <div className="text-xl font-bold text-primary mt-1">
                  1 ETH = {ETH_TO_BIO_RATE.toLocaleString()} BIO
                </div>
              </div>
              <Button 
                className="w-full h-11" 
                onClick={handleConnect} 
                disabled={loading}
              >
                {loading ? '连接中...' : '选择 ETH 钱包'}
              </Button>
            </div>
          )}

          {step === 'input' && (
            <div className="flex flex-col gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">ETH 地址</div>
                <div className="font-mono text-xs break-all">{ethAccount?.address}</div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">支付 ETH</label>
                <input
                  type="number"
                  className="w-full p-4 text-2xl font-semibold bg-muted/50 border-2 border-transparent focus:border-primary rounded-lg outline-none transition-colors"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.001"
                />
              </div>

              <div className="flex justify-center">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">获得 BIO</label>
                <div className="w-full p-4 text-2xl font-semibold bg-primary/10 text-primary rounded-lg text-center">
                  {bioAmount}
                </div>
              </div>

              <Button 
                className="w-full h-11" 
                onClick={handleConfirm}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                下一步
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex flex-col gap-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">支付</span>
                  <span className="font-medium">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">获得</span>
                  <span className="font-medium text-primary">{bioAmount} BIO</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-muted-foreground">费率</span>
                  <span className="font-medium">1:{ETH_TO_BIO_RATE.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                className="w-full h-11" 
                onClick={handleForge} 
                disabled={loading}
              >
                {loading ? '处理中...' : '确认锻造'}
              </Button>
              <Button 
                variant="secondary"
                className="w-full h-11" 
                onClick={() => setStep('input')}
              >
                返回修改
              </Button>
            </div>
          )}

          {step === 'pending' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="size-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground">交易处理中...</p>
              {txHash && (
                <p className="font-mono text-xs text-muted-foreground break-all text-center">
                  {txHash}
                </p>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="size-16 rounded-full bg-success/10 flex items-center justify-center">
                <svg className="size-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-medium">锻造成功！</p>
              <p className="text-2xl font-bold text-success">+{bioAmount} BIO</p>
              <Button 
                variant="secondary"
                className="w-full h-11" 
                onClick={handleReset}
              >
                再次锻造
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
