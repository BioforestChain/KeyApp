import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within, userEvent, fn, waitFor } from 'storybook/test'
import App from './App'

// Mock API for stories
const mockConfig = {
  bfmeta: {
    BFM: {
      enable: true,
      logo: '',
      supportChain: {
        ETH: {
          enable: true,
          assetType: 'ETH',
          depositAddress: '0x1234567890abcdef1234567890abcdef12345678',
          logo: '',
        },
        BSC: {
          enable: true,
          assetType: 'BNB',
          depositAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          logo: '',
        },
      },
    },
  },
}

// Setup mock API responses
const setupMockApi = () => {
  window.fetch = fn().mockImplementation((url: string) => {
    // Match /cot/recharge/support endpoint
    if (url.includes('/recharge/support')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ recharge: mockConfig }),
      })
    }
    // Match /cot/recharge/V2 endpoint
    if (url.includes('/recharge/V2')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ orderId: 'mock-order-123' }),
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
}

type EthereumRequest = (args: { method: string; params?: unknown[] }) => Promise<unknown>

function setupMockEthereumProvider(opts?: {
  accounts?: string[]
}): void {
  const accounts = opts?.accounts ?? ['0x1111111111111111111111111111111111111111']

  const request: EthereumRequest = fn().mockImplementation(({ method }) => {
    if (method === 'wallet_switchEthereumChain') return Promise.resolve(null)
    if (method === 'eth_requestAccounts') return Promise.resolve(accounts)
    if (method === 'eth_chainId') return Promise.resolve('0x1')
    return Promise.resolve(null)
  })

  window.ethereum = { request } as unknown as typeof window.ethereum
}

const meta = {
  title: 'App/ForgeApp',
  component: App,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => {
      setupMockApi()
      setupMockEthereumProvider()
      return (
        <div style={{ width: '375px', height: '667px', margin: '0 auto' }}>
          <Story />
        </div>
      )
    },
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Initial connect state - shows welcome screen
 */
export const ConnectStep: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for config to load and connect button to become enabled
    await waitFor(
      () => {
        const connectButton = canvas.getByTestId('connect-button')
        expect(connectButton).toBeEnabled()
      },
      { timeout: 5000 }
    )

    // Should show connect button
    const connectButton = canvas.getByTestId('connect-button')
    expect(connectButton).toBeInTheDocument()
  },
}

/**
 * Swap step - after wallet connected
 */
