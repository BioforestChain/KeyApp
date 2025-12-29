import type { BioProvider } from '@biochain/bio-sdk'

declare global {
  interface Window {
    bio?: BioProvider
  }
}
