export const WALLET_PLAOC_PATH = {
  authorizeAddress: '/wallet/authorize/address',
  authorizeSignature: '/wallet/authorize/signature',
} as const

export type WalletPlaocPath = (typeof WALLET_PLAOC_PATH)[keyof typeof WALLET_PLAOC_PATH]

