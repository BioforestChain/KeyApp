import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { AddressInput } from '@/components/transfer/address-input'
import { AmountInput } from '@/components/transfer/amount-input'
import { GradientButton } from '@/components/common/gradient-button'
import { Alert } from '@/components/common/alert'
import { ChainIcon } from '@/components/wallet/chain-icon'
import { useCamera, useToast, useHaptics } from '@/services'
import { ArrowRight } from 'lucide-react'
import {
  useCurrentChainAddress,
  useSelectedChain,
  type ChainType,
} from '@/stores'

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bfmeta: 'BFMeta',
}

export function SendPage() {
  const navigate = useNavigate()
  const camera = useCamera()
  const toast = useToast()
  const haptics = useHaptics()
  
  const chainAddress = useCurrentChainAddress()
  const selectedChain = useSelectedChain()
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isSending, setIsSending] = useState(false)

  // TODO: 从实际余额获取
  const balance = '1,234.56'
  const symbol = 'USDT'

  const isValid = toAddress.length > 10 && parseFloat(amount) > 0
  const hasInsufficientBalance = parseFloat(amount) > parseFloat(balance.replace(',', ''))

  const handleScan = async () => {
    try {
      const hasPermission = await camera.checkPermission()
      if (!hasPermission) {
        const granted = await camera.requestPermission()
        if (!granted) {
          toast.show({ message: '需要相机权限才能扫描', position: 'center' })
          return
        }
      }
      
      const result = await camera.scanQRCode()
      if (result.content) {
        setToAddress(result.content)
        await haptics.impact('success')
        toast.show('扫描成功')
      }
    } catch (error) {
      toast.show({ message: '扫描失败，请手动输入', position: 'center' })
    }
  }

  const handleSend = async () => {
    if (isSending || !isValid) return
    setIsSending(true)

    try {
      // TODO: 实现真实发送逻辑
      console.log('Send:', { 
        from: chainAddress?.address,
        to: toAddress, 
        amount,
        chain: selectedChain,
      })
      
      await haptics.impact('success')
      toast.show('交易已提交')
      
      // 模拟发送延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      navigate({ to: '/' })
    } catch (error) {
      console.error('发送失败:', error)
      await haptics.impact('error')
      toast.show({ message: '发送失败，请重试', position: 'center' })
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader 
        title="发送" 
        onBack={() => navigate({ to: '/' })}
      />

      <div className="flex-1 space-y-6 p-4">
        {/* 当前链信息 */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/50 py-2">
          <ChainIcon chain={selectedChain} size="sm" />
          <span className="text-sm font-medium">{CHAIN_NAMES[selectedChain]}</span>
        </div>

        {/* 地址输入 */}
        <AddressInput
          label="收款地址"
          value={toAddress}
          onChange={setToAddress}
          placeholder={`输入 ${CHAIN_NAMES[selectedChain]} 地址`}
          onScan={handleScan}
        />

        {/* 金额输入 */}
        <AmountInput
          label="金额"
          value={amount}
          onChange={setAmount}
          balance={balance}
          symbol={symbol}
          fiatValue={amount ? `$${parseFloat(amount).toFixed(2)}` : undefined}
        />

        {/* 余额不足警告 */}
        {hasInsufficientBalance && (
          <Alert variant="error">
            余额不足，当前可用余额为 {balance} {symbol}
          </Alert>
        )}

        {/* 网络提示 */}
        <Alert variant="info">
          请确保收款地址为 {CHAIN_NAMES[selectedChain]} 网络地址，发送到错误网络将无法找回
        </Alert>

        {/* 发送按钮 */}
        <div className="pt-4">
          <GradientButton
            variant="mint"
            className="w-full"
            disabled={!isValid || hasInsufficientBalance || isSending}
            onClick={handleSend}
          >
            {isSending ? '发送中...' : '确认发送'}
            {!isSending && <ArrowRight className="ml-2 size-4" />}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
