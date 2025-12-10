import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Copy, ExternalLink, Check, Clock, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { AddressDisplay } from '@/components/wallet/address-display'
import { AmountDisplay, TimeDisplay } from '@/components/common'
import { TransactionStatus as TransactionStatusBadge } from '@/components/transaction/transaction-status'
import { FeeDisplay } from '@/components/transaction/fee-display'
import { useTransactionHistory, type TransactionRecord } from '@/hooks/use-transaction-history'
import { useCurrentWallet } from '@/stores'
import { cn } from '@/lib/utils'
import { useState } from 'react'

/** 交易类型标签映射 */
const TYPE_LABELS: Record<string, string> = {
  send: '发送',
  receive: '接收',
  swap: '兑换',
  stake: '质押',
  unstake: '解押',
  approve: '授权',
}

/** 状态映射 (TransactionInfo.status -> TransactionStatusType) */
const STATUS_MAP: Record<string, 'success' | 'failed' | 'pending'> = {
  confirmed: 'success',
  pending: 'pending',
  failed: 'failed',
}

/** 状态标签 */
const STATUS_LABELS: Record<string, string> = {
  confirmed: '已确认',
  pending: '处理中',
  failed: '失败',
}

/** 链浏览器 URL 映射 */
const EXPLORER_URLS: Record<string, string> = {
  ethereum: 'https://etherscan.io/tx/',
  tron: 'https://tronscan.org/#/transaction/',
  bitcoin: 'https://blockstream.info/tx/',
  binance: 'https://bscscan.com/tx/',
}

export function TransactionDetailPage() {
  const navigate = useNavigate()
  const { txId } = useParams({ from: '/transaction/$txId' })
  const currentWallet = useCurrentWallet()
  const { transactions } = useTransactionHistory(currentWallet?.id)

  const [copied, setCopied] = useState(false)

  // 查找交易
  const transaction = useMemo<TransactionRecord | undefined>(() => {
    return transactions.find((tx) => tx.id === txId)
  }, [transactions, txId])

  // 复制交易哈希
  const handleCopyHash = useCallback(async () => {
    if (transaction?.hash) {
      await navigator.clipboard.writeText(transaction.hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [transaction?.hash])

  // 在浏览器中查看
  const handleViewExplorer = useCallback(() => {
    if (transaction?.hash && transaction?.chain) {
      const baseUrl = EXPLORER_URLS[transaction.chain]
      if (baseUrl) {
        window.open(baseUrl + transaction.hash, '_blank')
      }
    }
  }, [transaction])

  // 返回
  const handleBack = useCallback(() => {
    navigate({ to: '/history' })
  }, [navigate])

  // 无钱包
  if (!currentWallet) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <PageHeader title="交易详情" showBack onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">请先创建或导入钱包</p>
        </div>
      </div>
    )
  }

  // 交易未找到
  if (!transaction) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <PageHeader title="交易详情" showBack onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">交易不存在或已过期</p>
        </div>
      </div>
    )
  }

  const statusIcon = {
    pending: <Clock className="size-8 text-yellow-500" />,
    confirmed: <Check className="size-8 text-secondary" />,
    failed: <XCircle className="size-8 text-destructive" />,
  }[transaction.status]

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title="交易详情" showBack onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 状态头 */}
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-6 shadow-sm">
          <div className={cn(
            'flex size-16 items-center justify-center rounded-full',
            transaction.status === 'pending' && 'bg-yellow-500/10',
            transaction.status === 'confirmed' && 'bg-secondary/10',
            transaction.status === 'failed' && 'bg-destructive/10',
          )}>
            {statusIcon}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {TYPE_LABELS[transaction.type] || transaction.type}
            </p>
            <AmountDisplay
              value={transaction.type === 'send' ? -Math.abs(parseFloat(transaction.amount)) : transaction.amount}
              symbol={transaction.symbol}
              sign="always"
              color="auto"
              weight="bold"
              size="xl"
            />
          </div>

          <TransactionStatusBadge
            status={STATUS_MAP[transaction.status] || 'pending'}
            label={STATUS_LABELS[transaction.status]}
          />
        </div>

        {/* 详细信息 */}
        <div className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">交易信息</h3>

          {/* 地址 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">
              {transaction.type === 'send' ? '收款地址' : '发送地址'}
            </span>
            <AddressDisplay
              address={transaction.address}
              copyable
              className="text-sm"
            />
          </div>

          <div className="h-px bg-border" />

          {/* 时间 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">交易时间</span>
            <TimeDisplay
              value={transaction.timestamp}
              format="full"
              className="text-sm"
            />
          </div>

          <div className="h-px bg-border" />

          {/* 链 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">网络</span>
            <span className="text-sm font-medium capitalize">{transaction.chain}</span>
          </div>

          {/* 手续费 */}
          {transaction.fee && (
            <>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">手续费</span>
                <FeeDisplay
                  fee={transaction.fee}
                  symbol={transaction.feeSymbol || transaction.symbol}
                  size="sm"
                />
              </div>
            </>
          )}

          {/* 区块号 */}
          {transaction.blockNumber && (
            <>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">区块高度</span>
                <span className="text-sm font-medium">{transaction.blockNumber.toLocaleString()}</span>
              </div>
            </>
          )}

          {/* 确认数 */}
          {transaction.confirmations !== undefined && transaction.confirmations > 0 && (
            <>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">确认数</span>
                <span className="text-sm font-medium">{transaction.confirmations}</span>
              </div>
            </>
          )}
        </div>

        {/* 交易哈希 */}
        {transaction.hash && (
          <div className="space-y-3 rounded-xl bg-card p-4 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">交易哈希</h3>
            <p className="break-all text-xs font-mono text-muted">
              {transaction.hash}
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleCopyHash}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5',
                  'border bg-background transition-colors',
                  'hover:bg-muted active:bg-muted/80'
                )}
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-secondary" />
                    <span className="text-sm">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span className="text-sm">复制哈希</span>
                  </>
                )}
              </button>

              <button
                onClick={handleViewExplorer}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5',
                  'border bg-background transition-colors',
                  'hover:bg-muted active:bg-muted/80'
                )}
              >
                <ExternalLink className="size-4" />
                <span className="text-sm">区块浏览器</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
