import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { AddressInput } from '@/components/transfer/address-input'
import { AmountInput } from '@/components/transfer/amount-input'
import { GradientButton } from '@/components/common/gradient-button'
import { Alert } from '@/components/common/alert'
import { ChainIcon } from '@/components/wallet/chain-icon'
import { TransferConfirmSheet } from '@/components/transfer/transfer-confirm-sheet'
import { SendResult } from '@/components/transfer/send-result'
import { useCamera, useToast, useHaptics } from '@/services'
import { useSend } from '@/hooks/use-send'
import { useAssets } from '@/hooks/use-assets'
import { formatAssetAmount } from '@/types/asset'
import { ArrowRight } from 'lucide-react'
import {
  useSelectedChain,
  type ChainType,
} from '@/stores'

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
}

export function SendPage() {
  const navigate = useNavigate()
  const camera = useCamera()
  const toast = useToast()
  const haptics = useHaptics()

  // Read search params for pre-fill from scanner
  const { address: initialAddress, amount: initialAmount } = useSearch({ strict: false })

  const selectedChain = useSelectedChain()
  const selectedChainName = CHAIN_NAMES[selectedChain] ?? selectedChain
  const { allAssets } = useAssets()

  // Get first asset as default (in real app, would be from route params or selection)
  const defaultAsset = allAssets[0]

  const {
    state,
    setToAddress,
    setAmount,
    goToConfirm,
    goBack,
    submit,
    reset,
    canProceed,
  } = useSend({ initialAsset: defaultAsset })

  // Pre-fill from search params (scanner integration)
  useEffect(() => {
    if (initialAddress && !state.toAddress) {
      setToAddress(initialAddress)
    }
    if (initialAmount && !state.amount) {
      setAmount(initialAmount)
    }
  }, [initialAddress, initialAmount, state.toAddress, state.amount, setToAddress, setAmount])

  // Derive formatted values
  const balance = state.asset
    ? formatAssetAmount(state.asset.amount, state.asset.decimals)
    : '0'
  const symbol = state.asset?.assetType ?? 'TOKEN'

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
    } catch {
      toast.show({ message: '扫描失败，请手动输入', position: 'center' })
    }
  }

  const handleProceed = () => {
    if (goToConfirm()) {
      haptics.impact('light')
    }
  }

  const handleConfirm = async () => {
    await haptics.impact('medium')
    await submit()
  }

  const handleDone = () => {
    if (state.resultStatus === 'success') {
      haptics.impact('success')
    }
    navigate({ to: '/' })
  }

  const handleRetry = () => {
    reset()
  }

  const handleViewExplorer = () => {
    // TODO: Open block explorer with txHash
    if (state.txHash) {
      toast.show('区块浏览器功能待实现')
    }
  }

  // Result step
  if (state.step === 'result' || state.step === 'sending') {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title="发送结果" />
        <SendResult
          status={state.step === 'sending' ? 'pending' : (state.resultStatus ?? 'pending')}
          amount={state.amount}
          symbol={symbol}
          toAddress={state.toAddress}
          txHash={state.txHash ?? undefined}
          errorMessage={state.errorMessage ?? undefined}
          onDone={handleDone}
          onRetry={state.resultStatus === 'failed' ? handleRetry : undefined}
          onViewExplorer={state.resultStatus === 'success' ? handleViewExplorer : undefined}
        />
      </div>
    )
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
          <span className="text-sm font-medium">{selectedChainName}</span>
        </div>

        {/* 地址输入 */}
        <AddressInput
          label="收款地址"
          value={state.toAddress}
          onChange={setToAddress}
          placeholder={`输入 ${selectedChainName} 地址`}
          onScan={handleScan}
          error={state.addressError ?? undefined}
        />

        {/* 金额输入 */}
        <AmountInput
          label="金额"
          value={state.amount}
          onChange={setAmount}
          balance={balance}
          symbol={symbol}
          max={balance}
          error={state.amountError ?? undefined}
          fiatValue={state.amount ? `${parseFloat(state.amount).toFixed(2)}` : undefined}
        />

        {/* 网络提示 */}
        <Alert variant="info">
          请确保收款地址为 {selectedChainName} 网络地址，发送到错误网络将无法找回
        </Alert>

        {/* 继续按钮 */}
        <div className="pt-4">
          <GradientButton
            variant="mint"
            className="w-full"
            disabled={!canProceed}
            onClick={handleProceed}
          >
            继续
            <ArrowRight className="ml-2 size-4" />
          </GradientButton>
        </div>
      </div>

      {/* 确认弹窗 */}
      <TransferConfirmSheet
        open={state.step === 'confirm'}
        onClose={goBack}
        onConfirm={handleConfirm}
        amount={state.amount}
        symbol={symbol}
        toAddress={state.toAddress}
        feeAmount={state.feeAmount}
        feeSymbol={state.feeSymbol}
        feeLoading={state.feeLoading}
        isConfirming={state.isSubmitting}
      />
    </div>
  )
}