export const SwapStep: Story = {
  decorators: [
    (Story) => {
      setupMockApi()
      setupMockEthereumProvider()
      // Mock bio SDK with connected wallet
      // @ts-expect-error - mock global
      window.bio = {
        request: fn().mockImplementation(({ method, params }: { method: string; params?: unknown[] }) => {
          if (method === 'bio_selectAccount') {
            const chain = (params?.[0] as { chain?: string } | undefined)?.chain ?? 'bfmeta'
            return Promise.resolve({
              address: chain === 'bfmeta' ? 'bfmeta123' : '0x1234567890abcdef1234567890abcdef12345678',
              chain,
              publicKey: '0x',
            })
          }
          if (method === 'bio_closeSplashScreen') {
            return Promise.resolve()
          }
          return Promise.resolve({})
        }),
      }
      return (
        <div style={{ width: '375px', height: '667px', margin: '0 auto' }}>
          <Story />
        </div>
      )
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for connect button to be enabled (config loaded)
    await waitFor(
      () => {
        const btn = canvas.getByTestId('connect-button')
        expect(btn).toBeEnabled()
      },
      { timeout: 5000 }
    )

    const connectButton = canvas.getByTestId('connect-button')
    await userEvent.click(connectButton)

    // Should show swap UI with amount input
    await waitFor(
      () => {
        expect(canvas.getByTestId('amount-input')).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  },
}

/**
 * Swap step with amount entered
 */
export const SwapWithAmount: Story = {
  decorators: [
    (Story) => {
      setupMockApi()
      // @ts-expect-error - mock global
      window.bio = {
        request: fn().mockImplementation(({ method }: { method: string }) => {
          if (method === 'bio_selectAccount') {
            return Promise.resolve({
              address: '0x1234567890abcdef1234567890abcdef12345678',
              chain: 'eth',
            })
          }
          if (method === 'bio_closeSplashScreen') {
            return Promise.resolve()
          }
          return Promise.resolve({})
        }),
      }
      return (
        <div style={{ width: '375px', height: '667px', margin: '0 auto' }}>
          <Story />
        </div>
      )
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for connect button to be enabled (config loaded)
    await waitFor(
      () => {
        const btn = canvas.getByTestId('connect-button')
        expect(btn).toBeEnabled()
      },
      { timeout: 5000 }
    )

    await userEvent.click(canvas.getByTestId('connect-button'))

    // Wait for swap UI
    await waitFor(
      () => {
        expect(canvas.getByTestId('amount-input')).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Enter amount
    const input = canvas.getByTestId('amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '1.5')

    // Preview button should be enabled
    await waitFor(() => {
      const previewButton = canvas.getByTestId('preview-button')
      expect(previewButton).toBeEnabled()
    })
  },
}

/**
 * Token picker modal
 */
export const TokenPicker: Story = {
  decorators: [
    (Story) => {
      setupMockApi()
      setupMockEthereumProvider()
      // @ts-expect-error - mock global
      window.bio = {
        request: fn().mockImplementation(({ method, params }: { method: string; params?: unknown[] }) => {
          if (method === 'bio_selectAccount') {
            const chain = (params?.[0] as { chain?: string } | undefined)?.chain ?? 'bfmeta'
            return Promise.resolve({
              address: chain === 'bfmeta' ? 'bfmeta123' : '0x1234567890abcdef1234567890abcdef12345678',
              chain,
              publicKey: '0x',
            })
          }
          if (method === 'bio_closeSplashScreen') {
            return Promise.resolve()
          }
          return Promise.resolve({})
        }),
      }
      return (
        <div style={{ width: '375px', height: '667px', margin: '0 auto' }}>
          <Story />
        </div>
      )
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for connect button to be enabled (config loaded)
    await waitFor(
      () => {
        const btn = canvas.getByTestId('connect-button')
        expect(btn).toBeEnabled()
      },
      { timeout: 5000 }
    )

    await userEvent.click(canvas.getByTestId('connect-button'))

    // Wait for swap UI with amount input
    await waitFor(
      () => {
        expect(canvas.getByTestId('amount-input')).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  },
}

/**
 * Loading state while connecting
 */
export const LoadingState: Story = {
  decorators: [
    (Story) => {
      setupMockApi()
      setupMockEthereumProvider()
      // Mock slow bio SDK
      // @ts-expect-error - mock global
      window.bio = {
        request: fn().mockImplementation(({ method, params }: { method: string; params?: unknown[] }) => {
          if (method === 'bio_selectAccount') {
            // Simulate slow connection
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  address: ((params?.[0] as { chain?: string } | undefined)?.chain ?? 'bfmeta') === 'bfmeta' ? 'bfmeta123' : '0x123',
                  chain: (params?.[0] as { chain?: string } | undefined)?.chain ?? 'bfmeta',
                  publicKey: '0x',
                })
              }, 10000)
            })
          }
          return Promise.resolve({})
        }),
      }
      return (
        <div style={{ width: '375px', height: '667px', margin: '0 auto' }}>
          <Story />
        </div>
      )
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for connect button to be enabled (config loaded)
    await waitFor(
      () => {
        const btn = canvas.getByTestId('connect-button')
        expect(btn).toBeEnabled()
      },
      { timeout: 5000 }
    )

    // Click connect
    await userEvent.click(canvas.getByTestId('connect-button'))

    // Should show loading state (button text changes while connecting)
    // Note: Loading state is transient, just verify button was clicked
  },
}

/**
 * Error state - SDK not initialized
 */
export const ErrorState: Story = {
  decorators: [
    (Story) => {
      setupMockApi()
      // No bio SDK - set to undefined
      window.bio = undefined
      return (
        <div style={{ width: '375px', height: '667px', margin: '0 auto' }}>
          <Story />
        </div>
      )
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for connect button to be enabled (config loaded)
    await waitFor(
      () => {
        const btn = canvas.getByTestId('connect-button')
        expect(btn).toBeEnabled()
      },
      { timeout: 5000 }
    )

    // Click connect - should show error (Bio SDK not initialized)
    await userEvent.click(canvas.getByTestId('connect-button'))

    // Error message should appear in the UI
    await waitFor(() => {
      // Look for error card which appears when SDK is not initialized
      const errorElements = canvasElement.querySelectorAll('[class*="destructive"]')
      expect(errorElements.length).toBeGreaterThan(0)
    })
  },
}
