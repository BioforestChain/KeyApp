import { useParams, useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { BalanceDisplay } from '@/components/token/balance-display'
import { TransactionList } from '@/components/transaction/transaction-list'
import { GradientButton } from '@/components/common/gradient-button'
import { ArrowUp, ArrowDown } from 'lucide-react'

// 临时模拟数据
const mockToken = {
  symbol: 'USDT',
  name: 'Tether USD',
  balance: '1,234.56',
  fiatValue: 1234.56,
  change24h: 0.01,
}

const mockTransactions = [
  {
    id: '1',
    type: 'send' as const,
    status: 'confirmed' as const,
    amount: '100',
    symbol: 'USDT',
    address: '0xabcd...1234',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    type: 'receive' as const,
    status: 'confirmed' as const,
    amount: '500',
    symbol: 'USDT',
    address: '0x1234...abcd',
    timestamp: new Date(Date.now() - 86400000),
  },
]

export function TokenDetailPage() {
  const { tokenId } = useParams({ from: '/token/$tokenId' })
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader 
        title={mockToken.symbol} 
        onBack={() => navigate({ to: '/' })}
      />
      
      <div className="flex-1 space-y-6 p-4">
        {/* 余额显示 */}
        <div className="text-center">
          <BalanceDisplay
            balance={mockToken.balance}
            symbol={mockToken.symbol}
            fiatValue={mockToken.fiatValue}
            size="lg"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <GradientButton
            variant="mint"
            className="flex-1"
            onClick={() => navigate({ to: '/send' })}
          >
            <ArrowUp className="mr-2 size-4" />
            发送
          </GradientButton>
          <GradientButton
            variant="blue"
            className="flex-1"
            onClick={() => navigate({ to: '/receive' })}
          >
            <ArrowDown className="mr-2 size-4" />
            接收
          </GradientButton>
        </div>

        {/* 交易历史 */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">交易历史</h3>
          <TransactionList
            transactions={mockTransactions}
            emptyTitle="暂无交易"
            emptyDescription="该代币还没有交易记录"
          />
        </div>
      </div>
    </div>
  )
}
