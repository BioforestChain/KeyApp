/// <reference types="vite/client" />

import type {
  BioProvider,
  EthereumProvider,
  TronLinkProvider,
  TronWebProvider,
} from '@biochain/bio-sdk'

interface ImportMetaEnv {
  readonly VITE_COT_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    bio?: BioProvider
    ethereum?: EthereumProvider
    tronLink?: TronLinkProvider
    tronWeb?: TronWebProvider
  }
}

export {}
