// Stores
export { walletStore, walletActions, walletSelectors } from './wallet'
export type { Wallet, ChainType, ChainAddress, WalletState } from './wallet'

// Address Book Store
export { addressBookStore, addressBookActions, addressBookSelectors } from './address-book'
export type { Contact, ContactAddress, ContactSuggestion, AddressBookState } from './address-book'

// User Profile Store
export {
  userProfileStore,
  userProfileActions,
  userProfileSelectors,
  useUserProfile,
  useUsername,
  useAvatar,
  useSelectedWalletIds,
  useIsWalletSelected,
  useCanAddMoreWallets,
} from './user-profile'
export type { UserProfile } from './user-profile'

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
  useChainNameMap,
  useChainDisplayName,
  getChainDisplayName,
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
  useHasWallet,
  useWalletLoading,
  useWalletInitialized,
  useWalletMigrationRequired,
} from './hooks'
// 已移除的 hooks (现在使用 chain-provider):
// - useCurrentChainTokens → getChainProvider(chain).tokenBalances.useState()
// - useAvailableChains → wallet.chainAddresses.map(ca => ca.chain)
// - useCurrentTokens → getChainProvider(chain).tokenBalances.useState()
// - useTotalFiatValue → 价格数据需要从价格服务获取
