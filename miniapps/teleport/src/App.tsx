import { useState, useCallback } from 'react'
import type { BioAccount } from '@biochain/bio-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Step = 'connect' | 'select-asset' | 'input-amount' | 'select-target' | 'confirm' | 'success'

// 模拟资产数据
interface Asset {
  id: string
  symbol: string
  name: string
  balance: string
  icon?: string
  chain: string
}

const MOCK_ASSETS: Asset[] = [
  { id: 'bfm', symbol: 'BFM', name: 'BioForest', balance: '1,234.56', chain: 'bioforest' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: '2.5', chain: 'ethereum' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: '500.00', chain: 'ethereum' },
]

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [sourceAccount, setSourceAccount] = useState<BioAccount | null>(null)
  const [targetAccount, setTargetAccount] = useState<BioAccount | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [amount, setAmount] = useState('')
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
      const account = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{}],
      })
      setSourceAccount(account)
      setStep('select-asset')
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    setStep('input-amount')
  }

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效金额')
      return
    }
    setError(null)
    setStep('select-target')
  }

  const handleSelectTarget = useCallback(async () => {
    if (!window.bio || !sourceAccount) return

    setLoading(true)
    setError(null)

    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_pickWallet',
        params: [{ chain: selectedAsset?.chain, exclude: sourceAccount.address }],
      })
      setTargetAccount(account)
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : '选择失败')
    } finally {
      setLoading(false)
    }
  }, [sourceAccount, selectedAsset])

  const handleConfirm = useCallback(async () => {
    if (!window.bio || !sourceAccount || !selectedAsset) return

    setLoading(true)
    setError(null)

    try {
      // 执行转账
      await window.bio.request<{ txHash: string }>({
        method: 'bio_sendTransaction',
        params: [{
          from: sourceAccount.address,
          to: targetAccount?.address,
          amount: amount,
          chain: selectedAsset.chain,
          asset: selectedAsset.symbol,
        }],
      })

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '转账失败')
    } finally {
      setLoading(false)
    }
  }, [sourceAccount, targetAccount, selectedAsset, amount])

  const handleReset = useCallback(() => {
    setStep('connect')
    setSourceAccount(null)
    setTargetAccount(null)
    setSelectedAsset(null)
    setAmount('')
    setError(null)
  }, [])

  const handleBack = () => {
    switch (step) {
      case 'select-asset':
        setStep('connect')
        break
      case 'input-amount':
        setStep('select-asset')
        break
      case 'select-target':
        setStep('input-amount')
        break
      case 'confirm':
        setStep('select-target')
        break
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center h-14 px-4">
          {step !== 'connect' && step !== 'success' && (
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="flex-1 text-center font-semibold">一键传送</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {error && (
          <div className="mb-4 bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step: Connect */}
        {step === 'connect' && (
          <div className="flex flex-col items-center pt-12">
            <div className="size-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <svg className="size-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">跨钱包传送</h2>
            <p className="text-muted-foreground text-center text-sm mb-8 max-w-xs">
              安全地将资产从一个钱包转移到另一个钱包
            </p>
            <Button 
              className="w-full max-w-xs h-12 text-base" 
              onClick={handleConnect} 
              disabled={loading}
            >
              {loading ? '连接中...' : '选择源钱包'}
            </Button>
          </div>
        )}

        {/* Step: Select Asset */}
        {step === 'select-asset' && (
          <div>
            <div className="mb-4">
              <AddressCard label="源钱包" address={sourceAccount?.address} name={sourceAccount?.name} />
            </div>
            
            <h2 className="font-semibold mb-3">选择要传送的资产</h2>
            <div className="space-y-2">
              {MOCK_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors text-left"
                >
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{asset.balance}</div>
                    <div className="text-xs text-muted-foreground">可用</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Input Amount */}
        {step === 'input-amount' && selectedAsset && (
          <div>
            <div className="mb-6">
              <AddressCard label="源钱包" address={sourceAccount?.address} name={sourceAccount?.name} />
            </div>

            <div className="text-center mb-6">
              <div className="size-16 rounded-full bg-muted mx-auto flex items-center justify-center font-bold text-lg mb-3">
                {selectedAsset.symbol.slice(0, 2)}
              </div>
              <div className="font-semibold">{selectedAsset.symbol}</div>
              <div className="text-sm text-muted-foreground">可用: {selectedAsset.balance}</div>
            </div>

            <div className="mb-6">
              <label className="text-sm text-muted-foreground block mb-2">传送数量</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 pr-20 text-2xl font-semibold bg-muted/50 rounded-xl border-2 border-transparent focus:border-primary outline-none transition-colors"
                />
                <button
                  onClick={() => setAmount(selectedAsset.balance.replace(/,/g, ''))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full"
                >
                  全部
                </button>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-base" 
              onClick={handleAmountNext}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              下一步
            </Button>
          </div>
        )}

        {/* Step: Select Target */}
        {step === 'select-target' && (
          <div className="flex flex-col items-center pt-8">
            <div className="w-full mb-6">
              <TransferSummaryCard
                from={sourceAccount?.address}
                fromName={sourceAccount?.name}
                amount={amount}
                symbol={selectedAsset?.symbol}
              />
            </div>

            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            <p className="text-muted-foreground text-center text-sm mb-6">
              选择接收资产的目标钱包
            </p>

            <Button 
              className="w-full h-12 text-base" 
              onClick={handleSelectTarget}
              disabled={loading}
            >
              {loading ? '选择中...' : '选择目标钱包'}
            </Button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div>
            <div className="bg-card rounded-2xl border p-4 mb-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold">{amount}</div>
                <div className="text-muted-foreground">{selectedAsset?.symbol}</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">从</span>
                  <span className="font-mono text-xs">{truncateAddress(sourceAccount?.address)}</span>
                </div>
                <div className="flex justify-center">
                  <svg className="size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">到</span>
                  <span className="font-mono text-xs">{truncateAddress(targetAccount?.address)}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">网络</span>
                <span>{selectedAsset?.chain}</span>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-base" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? '处理中...' : '确认传送'}
            </Button>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center pt-12">
            <div className="size-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
              <svg className="size-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">传送成功！</h2>
            <p className="text-muted-foreground text-center text-sm mb-2">
              {amount} {selectedAsset?.symbol} 已发送
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              交易确认可能需要几分钟
            </p>
            <Button 
              variant="secondary"
              className="w-full max-w-xs h-12 text-base" 
              onClick={handleReset}
            >
              完成
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function AddressCard({ label, address, name }: { label: string; address?: string; name?: string }) {
  return (
    <div className="bg-card rounded-xl border p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {name && <div className="font-medium text-sm">{name}</div>}
      <div className="font-mono text-xs text-muted-foreground break-all">{address}</div>
    </div>
  )
}

function TransferSummaryCard({ 
  from, 
  fromName, 
  amount, 
  symbol 
}: { 
  from?: string
  fromName?: string
  amount: string
  symbol?: string
}) {
  return (
    <div className="bg-card rounded-xl border p-4 text-center">
      <div className="text-xs text-muted-foreground mb-1">传送</div>
      <div className="text-2xl font-bold">{amount} {symbol}</div>
      <div className="text-xs text-muted-foreground mt-2">
        从 {fromName || truncateAddress(from)}
      </div>
    </div>
  )
}

function truncateAddress(address?: string): string {
  if (!address) return ''
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
