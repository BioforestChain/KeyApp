import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TokenItem, type TokenInfo, type TokenItemContext } from './token-item'

// Mock hooks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}))

vi.mock('@/stores', () => ({
  useCurrency: () => 'USD',
  currencies: {
    USD: { symbol: '$' },
    CNY: { symbol: '¥' },
  },
}))

vi.mock('@/hooks/use-exchange-rate', () => ({
  useExchangeRate: () => ({ data: null, isLoading: false, error: null }),
  getExchangeRate: () => undefined,
}))

const mockToken: TokenInfo = {
  symbol: 'TEST',
  name: 'Test Token',
  balance: '100',
  decimals: 8,
  chain: 'bfmeta',
}

describe('TokenItem actions', () => {
  describe('renderActions', () => {
    it('renders custom actions when provided', () => {
      const renderActions = vi.fn((token: TokenInfo, context: TokenItemContext) => (
        <button data-testid="custom-action">Action</button>
      ))

      render(
        <TokenItem 
          token={mockToken} 
          renderActions={renderActions}
          mainAssetSymbol="BFM"
        />
      )

      expect(screen.getByTestId('custom-action')).toBeInTheDocument()
      expect(renderActions).toHaveBeenCalledWith(
        mockToken,
        expect.objectContaining({
          chainType: 'bfmeta',
          isBioforestChain: true,
          isMainAsset: false,
          canDestroy: true,
        })
      )
    })

    it('action click does not trigger parent onClick', () => {
      const onClick = vi.fn()
      const actionClick = vi.fn()
      
      const renderActions = () => (
        <button data-testid="custom-action" onClick={actionClick}>
          Action
        </button>
      )

      render(
        <TokenItem 
          token={mockToken} 
          onClick={onClick}
          renderActions={renderActions}
        />
      )

      fireEvent.click(screen.getByTestId('custom-action'))
      
      expect(actionClick).toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('context menu (onContextMenu)', () => {
    it('should trigger onContextMenu when provided', () => {
      const onContextMenu = vi.fn()
      
      render(
        <TokenItem 
          token={mockToken}
          onContextMenu={onContextMenu}
          testId="token-item"
        />
      )

      const tokenItem = screen.getByTestId('token-item')
      fireEvent.contextMenu(tokenItem)
      
      expect(onContextMenu).toHaveBeenCalledWith(
        expect.any(Object), // event
        mockToken,
        expect.objectContaining({
          chainType: 'bfmeta',
          isBioforestChain: true,
        })
      )
    })

    it('more button click should trigger onContextMenu', () => {
      const onContextMenu = vi.fn()
      
      render(
        <TokenItem 
          token={mockToken}
          onContextMenu={onContextMenu}
          testId="token-item"
        />
      )

      const moreButton = screen.getByLabelText(/more|更多/i)
      fireEvent.click(moreButton)
      
      expect(onContextMenu).toHaveBeenCalled()
    })

    it('long press should trigger onContextMenu on touch devices', async () => {
      const onContextMenu = vi.fn()
      
      render(
        <TokenItem 
          token={mockToken}
          onContextMenu={onContextMenu}
          testId="token-item"
        />
      )

      const tokenItem = screen.getByTestId('token-item')
      
      // Simulate long press via touch events
      fireEvent.touchStart(tokenItem)
      
      // Wait for long press timeout (typically 500ms)
      await new Promise(resolve => setTimeout(resolve, 600))
      
      fireEvent.touchEnd(tokenItem)
      
      expect(onContextMenu).toHaveBeenCalled()
    })

    it('should not show more button when onContextMenu is not provided', () => {
      render(
        <TokenItem 
          token={mockToken}
          testId="token-item"
        />
      )

      expect(screen.queryByLabelText(/more|操作/i)).not.toBeInTheDocument()
    })
  })

  describe('context for bioforest chains', () => {
    it('canDestroy is true for non-main asset on bioforest chain', () => {
      let capturedContext: TokenItemContext | null = null
      
      const renderActions = (_token: TokenInfo, context: TokenItemContext) => {
        capturedContext = context
        return null
      }

      render(
        <TokenItem 
          token={{ ...mockToken, chain: 'bfmeta' }}
          renderActions={renderActions}
          mainAssetSymbol="BFM"
        />
      )

      expect(capturedContext?.canDestroy).toBe(true)
      expect(capturedContext?.isBioforestChain).toBe(true)
      expect(capturedContext?.isMainAsset).toBe(false)
    })

    it('canDestroy is false for main asset', () => {
      let capturedContext: TokenItemContext | null = null
      
      const renderActions = (_token: TokenInfo, context: TokenItemContext) => {
        capturedContext = context
        return null
      }

      render(
        <TokenItem 
          token={{ ...mockToken, symbol: 'BFM', chain: 'bfmeta' }}
          renderActions={renderActions}
          mainAssetSymbol="BFM"
        />
      )

      expect(capturedContext?.canDestroy).toBe(false)
      expect(capturedContext?.isMainAsset).toBe(true)
    })

    it('canDestroy is false for non-bioforest chains', () => {
      let capturedContext: TokenItemContext | null = null
      
      const renderActions = (_token: TokenInfo, context: TokenItemContext) => {
        capturedContext = context
        return null
      }

      render(
        <TokenItem 
          token={{ ...mockToken, chain: 'ethereum' }}
          renderActions={renderActions}
          mainAssetSymbol="ETH"
        />
      )

      expect(capturedContext?.canDestroy).toBe(false)
      expect(capturedContext?.isBioforestChain).toBe(false)
    })
  })
})
