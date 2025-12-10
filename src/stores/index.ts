// Stores
export { walletStore, walletActions, walletSelectors } from './wallet'
export type { Wallet, Token, ChainType, ChainAddress, WalletState } from './wallet'

// Address Book Store
export { addressBookStore, addressBookActions, addressBookSelectors } from './address-book'
export type { Contact, AddressBookState } from './address-book'

// Preferences Store
export {
  preferencesStore,
  preferencesActions,
  usePreferences,
  useLanguage,
  useCurrency,
  useTheme,
  currencies,
  languages,
} from './preferences'
export type { PreferencesState, CurrencyCode, LanguageCode } from './preferences'

// Hooks
export {
  useWalletState,
  useWallets,
  useCurrentWallet,
  useSelectedChain,
  useCurrentChainAddress,
  useCurrentChainTokens,
  useAvailableChains,
  useCurrentTokens,
  useTotalFiatValue,
  useHasWallet,
  useWalletLoading,
  useWalletInitialized,
} from './hooks'
