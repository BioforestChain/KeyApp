import { useState, useCallback, useEffect } from 'react'
import type { BioAccount, BioUnsignedTransaction, BioSignedTransaction } from '@biochain/bio-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { BackgroundBeams } from './components/BackgroundBeams'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Coins, Leaf, DollarSign, Bitcoin, X, ChevronDown, ArrowUpDown, ChevronLeft, Zap, ArrowDown, Check, Loader2 } from 'lucide-react'

type Step = 'connect' | 'swap' | 'confirm' | 'processing' | 'success'

interface Token {
  symbol: string
  name: string
  chain: string
  balance?: string
}

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', chain: 'ethereum' },
  { symbol: 'BFM', name: 'BioForest', chain: 'bfmeta' },
  { symbol: 'USDT', name: 'Tether', chain: 'ethereum' },
  { symbol: 'BTC', name: 'Bitcoin', chain: 'bitcoin' },
]

const FORGE_RECEIVER: Record<string, string> = {
  ethereum: '0x000000000000000000000000000000000000dEaD',
  bfmeta: 'b0000000000000000000000000000000000000000',
  bitcoin: 'bc1q000000000000000000000000000000000000000',
}

const EXCHANGE_RATES: Record<string, number> = {
  'ETH-BFM': 2500,
  'BFM-ETH': 0.0004,
  'USDT-BFM': 1,
  'BFM-USDT': 1,
  'BTC-BFM': 45000,
  'BFM-BTC': 0.000022,
}

