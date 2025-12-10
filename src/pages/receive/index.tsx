import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { AddressDisplay } from '@/components/wallet/address-display'
import { AddressQRCode } from '@/components/common/qr-code'
import { Alert } from '@/components/common/alert'
import { ChainIcon } from '@/components/wallet/chain-icon'
import { GradientButton } from '@/components/common/gradient-button'
import { useClipboard, useToast, useHaptics } from '@/services'
import { Copy, Share2, Check } from 'lucide-react'
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

export function ReceivePage() {
  const navigate = useNavigate()
  const clipboard = useClipboard()
  const toast = useToast()
  const haptics = useHaptics()
  
  const chainAddress = useCurrentChainAddress()
  const selectedChain = useSelectedChain()
  const [copied, setCopied] = useState(false)

  const address = chainAddress?.address || ''

  const handleCopy = async () => {
    if (address) {
      await clipboard.write(address)
      await haptics.impact('light')
      setCopied(true)
      toast.show('地址已复制')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share && address) {
      try {
        await navigator.share({
          title: 'BFM Pay 收款地址',
          text: address,
        })
        await haptics.impact('success')
      } catch {
        // 用户取消分享
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader 
        title="收款" 
        onBack={() => navigate({ to: '/' })}
      />

      <div className="flex-1 space-y-6 p-4">
        {/* 链信息 */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <ChainIcon chain={selectedChain} size="sm" />
          <span className="text-sm">{CHAIN_NAMES[selectedChain]}</span>
        </div>

        {/* 二维码区域 */}
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-sm">
          <AddressQRCode 
            address={address} 
            chain={selectedChain}
            size={200}
          />
          <p className="text-center text-sm text-muted-foreground">
            扫描二维码向此地址转账
          </p>
        </div>

        {/* 地址显示 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            收款地址
          </label>
          <div className="rounded-xl border border-border bg-card p-4">
            <AddressDisplay address={address} copyable />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <GradientButton
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="mr-2 size-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" />
                复制地址
              </>
            )}
          </GradientButton>
          <GradientButton
            variant="mint"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="mr-2 size-4" />
            分享
          </GradientButton>
        </div>

        {/* 提示 */}
        <Alert variant="info">
          仅支持 {CHAIN_NAMES[selectedChain]} 网络资产转入，其他网络资产转入将无法找回
        </Alert>
      </div>
    </div>
  )
}
