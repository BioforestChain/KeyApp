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

describe('Teleport App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window as unknown as { bio: typeof mockBio }).bio = mockBio
  })

  it('should render initial connect step', () => {
    render(<App />)

    expect(screen.getByText('一键传送')).toBeInTheDocument()
    expect(screen.getByText('将资产从一个钱包转移到另一个钱包')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '连接钱包' })).toBeInTheDocument()
  })

  it('should show loading state when connecting', async () => {
    mockBio.request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    expect(screen.getByRole('button', { name: '连接中...' })).toBeInTheDocument()
  })

  it('should proceed to select-source after connecting', async () => {
    mockBio.request.mockResolvedValue([{ address: '0x123', chain: 'bioforest' }])

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText('选择源地址（资产转出方）')).toBeInTheDocument()
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
    mockBio.request.mockRejectedValue(new Error('Network error'))

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('should call bio_requestAccounts on connect', async () => {
    mockBio.request.mockResolvedValue([])

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    await waitFor(() => {
      expect(mockBio.request).toHaveBeenCalledWith({
        method: 'bio_requestAccounts',
      })
    })
  })
})
