export { WalletCard } from './wallet-card'
export { WalletSelector } from './wallet-selector'

/**
 * @deprecated Use Wallet from @/stores for new components.
 * This interface is kept for backward compatibility with WalletSelector.
 */
export interface WalletInfo {
  id: string
  name: string
  address: string
  balance?: string | undefined
  fiatValue?: string | undefined
  chainName?: string | undefined
  isBackedUp?: boolean | undefined
  /** 主题色 hue (0-360) */
  themeHue?: number | undefined
  /** 链图标 URL，用于彩虹水印 */
  chainIconUrl?: string | undefined
}
export { AddressDisplay } from './address-display'
export { ChainIcon, ChainBadge, ChainIconProvider, type ChainType } from './chain-icon'
export { ChainAddressDisplay } from './chain-address-display'
export { TokenIcon, TokenBadge, TokenIconProvider } from './token-icon'
