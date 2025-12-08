import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabBar, type TabItem } from './tab-bar'

const mockItems: TabItem[] = [
  { id: 'home', label: '首页', icon: <span data-testid="home-icon">H</span> },
  { id: 'wallet', label: '钱包', icon: <span data-testid="wallet-icon">W</span> },
  { id: 'me', label: '我的', icon: <span data-testid="me-icon">M</span> },
]

describe('TabBar', () => {
  it('renders all tab items', () => {
    render(<TabBar items={mockItems} activeId="home" onTabChange={() => {}} />)
    
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('钱包')).toBeInTheDocument()
    expect(screen.getByText('我的')).toBeInTheDocument()
  })

  it('highlights active tab', () => {
    render(<TabBar items={mockItems} activeId="wallet" onTabChange={() => {}} />)
    
    const walletTab = screen.getByText('钱包').closest('button')
    expect(walletTab).toHaveAttribute('aria-current', 'page')
    expect(walletTab).toHaveClass('text-primary')
  })

  it('calls onTabChange when tab is clicked', async () => {
    const handleChange = vi.fn()
    render(<TabBar items={mockItems} activeId="home" onTabChange={handleChange} />)
    
    await userEvent.click(screen.getByText('钱包'))
    expect(handleChange).toHaveBeenCalledWith('wallet')
  })

  it('renders badge when provided', () => {
    const itemsWithBadge: TabItem[] = [
      { id: 'home', label: '首页', icon: <span>H</span>, badge: 5 },
      { id: 'wallet', label: '钱包', icon: <span>W</span>, badge: '新' },
    ]
    
    render(<TabBar items={itemsWithBadge} activeId="home" onTabChange={() => {}} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('新')).toBeInTheDocument()
  })

  it('shows 99+ for badge numbers over 99', () => {
    const itemsWithLargeBadge: TabItem[] = [
      { id: 'home', label: '首页', icon: <span>H</span>, badge: 150 },
    ]
    
    render(<TabBar items={itemsWithLargeBadge} activeId="home" onTabChange={() => {}} />)
    
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('renders activeIcon when tab is active', () => {
    const itemsWithActiveIcon: TabItem[] = [
      { 
        id: 'home', 
        label: '首页', 
        icon: <span data-testid="home-icon">H</span>,
        activeIcon: <span data-testid="home-active-icon">HA</span>,
      },
    ]
    
    render(<TabBar items={itemsWithActiveIcon} activeId="home" onTabChange={() => {}} />)
    
    expect(screen.getByTestId('home-active-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument()
  })
})
