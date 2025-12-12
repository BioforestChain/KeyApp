import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Filter } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { TransactionList } from '@/components/transaction/transaction-list'
import { useTransactionHistory, type TransactionFilter } from '@/hooks/use-transaction-history'
import { useCurrentWallet } from '@/stores'
import { cn } from '@/lib/utils'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import type { ChainType } from '@/stores'

/** 链选项 */
const CHAIN_OPTIONS: { value: ChainType | 'all'; label: string }[] = [
  { value: 'all', label: '全部链' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'tron', label: 'Tron' },
  { value: 'bitcoin', label: 'Bitcoin' },
  { value: 'binance', label: 'BNB Chain' },
]

/** 时间段选项 */
const PERIOD_OPTIONS: { value: TransactionFilter['period']; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '7d', label: '7天' },
  { value: '30d', label: '30天' },
  { value: '90d', label: '90天' },
]

export function TransactionHistoryPage() {
  const navigate = useNavigate()
  const currentWallet = useCurrentWallet()
  const { t } = useTranslation()
  const {
    transactions,
    isLoading,
    filter,
    setFilter,
    refresh,
  } = useTransactionHistory(currentWallet?.id)

  // 处理交易点击 - 导航到详情页
  const handleTransactionClick = useCallback((tx: TransactionInfo) => {
    navigate({ to: '/transaction/$txId', params: { txId: tx.id } })
  }, [navigate])

  // 处理链过滤器变化
  const handleChainChange = useCallback((chain: ChainType | 'all') => {
    setFilter({ ...filter, chain })
  }, [filter, setFilter])

  // 处理时间段过滤器变化
  const handlePeriodChange = useCallback((period: TransactionFilter['period']) => {
    setFilter({ ...filter, period })
  }, [filter, setFilter])

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <PageHeader title="交易记录" onBack={() => navigate({ to: '/' })} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">请先创建或导入钱包</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader
        title="交易记录"
        onBack={() => navigate({ to: '/' })}
        rightAction={
          <button
            onClick={refresh}
            disabled={isLoading}
            className={cn(
              'p-2 rounded-full transition-colors',
              'hover:bg-muted active:bg-muted/80',
              isLoading && 'animate-spin'
            )}
            aria-label={t('a11y.refresh')}
          >
            <RefreshCw className="size-5" />
          </button>
        }
      />

      {/* 过滤器栏 */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />

          {/* 链选择器 */}
          <select
            value={filter.chain || 'all'}
            onChange={(e) => handleChainChange(e.target.value as ChainType | 'all')}
            className={cn(
              'rounded-lg border bg-background px-3 py-1.5 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            aria-label={t('a11y.selectChain')}
          >
            {CHAIN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* 时间段选择器 */}
          <select
            value={filter.period || 'all'}
            onChange={(e) => handlePeriodChange(e.target.value as TransactionFilter['period'])}
            className={cn(
              'rounded-lg border bg-background px-3 py-1.5 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            aria-label={t('a11y.selectPeriod')}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 结果统计 */}
        <p className="mt-2 text-xs text-muted-foreground">
          共 {transactions.length} 条记录
        </p>
      </div>

      {/* 交易列表 */}
      <div className="flex-1 p-4">
        <TransactionList
          transactions={transactions}
          loading={isLoading}
          onTransactionClick={handleTransactionClick}
          emptyTitle="暂无交易记录"
          emptyDescription="当前筛选条件下没有交易记录"
        />
      </div>
    </div>
  )
}