const TOKEN_COLORS: Record<string, string> = {
  ETH: 'bg-indigo-600',
  BFM: 'bg-emerald-600',
  USDT: 'bg-teal-600',
  BTC: 'bg-orange-600',
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
  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null)

  // 关闭启动屏
  useEffect(() => {
    window.bio?.request({ method: 'bio_closeSplashScreen' })
  }, [])

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
      const chainId = fromToken.chain
      const to = FORGE_RECEIVER[chainId] ?? FORGE_RECEIVER.ethereum
      const unsignedTx = await window.bio.request<BioUnsignedTransaction>({
        method: 'bio_createTransaction',
        params: [{ from: account.address, to, amount: fromAmount, chain: chainId, asset: fromToken.symbol }],
      })
      const signedTx = await window.bio.request<BioSignedTransaction>({
        method: 'bio_signTransaction',
        params: [{ from: account.address, chain: chainId, unsignedTx }],
      })
      void signedTx
      await new Promise(resolve => setTimeout(resolve, 2000))
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '交易失败')
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }, [account, fromToken, fromAmount])

  const handleReset = useCallback(() => {
    setStep('swap')
    setFromAmount('')
    setToAmount('')
    setError(null)
  }, [])

  const handleSelectToken = (token: Token) => {
    if (pickerOpen === 'from') {
      setFromToken({ ...token, balance: token.symbol === 'ETH' ? '2.5' : '1000' })
    } else {
      setToToken(token)
    }
    setPickerOpen(null)
  }

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <BackgroundBeams className="opacity-30" />
      
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
          <div className="flex items-center h-14 px-4">
            {step === 'confirm' && (
              <Button variant="ghost" size="icon-sm" onClick={() => setStep('swap')}>
                <ChevronLeft className="size-5" />
              </Button>
            )}
            <h1 className="flex-1 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              锻造
            </h1>
            <div className="w-7" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col p-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-4 border-destructive/50 bg-destructive/10">
                <CardContent className="py-3 text-destructive text-sm">
                  {error}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Connect */}
            {step === 'connect' && (
              <motion.div
                key="connect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center gap-8 pb-20"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                  <Avatar className="relative size-28 border-2 border-orange-500/30">
                    <AvatarFallback className="bg-gradient-to-b from-muted to-muted/50">
                      <Zap className="size-14 text-orange-500" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">多链熔炉</h2>
                  <p className="text-muted-foreground text-sm">将其他链资产锻造为 BFM 代币</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full max-w-xs h-12"
                  onClick={handleConnect} 
                  disabled={loading}
                >
                  {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                  {loading ? '连接中...' : '连接钱包'}
                </Button>
              </motion.div>
            )}

            {/* Swap */}
            {step === 'swap' && (
              <motion.div
                key="swap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-3"
              >
                {/* From Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardDescription>支付</CardDescription>
                      <CardDescription>余额: {fromToken.balance || '0.00'}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="shrink-0 gap-2 h-10 px-3"
                        onClick={() => setPickerOpen('from')}
                      >
                        <TokenAvatar symbol={fromToken.symbol} size="sm" />
                        <span className="font-semibold">{fromToken.symbol}</span>
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </Button>
                      <Input
                        type="number"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-right text-2xl font-bold h-10 border-0 focus-visible:ring-0"
                      />
                    </div>
                    {fromToken.balance && (
                      <div className="flex gap-2">
                        {['25%', '50%', '75%', 'MAX'].map((pct, i) => (
                          <Button
                            key={pct}
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              const balance = parseFloat(fromToken.balance!.replace(/,/g, ''))
                              setFromAmount((balance * [0.25, 0.5, 0.75, 1][i]).toString())
                            }}
                          >
                            {pct}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Swap Button */}
                <div className="flex justify-center -my-1.5 relative z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={handleSwapTokens}
                  >
                    <ArrowUpDown className="size-4" />
                  </Button>
                </div>

                {/* To Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardDescription>获得</CardDescription>
                      <CardDescription>≈ ${toAmount ? (parseFloat(toAmount) * (toToken.symbol === 'BFM' ? 1 : 2500)).toFixed(2) : '--'}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="shrink-0 gap-2 h-10 px-3"
                        onClick={() => setPickerOpen('to')}
                      >
                        <TokenAvatar symbol={toToken.symbol} size="sm" />
                        <span className="font-semibold">{toToken.symbol}</span>
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </Button>
                      <div className="flex-1 text-right text-2xl font-bold text-muted-foreground">
                        {toAmount || '0.00'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Info */}
                {fromAmount && parseFloat(fromAmount) > 0 && (
                  <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardContent className="py-3 flex justify-between text-sm">
                      <span className="text-muted-foreground">汇率</span>
                      <span>1 {fromToken.symbol} ≈ {EXCHANGE_RATES[`${fromToken.symbol}-${toToken.symbol}`] || 1} {toToken.symbol}</span>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-auto pt-4">
                  <Button 
                    className="w-full h-12" 
                    onClick={handlePreview}
                    disabled={!fromAmount || parseFloat(fromAmount) <= 0}
                  >
                    预览交易
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-4"
              >
                <Card>
                  <CardContent className="py-6 text-center space-y-4">
                    <div>
                      <CardDescription className="mb-1">支付</CardDescription>
                      <div className="text-3xl font-bold flex items-center justify-center gap-2">
                        <TokenAvatar symbol={fromToken.symbol} size="sm" />
                        {fromAmount} <span className="text-lg text-muted-foreground">{fromToken.symbol}</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Avatar className="size-10 border border-orange-500/30 bg-orange-500/10">
                        <AvatarFallback className="bg-transparent">
                          <ArrowDown className="size-5 text-orange-500" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <CardDescription className="mb-1">获得</CardDescription>
                      <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-2">
                        <TokenAvatar symbol={toToken.symbol} size="sm" />
                        {toAmount} <span className="text-lg text-orange-500/60">{toToken.symbol}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="py-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">汇率</span>
                      <span>1 {fromToken.symbol} = {EXCHANGE_RATES[`${fromToken.symbol}-${toToken.symbol}`]} {toToken.symbol}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">网络</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{fromToken.chain}</Badge>
                        <span>→</span>
                        <Badge variant="outline">{toToken.chain}</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">预计时间</span>
                      <span>~30s</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-auto pt-4">
                  <Button 
                    className="w-full h-12" 
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    确认锻造
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 pb-20"
              >
                <div className="relative size-24">
                  <div className="absolute inset-0 border-4 border-muted rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">锻造中...</h2>
                  <p className="text-muted-foreground text-sm">请稍候，正在处理交易</p>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 pb-20"
              >
                <Avatar className="size-20 border border-emerald-500/30 bg-emerald-500/10">
                  <AvatarFallback className="bg-transparent">
                    <Check className="size-10 text-emerald-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">锻造完成</h2>
                  <p className="text-2xl font-bold text-emerald-400">{toAmount} {toToken.symbol}</p>
                </div>
                <Button variant="outline" className="w-full max-w-xs" onClick={handleReset}>
                  继续锻造
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Token Picker Modal */}
          {pickerOpen !== null && (
            <div className="fixed inset-0 z-50">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setPickerOpen(null)} 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border animate-in slide-in-from-bottom">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <CardTitle>选择代币</CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => setPickerOpen(null)}>
                    <X className="size-5" />
                  </Button>
                </div>
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                  {TOKENS.filter(t => t.symbol !== (pickerOpen === 'from' ? toToken : fromToken).symbol).map((token) => (
                    <Card 
                      key={token.symbol} 
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-accent",
                        (pickerOpen === 'from' ? fromToken : toToken).symbol === token.symbol && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSelectToken(token)}
                    >
                      <CardContent className="py-3 flex items-center gap-3">
                        <TokenAvatar symbol={token.symbol} size="md" />
                        <div className="flex-1">
                          <CardTitle className="text-base">{token.symbol}</CardTitle>
                          <CardDescription>{token.name}</CardDescription>
                        </div>
                        {(pickerOpen === 'from' ? fromToken : toToken).symbol === token.symbol && (
                          <Badge>已选</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function TokenAvatar({ symbol, size = 'sm' }: { symbol: string; size?: 'sm' | 'md' }) {
  const icons: Record<string, React.ReactNode> = {
    ETH: <Coins className={size === 'md' ? 'size-5' : 'size-4'} />,
    BFM: <Leaf className={size === 'md' ? 'size-5' : 'size-4'} />,
    USDT: <DollarSign className={size === 'md' ? 'size-5' : 'size-4'} />,
    BTC: <Bitcoin className={size === 'md' ? 'size-5' : 'size-4'} />,
  }
  return (
    <Avatar className={cn(size === 'md' ? 'size-10' : 'size-6', TOKEN_COLORS[symbol] || 'bg-muted')}>
      <AvatarFallback className="bg-transparent text-white">
        {icons[symbol] || <Coins className={size === 'md' ? 'size-5' : 'size-4'} />}
      </AvatarFallback>
    </Avatar>
  )
}
