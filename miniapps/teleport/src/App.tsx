import { useState, useCallback } from 'react'
import type { BioAccount } from '@biochain/bio-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AuroraBackground } from './components/AuroraBackground'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronLeft, Zap, ArrowDown, Check, Coins, Leaf, DollarSign, Wallet, Loader2 } from 'lucide-react'

type Step = 'connect' | 'select-asset' | 'input-amount' | 'select-target' | 'confirm' | 'success'

interface Asset {
  id: string
  symbol: string
  name: string
  balance: string
  chain: string
}

const MOCK_ASSETS: Asset[] = [
  { id: 'bfm', symbol: 'BFM', name: 'BioForest', balance: '1,234.56', chain: 'bioforest' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: '2.5', chain: 'ethereum' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: '500.00', chain: 'ethereum' },
]

const ASSET_COLORS: Record<string, string> = {
  BFM: 'bg-emerald-600',
  ETH: 'bg-indigo-600',
  USDT: 'bg-teal-600',
}

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
    const backMap: Record<Step, Step> = {
      'select-asset': 'connect',
      'input-amount': 'select-asset',
      'select-target': 'input-amount',
      'confirm': 'select-target',
      'connect': 'connect',
      'success': 'success',
    }
    setStep(backMap[step])
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
          <div className="flex items-center h-14 px-4">
            {!['connect', 'success'].includes(step) ? (
              <Button variant="ghost" size="icon-sm" onClick={handleBack}>
                <ChevronLeft className="size-5" />
              </Button>
            ) : <div className="w-7" />}
            <h1 className="flex-1 text-center font-bold">一键传送</h1>
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
                  <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
                  <Avatar className="relative size-24 rounded-2xl border border-white/20">
                    <AvatarFallback className="rounded-2xl bg-white/10 backdrop-blur">
                      <Zap className="size-12 text-white" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">跨钱包传送</h2>
                  <p className="text-muted-foreground text-sm">安全地将资产转移到另一个钱包</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full max-w-xs h-12"
                  onClick={handleConnect} 
                  disabled={loading}
                >
                  {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                  {loading ? '连接中...' : '启动传送门'}
                </Button>
              </motion.div>
            )}

            {/* Select Asset */}
            {step === 'select-asset' && (
              <motion.div
                key="select-asset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-4"
              >
                <WalletCard label="源钱包" address={sourceAccount?.address} name={sourceAccount?.name} />
                
                <div className="space-y-3">
                  <CardDescription className="px-1">选择资产</CardDescription>
                  {MOCK_ASSETS.map((asset, i) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card 
                        data-slot="card"
                        className="cursor-pointer transition-colors hover:bg-accent"
                        onClick={() => handleSelectAsset(asset)}
                      >
                        <CardContent className="py-3 flex items-center gap-3">
                          <AssetAvatar symbol={asset.symbol} />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{asset.symbol}</CardTitle>
                            <CardDescription>{asset.name}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{asset.balance}</div>
                            <CardDescription>可用</CardDescription>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input Amount */}
            {step === 'input-amount' && selectedAsset && (
              <motion.div
                key="input-amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-4"
              >
                <WalletCard label="源钱包" address={sourceAccount?.address} name={sourceAccount?.name} />

                <Card className="flex-1">
                  <CardContent className="h-full flex flex-col items-center justify-center gap-4 py-8">
                    <AssetAvatar symbol={selectedAsset.symbol} size="lg" />
                    <div className="text-center">
                      <CardTitle>{selectedAsset.symbol}</CardTitle>
                      <CardDescription>可用: {selectedAsset.balance}</CardDescription>
                    </div>
                    <div className="w-full max-w-xs relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-center text-3xl font-bold h-14 border-0 border-b-2 border-primary/50 rounded-none focus-visible:ring-0 focus-visible:border-primary"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-7 text-xs"
                        onClick={() => setAmount(selectedAsset.balance.replace(/,/g, ''))}
                      >
                        MAX
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full h-12" onClick={handleAmountNext} disabled={!amount || parseFloat(amount) <= 0}>
                  下一步
                </Button>
              </motion.div>
            )}

            {/* Select Target */}
            {step === 'select-target' && (
              <motion.div
                key="select-target"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col items-center justify-center gap-8 pb-20"
              >
                <Card className="w-full">
                  <CardContent className="py-4 text-center">
                    <CardDescription className="mb-1">即将传送</CardDescription>
                    <div className="text-2xl font-bold flex items-center justify-center gap-2">
                      <AssetAvatar symbol={selectedAsset!.symbol} size="sm" />
                      {amount} <span className="text-muted-foreground">{selectedAsset?.symbol}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                  <Avatar className="relative size-16 bg-primary">
                    <AvatarFallback className="bg-transparent">
                      <ArrowDown className="size-8 text-white" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">请选择接收资产的</p>
                  <p className="font-semibold">目标钱包</p>
                </div>

                <Button 
                  size="lg" 
                  className="w-full max-w-xs h-12" 
                  onClick={handleSelectTarget} 
                  disabled={loading}
                >
                  {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                  {loading ? '扫描中...' : '选择目标钱包'}
                </Button>
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
                      <CardDescription className="mb-1">发送</CardDescription>
                      <div className="text-3xl font-bold flex items-center justify-center gap-2">
                        <AssetAvatar symbol={selectedAsset!.symbol} size="sm" />
                        {amount} <span className="text-lg text-muted-foreground">{selectedAsset?.symbol}</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Avatar className="size-10 border border-primary/30 bg-primary/10">
                        <AvatarFallback className="bg-transparent">
                          <ArrowDown className="size-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-2">
                      <WalletCard label="发送方" address={sourceAccount?.address} name={sourceAccount?.name} compact />
                      <WalletCard label="接收方" address={targetAccount?.address} name={targetAccount?.name} compact highlight />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="py-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">网络</span>
                      <Badge variant="outline">{selectedAsset?.chain}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">手续费</span>
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">免费</Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-auto pt-4">
                  <Button className="w-full h-12" onClick={handleConfirm} disabled={loading}>
                    {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                    {loading ? '处理中...' : '确认传送'}
                  </Button>
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
                  <h2 className="text-xl font-bold">传送成功</h2>
                  <p className="text-2xl font-bold text-emerald-400">{amount} {selectedAsset?.symbol}</p>
                  <p className="text-sm text-muted-foreground">已发送至目标钱包</p>
                </div>
                <Button variant="outline" className="w-full max-w-xs" onClick={handleReset}>
                  发起新传送
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </AuroraBackground>
  )
}

function WalletCard({ label, address, name, compact, highlight }: { 
  label: string
  address?: string
  name?: string
  compact?: boolean
  highlight?: boolean
}) {
  if (compact) {
    return (
      <Card className={cn("border-0", highlight ? "bg-primary/10" : "bg-muted/50")}>
        <CardContent className="py-2 flex items-center gap-3">
          <Avatar className={cn("size-8", highlight ? "bg-primary/20" : "bg-muted")}>
            <AvatarFallback className="bg-transparent">
              <Wallet className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <CardDescription className="text-xs">{label}</CardDescription>
            <div className="text-sm font-medium truncate">{name || truncateAddress(address)}</div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardContent className="py-3 flex items-center gap-3">
        <Avatar className="size-10 bg-primary/20">
          <AvatarFallback className="bg-transparent">
            <Wallet className="size-5 text-primary" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-base truncate">{name || 'Unknown'}</CardTitle>
          <CardDescription className="truncate">{address}</CardDescription>
        </div>
      </CardContent>
    </Card>
  )
}

function AssetAvatar({ symbol, size = 'md' }: { symbol: string; size?: 'sm' | 'md' | 'lg' }) {
  const icons: Record<string, React.ReactNode> = {
    BFM: <Leaf />,
    ETH: <Coins />,
    USDT: <DollarSign />,
  }
  const sizeClass = size === 'lg' ? 'size-16 [&_svg]:size-8' : size === 'md' ? 'size-10 [&_svg]:size-5' : 'size-6 [&_svg]:size-3'
  
  return (
    <Avatar className={cn(sizeClass, ASSET_COLORS[symbol] || 'bg-muted')}>
      <AvatarFallback className="bg-transparent text-white">
        {icons[symbol] || <Coins />}
      </AvatarFallback>
    </Avatar>
  )
}

function truncateAddress(address?: string): string {
  if (!address) return ''
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
