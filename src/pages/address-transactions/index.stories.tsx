import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within, waitFor } from '@storybook/test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddressTransactionsPage } from './index'

// Create a fresh QueryClient for each story
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
})

const meta = {
  title: 'Pages/AddressTransactions',
  component: AddressTransactionsPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <div className="max-w-md mx-auto min-h-screen bg-background">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AddressTransactionsPage>

export default meta
type Story = StoryObj<typeof meta>

// 默认状态
export const Default: Story = {}

// 搜索 ETH 地址
export const SearchEthereumAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // 选择 Ethereum 链
    const chainSelect = canvas.getByRole('combobox')
    await userEvent.click(chainSelect)
    
    // 等待下拉菜单出现
    await waitFor(() => {
      expect(canvas.getByText('Ethereum')).toBeVisible()
    })
    
    await userEvent.click(canvas.getByText('Ethereum'))
    
    // 输入地址
    const addressInput = canvas.getByPlaceholderText(/输入地址/i)
    await userEvent.type(addressInput, '0x75a6F48BF634868b2980c97CcEf467A127597e08')
    
    // 点击搜索
    const searchButton = canvas.getByRole('button', { name: '' }) // Search button has icon only
    await userEvent.click(searchButton)
    
    // 等待加载完成
    await waitFor(() => {
      // 应该显示结果或"无交易"消息
      const noTransactions = canvas.queryByText(/没有交易记录|No transactions/i)
      const useExplorer = canvas.queryByText(/请使用区块浏览器|View on explorer/i)
      const transactions = canvas.queryAllByText(/^(From|To):/i)
      
      expect(
        noTransactions !== null || 
        useExplorer !== null || 
        transactions.length > 0
      ).toBe(true)
    }, { timeout: 10000 })
  },
}

// 搜索 BFMeta 地址
export const SearchBfmetaAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // BFMeta 是默认选中的链，直接输入地址
    const addressInput = canvas.getByPlaceholderText(/输入地址/i)
    await userEvent.type(addressInput, 'b1234567890abcdef1234567890abcdef12345678')
    
    // 点击搜索
    const searchButton = canvas.getByRole('button', { name: '' })
    await userEvent.click(searchButton)
    
    // 等待加载完成
    await waitFor(() => {
      // BFMeta 支持交易历史查询
      const results = canvas.queryByText(/没有交易记录|From:|To:/i)
      expect(results).not.toBeNull()
    }, { timeout: 10000 })
  },
}
