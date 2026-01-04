import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import App from './App'
import './i18n'

// Mock API responses
const mockAssetTypeList = {
  transmitSupport: {
    ETH: {
      ETH: {
        enable: true,
        isAirdrop: false,
        assetType: 'ETH',
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetChain: 'BFMCHAIN',
        targetAsset: 'BFM',
        ratio: { numerator: 1, denominator: 1 },
        transmitDate: {
          startDate: '2020-01-01',
          endDate: '2030-12-31',
        },
      },
      USDT: {
        enable: true,
        isAirdrop: false,
        assetType: 'USDT',
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetChain: 'BFMCHAIN',
        targetAsset: 'USDM',
        ratio: { numerator: 1, denominator: 1 },
        transmitDate: {
          startDate: '2020-01-01',
          endDate: '2030-12-31',
        },
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      },
    },
    BFMCHAIN: {
      BFM: {
        enable: true,
        isAirdrop: false,
        assetType: 'BFM',
        recipientAddress: 'bfm123456789',
        targetChain: 'ETHMETA',
        targetAsset: 'ETHM',
        ratio: { numerator: 10, denominator: 1 },
        transmitDate: {
          startDate: '2020-01-01',
          endDate: '2030-12-31',
        },
      },
    },
  },
}

// Setup mock fetch
const setupMockFetch = () => {
  const originalFetch = window.fetch
  window.fetch = async (url: RequestInfo | URL) => {
    const urlStr = url.toString()
    if (urlStr.includes('/transmit/assetTypeList')) {
      return new Response(JSON.stringify(mockAssetTypeList), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (urlStr.includes('/transmit/records')) {
      return new Response(JSON.stringify({ page: 1, pageSize: 10, dataList: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (urlStr.includes('/transmit') && !urlStr.includes('records')) {
      return new Response(JSON.stringify({ orderId: 'mock-order-123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return originalFetch(url)
  }
}

// Setup mock Bio SDK
const setupMockBio = (overrides?: Partial<typeof window.bio>) => {
  window.bio = {
    request: async ({ method, params: _params }) => {
      if (method === 'bio_closeSplashScreen') return
      if (method === 'bio_selectAccount') {
        return {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          chain: 'ETH',
          name: 'My Wallet',
        }
      }
      if (method === 'bio_pickWallet') {
        return {
          address: 'bfm_abcdef1234567890abcdef1234567890abcdef12',
          chain: 'BFMCHAIN',
          name: 'Target Wallet',
        }
      }
      if (method === 'bio_getBalance') {
        return '1000.00'
      }
      if (method === 'bio_createTransaction') {
        return { chainId: 'ETH', data: { raw: '0x...' } }
      }
      if (method === 'bio_signTransaction') {
        return { chainId: 'ETH', data: {}, signature: '0x123abc...' }
      }
      return {}
    },
    on: () => {},
    off: () => {},
    isConnected: () => true,
    ...overrides,
  } as typeof window.bio
}

// Decorator with QueryClient
const withQueryClient = (Story: React.ComponentType) => {
  setupMockFetch()
  setupMockBio()
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-md mx-auto">
        <Story />
      </div>
    </QueryClientProvider>
  )
}

const meta = {
  title: 'Pages/Teleport',
  component: App,
  decorators: [withQueryClient],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const ConnectStep: Story = {
  name: '01 - 连接钱包',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Wait for loading to finish
    await waitFor(async () => {
      const button = await canvas.findByRole('button', { name: /启动传送门/i })
      await expect(button).toBeInTheDocument()
    }, { timeout: 5000 })
  },
}

export const SelectAssetStep: Story = {
  name: '02 - 选择资产',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Wait for loading
    await waitFor(async () => {
      const button = await canvas.findByRole('button', { name: /启动传送门/i })
      await expect(button).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Click connect
    const connectButton = await canvas.findByRole('button', { name: /启动传送门/i })
    await userEvent.click(connectButton)
    
    // Verify asset list is shown
    await waitFor(async () => {
      await expect(canvas.getByText('选择资产')).toBeInTheDocument()
    }, { timeout: 3000 })
  },
}

export const InputAmountStep: Story = {
  name: '03 - 输入金额',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Wait for loading
    await waitFor(async () => {
      const button = await canvas.findByRole('button', { name: /启动传送门/i })
      await expect(button).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Click connect
    const connectButton = await canvas.findByRole('button', { name: /启动传送门/i })
    await userEvent.click(connectButton)
    
    // Wait for asset list
    await waitFor(async () => {
      await expect(canvas.getByText('选择资产')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Click on ETH asset using data-testid
    const ethCard = canvas.getByTestId('asset-card-ETH')
    await userEvent.click(ethCard)
    
    // Verify amount input is shown
    await waitFor(async () => {
      const input = canvas.getByRole('spinbutton')
      await expect(input).toBeInTheDocument()
    }, { timeout: 3000 })
  },
}

export const SelectTargetStep: Story = {
  name: '04 - 选择目标钱包',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Wait for loading
    await waitFor(async () => {
      const button = await canvas.findByRole('button', { name: /启动传送门/i })
      await expect(button).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Click connect
    await userEvent.click(await canvas.findByRole('button', { name: /启动传送门/i }))
    
    // Wait for and click asset
    await waitFor(() => expect(canvas.getByText('选择资产')).toBeInTheDocument(), { timeout: 3000 })
    const ethCard = canvas.getByTestId('asset-card-ETH')
    await userEvent.click(ethCard)
    
    // Enter amount
    await waitFor(() => expect(canvas.getByRole('spinbutton')).toBeInTheDocument(), { timeout: 3000 })
    await userEvent.type(canvas.getByRole('spinbutton'), '100')
    
    // Click next
    await userEvent.click(canvas.getByRole('button', { name: /下一步/i }))
    
    // Verify target selection is shown
    await waitFor(async () => {
      await expect(canvas.getByText(/选择目标钱包/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  },
}

export const ConfirmStep: Story = {
  name: '05 - 确认传送',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Wait for loading
    await waitFor(async () => {
      const button = await canvas.findByRole('button', { name: /启动传送门/i })
      await expect(button).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Click connect
    await userEvent.click(await canvas.findByRole('button', { name: /启动传送门/i }))
    
    // Select asset
    await waitFor(() => expect(canvas.getByText('选择资产')).toBeInTheDocument(), { timeout: 3000 })
    const ethCard = canvas.getByTestId('asset-card-ETH')
    await userEvent.click(ethCard)
    
    // Enter amount
    await waitFor(() => expect(canvas.getByRole('spinbutton')).toBeInTheDocument(), { timeout: 3000 })
    await userEvent.type(canvas.getByRole('spinbutton'), '100')
    await userEvent.click(canvas.getByRole('button', { name: /下一步/i }))
    
    // Select target
    await waitFor(() => expect(canvas.getByText(/选择目标钱包/i)).toBeInTheDocument(), { timeout: 3000 })
    await userEvent.click(canvas.getByRole('button', { name: /选择目标钱包/i }))
    
    // Verify confirm page
    await waitFor(async () => {
      await expect(canvas.getByText(/确认传送/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  },
}

export const NoSdkError: Story = {
  name: '错误 - SDK 未初始化',
  decorators: [
    (Story) => {
      setupMockFetch()
      // Don't setup bio SDK
      window.bio = undefined as unknown as typeof window.bio
      
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: Infinity },
        },
      })
      
      return (
        <QueryClientProvider client={queryClient}>
          <div className="max-w-md mx-auto">
            <Story />
          </div>
        </QueryClientProvider>
      )
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Wait for loading
    await waitFor(async () => {
      const button = await canvas.findByRole('button', { name: /启动传送门/i })
      await expect(button).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Click connect
    await userEvent.click(await canvas.findByRole('button', { name: /启动传送门/i }))
    
    // Verify error message
    await waitFor(async () => {
      await expect(canvas.getByText(/Bio SDK 未初始化/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  },
}
