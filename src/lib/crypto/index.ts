export {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeed,
  getWordList,
  isValidWord,
  searchWords,
  type MnemonicStrength,
} from './mnemonic'

export {
  encrypt,
  decrypt,
  verifyPassword,
  type EncryptedData,
} from './encryption'

export {
  BiometricAuth,
  SecureStorage,
  isDwebEnvironment,
  storeMnemonic,
  retrieveMnemonic,
  type BiometricOptions,
  type BiometricResult,
  type SecureStorageOptions,
  type StoredData,
} from './secure-storage'

export {
  deriveKey,
  deriveMultiChainKeys,
  deriveHDKey,
  getBIP44Path,
  toChecksumAddress,
  isValidAddress,
  type DerivedKey,
  type ChainType as DeriveChainType,
} from './derivation'

// BioForestChain (Ed25519-based chains)
export {
  createBioforestKeypair,
  keypairFromSecretKey,
  publicKeyToBioforestAddress,
  privateKeyToBioforestAddress,
  isValidBioforestAddress,
  deriveBioforestKey,
  deriveBioforestMultiChainKeys,
  isBioforestChain,
  getBioforestChains,
  getBioforestChainConfig,
  signMessage,
  verifySignature,
  base58Encode,
  base58Decode,
  BIOFOREST_CHAINS,
  type BioforestChainType,
  type BioforestKeypair,
  type BioforestDerivedKey,
  type BioforestChainConfig,
} from './bioforest'
