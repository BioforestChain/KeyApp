import { useState, useCallback, useEffect } from 'react'
import type { BioAccount } from '@aspect-aspect/bio-sdk'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Step = 'connect' | 'swap' | 'confirm' | 'processing' | 'success'

// 支持的代币
interface Token {
  symbol: string
  name: string
  icon?: string
  chain: string
  balance?: string
}

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', chain: 'ethereum' },
  { symbol: 'BFM', name: 'BioForest', chain: 'bioforest' },
  { symbol: 'USDT', name: 'Tether', chain: 'ethereum' },
  { symbol: 'BTC', name: 'Bitcoin', chain: 'bitcoin' },
]

// 模拟汇率
const EXCHANGE_RATES: Record<string, number> = {
  'ETH-BFM': 2500,
  'BFM-ETH': 0.0004,
  'USDT-BFM': 1,
  'BFM-USDT': 1,
  'BTC-BFM': 45000,
  'BFM-BTC': 0.000022,
}

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [account, setAccount] = useState<BioAccount | null>(null)
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0])
  const [toToken, setToToken] = useState<Token>(TOKENS[1])
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)

  // 计算兑换金额
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const rate = EXCHANGE_RATES[`${fromToken.symbol}-${toToken.symbol}`] || 1
      const result = parseFloat(fromAmount) * rate
      setToAmount(result.toFixed(fromToken.symbol === 'BFM' ? 8 : 2))
    } else {
      setToAmount('')
    }
  }, [fromAmount, fromToken, toToken])

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK 未初始化')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const acc = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{}],
      })
      setAccount(acc)
      // 模拟余额
      setFromToken({ ...fromToken, balance: '2.5' })
      setStep('swap')
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(false)
    }
  }, [fromToken])

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken({ ...toToken, balance: toToken.balance })
    setToToken({ ...temp, balance: temp.balance })
    setFromAmount(toAmount)
  }

  const handlePreview = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('请输入有效金额')
      return
    }
    setError(null)
    setStep('confirm')
  }

  const handleConfirm = useCallback(async () => {
    if (!window.bio || !account) return

    setLoading(true)
    setError(null)
    setStep('processing')

    try {
      // 模拟交易签名
      await window.bio.request({
        method: 'bio_signTransaction',
        params: [{
          from: account.address,
          type: 'swap',
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromAmount,
          toAmount,
        }],
      })

      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '交易失败')
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }, [account, fromToken, toToken, fromAmount, toAmount])

  const handleReset = useCallback(() => {
    setStep('swap')
    setFromAmount('')
    setToAmount('')
    setError(null)
  }, [])

  const handleBack = () => {
    if (step === 'confirm') setStep('swap')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center h-14 px-4">
          {step === 'confirm' && (
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="flex-1 text-center font-semibold">兑换中心</h1>
          <div className="w-9" />
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
            <div className="size-24 rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6">
              <svg className="size-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">多链兑换</h2>
            <p className="text-muted-foreground text-center text-sm mb-8 max-w-xs">
              安全、快速地在不同代币之间进行兑换
            </p>
            <Button 
              className="w-full max-w-xs h-12 text-base" 
              onClick={handleConnect} 
              disabled={loading}
            >
              {loading ? '连接中...' : '连接钱包'}
            </Button>
          </div>
        )}

        {/* Step: Swap */}
        {step === 'swap' && (
          <div>
            {/* From Token */}
            <div className="bg-card rounded-2xl border p-4 mb-2">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>支付</span>
                <span>余额: {fromToken.balance || '0.00'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFromPicker(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors shrink-0"
                >
                  <TokenIcon symbol={fromToken.symbol} />
                  <span className="font-semibold">{fromToken.symbol}</span>
                  <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-right text-2xl font-semibold bg-transparent outline-none"
                />
              </div>
              {fromToken.balance && (
                <div className="flex gap-2 mt-3">
                  {['25%', '50%', '75%', '最大'].map((pct, i) => (
                    <button
                      key={pct}
                      onClick={() => {
                        const balance = parseFloat(fromToken.balance!.replace(/,/g, ''))
                        const values = [0.25, 0.5, 0.75, 1]
                        setFromAmount((balance * values[i]).toString())
                      }}
                      className="flex-1 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      {pct}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                onClick={handleSwapTokens}
                className="size-10 rounded-full bg-background border-2 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <svg className="size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            {/* To Token */}
            <div className="bg-card rounded-2xl border p-4 mb-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>获得</span>
                <span>≈ {toAmount ? `$${(parseFloat(toAmount) * (toToken.symbol === 'BFM' ? 1 : 2500)).toFixed(2)}` : '--'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowToPicker(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors shrink-0"
                >
                  <TokenIcon symbol={toToken.symbol} />
                  <span className="font-semibold">{toToken.symbol}</span>
                  <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="flex-1 text-right text-2xl font-semibold text-muted-foreground">
                  {toAmount || '0.00'}
                </div>
              </div>
            </div>

            {/* Rate Info */}
            {fromAmount && parseFloat(fromAmount) > 0 && (
              <div className="bg-muted/50 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">汇率</span>
                  <span>1 {fromToken.symbol} ≈ {EXCHANGE_RATES[`${fromToken.symbol}-${toToken.symbol}`] || 1} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">手续费</span>
                  <span className="text-green-500">免费</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full h-12 text-base" 
              onClick={handlePreview}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
            >
              预览兑换
            </Button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div>
            <div className="bg-card rounded-2xl border p-5 mb-4">
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">您将支付</div>
                <div className="text-3xl font-bold">{fromAmount} {fromToken.symbol}</div>
              </div>

              <div className="flex justify-center my-4">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <svg className="size-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">您将获得</div>
                <div className="text-3xl font-bold text-primary">{toAmount} {toToken.symbol}</div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">汇率</span>
                <span>1 {fromToken.symbol} = {EXCHANGE_RATES[`${fromToken.symbol}-${toToken.symbol}`]} {toToken.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">网络</span>
                <span>{fromToken.chain} → {toToken.chain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">预计时间</span>
                <span>~30 秒</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">手续费</span>
                <span className="text-green-500">免费</span>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-base" 
              onClick={handleConfirm}
              disabled={loading}
            >
              确认兑换
            </Button>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center pt-16">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
              <svg className="size-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">处理中...</h2>
            <p className="text-muted-foreground text-center text-sm">
              正在处理您的兑换请求
            </p>
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
            <h2 className="text-xl font-bold mb-2">兑换成功！</h2>
            <p className="text-muted-foreground text-center text-sm mb-1">
              您已成功兑换
            </p>
            <p className="text-lg font-semibold text-primary mb-8">
              {toAmount} {toToken.symbol}
            </p>
            <Button 
              variant="secondary"
              className="w-full max-w-xs h-12 text-base" 
              onClick={handleReset}
            >
              继续兑换
            </Button>
          </div>
        )}

        {/* Token Picker Modals */}
        {showFromPicker && (
          <TokenPicker
            tokens={TOKENS.filter(t => t.symbol !== toToken.symbol)}
            selected={fromToken}
            onSelect={(t) => {
              setFromToken({ ...t, balance: t.symbol === 'ETH' ? '2.5' : '1000' })
              setShowFromPicker(false)
            }}
            onClose={() => setShowFromPicker(false)}
          />
        )}
        {showToPicker && (
          <TokenPicker
            tokens={TOKENS.filter(t => t.symbol !== fromToken.symbol)}
            selected={toToken}
            onSelect={(t) => {
              setToToken(t)
              setShowToPicker(false)
            }}
            onClose={() => setShowToPicker(false)}
          />
        )}
      </main>
    </div>
  )
}

function TokenIcon({ symbol }: { symbol: string }) {
  const colors: Record<string, string> = {
    ETH: 'bg-blue-500',
    BFM: 'bg-green-500',
    USDT: 'bg-emerald-500',
    BTC: 'bg-orange-500',
  }
  return (
    <div className={cn('size-6 rounded-full flex items-center justify-center text-white text-xs font-bold', colors[symbol] || 'bg-gray-500')}>
      {symbol.slice(0, 1)}
    </div>
  )
}

function TokenPicker({
  tokens,
  selected,
  onSelect,
  onClose,
}: {
  tokens: Token[]
  selected: Token
  onSelect: (token: Token) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-t-2xl p-4 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">选择代币</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-1">
          {tokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => onSelect(token)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                selected.symbol === token.symbol ? 'bg-primary/10' : 'hover:bg-muted'
              )}
            >
              <TokenIcon symbol={token.symbol} />
              <div className="flex-1 text-left">
                <div className="font-medium">{token.symbol}</div>
                <div className="text-xs text-muted-foreground">{token.name}</div>
              </div>
              {selected.symbol === token.symbol && (
                <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
