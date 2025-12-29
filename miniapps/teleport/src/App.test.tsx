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
    expect(screen.getByText('跨钱包传送')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '启动传送门' })).toBeInTheDocument()
  })

  it('should show loading state when connecting', async () => {
    mockBio.request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ address: '0x123', chain: 'bioforest' }), 1000))
    )

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    expect(screen.getByRole('button', { name: '连接中...' })).toBeInTheDocument()
  })

  it('should proceed to select-asset after connecting', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'bioforest' })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(screen.getByText('选择资产')).toBeInTheDocument()
    })
  })

  it('should show error when bio SDK not initialized', async () => {
    ;(window as unknown as { bio: undefined }).bio = undefined

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(screen.getByText('Bio SDK 未初始化')).toBeInTheDocument()
    })
  })

  it('should show error when connection fails', async () => {
    mockBio.request.mockRejectedValue(new Error('Network error'))

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('should call bio_selectAccount on connect', async () => {
    mockBio.request.mockResolvedValue({ address: '0x123', chain: 'bioforest' })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '启动传送门' }))

    await waitFor(() => {
      expect(mockBio.request).toHaveBeenCalledWith({
        method: 'bio_selectAccount',
        params: [{}],
      })
    })
  })
})
