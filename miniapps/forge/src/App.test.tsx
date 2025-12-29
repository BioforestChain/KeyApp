import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

// Mock bio SDK
const mockBio = {
  request: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isConnected: vi.fn(() => true),
}

describe('Forge App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window as unknown as { bio: typeof mockBio }).bio = mockBio
  })

  it('should render initial connect step', () => {
    render(<App />)

    expect(screen.getByText('多链熔炉')).toBeInTheDocument()
    expect(screen.getByText(/将其他链资产锻造为/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
  })

  it('should show loading state when connecting', async () => {
    mockBio.request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ address: '0x123', chain: 'ethereum' }), 1000))
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    expect(screen.getByRole('button', { name: '连接中...' })).toBeInTheDocument()
  })

  it('should proceed to swap step after selecting wallet', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'ethereum' })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText('支付')).toBeInTheDocument()
    })
  })

  it('should show error when bio SDK not initialized', async () => {
    ;(window as unknown as { bio: undefined }).bio = undefined

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText('Bio SDK 未初始化')).toBeInTheDocument()
    })
  })

  it('should show error when connection fails', async () => {
    mockBio.request.mockRejectedValue(new Error('Connection failed'))

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })
  })

  it('should call bio_selectAccount on connect', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'ethereum' })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(mockBio.request).toHaveBeenCalledWith({
        method: 'bio_selectAccount',
        params: [{}],
      })
    })
  })
})
