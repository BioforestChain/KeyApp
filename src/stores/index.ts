// Stores
export { walletStore, walletActions, walletSelectors } from './wallet'
export type { Wallet, Token, ChainType, ChainAddress, WalletState } from './wallet'

// Address Book Store
export { addressBookStore, addressBookActions, addressBookSelectors } from './address-book'
export type { Contact, ContactAddress, ContactSuggestion, AddressBookState } from './address-book'

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

// Chain Config Store
export {
  chainConfigStore,
  chainConfigActions,
  chainConfigSelectors,
  useChainConfigState,
  useChainConfigs,
  useEnabledChains,
  useEnabledBioforestChainConfigs,
  useChainConfigSubscription,
  useChainConfigWarnings,
  useChainConfigLoading,
  useChainConfigError,
  useChainConfigMigrationRequired,
} from './chain-config'
export type { ChainConfigState } from './chain-config'

// Hooks
export {
  useWalletState,
  useWallets,
  useCurrentWallet,
  useSelectedChain,
  useChainPreferences,
  useCurrentChainAddress,
  useCurrentChainTokens,
  useAvailableChains,
  useCurrentTokens,
  useTotalFiatValue,
  useHasWallet,
  useWalletLoading,
  useWalletInitialized,
  useWalletMigrationRequired,
} from './hooks'
