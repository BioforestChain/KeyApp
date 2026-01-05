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
  encryptWithRawKey,
  decryptWithRawKey,
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
  deriveBitcoinKey,
  deriveMultiChainKeys,
  deriveHDKey,
  getBIP44Path,
  toChecksumAddress,
  isValidAddress,
  deriveEncryptionKeyFromMnemonic,
  deriveEncryptionKeyFromSecret,
  type DerivedKey,
  type ChainType as DeriveChainType,
  type BitcoinPurpose,
} from './derivation'

// BioForestChain (Ed25519-based chains)
export {
  createBioforestKeypair,
  keypairFromSecretKey,
  publicKeyToBioforestAddress,
  privateKeyToBioforestAddress,
  isValidBioforestAddress,
  deriveBioforestKey,
  deriveBioforestKeyFromChainConfig,
  deriveBioforestMultiChainKeys,
  deriveBioforestAddresses,
  deriveBioforestAddressesFromChainConfigs,
  isBioforestChain,
  isBioforestChainConfig,
  getBioforestChains,
  getBioforestChainConfig,
  toBioforestChainConfig,
  signMessage,
  verifySignature,
  base58Encode,
  base58Decode,
  bytesToHex,
  hexToBytes,
  BIOFOREST_CHAINS,
  type BioforestChainType,
  type BioforestKeypair,
  type BioforestDerivedKey,
  type BioforestChainConfig,
} from './bioforest'
