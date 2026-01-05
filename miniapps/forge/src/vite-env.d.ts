/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COT_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Bio SDK types are auto-declared by importing @biochain/bio-sdk
// This ensures window.bio, window.ethereum, window.tronLink are available
