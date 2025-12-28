import type { BioProvider } from '@aspect-aspect/bio-sdk'

declare global {
  interface Window {
    bio?: BioProvider
  }
}
