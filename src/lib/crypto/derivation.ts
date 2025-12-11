/**
 * 密钥派生模块 - BIP32/BIP44
 * 
 * 支持的链：
 * - Ethereum (m/44'/60'/0'/0/x)
 * - Bitcoin (m/44'/0'/0'/0/x)
 * - Tron (m/44'/195'/0'/0/x)
 * - BFMeta (m/44'/9999'/0'/0/x)
 */

import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { bytesToHex } from '@noble/hashes/utils.js'

// ==================== 类型定义 ====================

export type ChainType = 'ethereum' | 'bitcoin' | 'tron' | 'bfmeta'

/**
 * Bitcoin BIP purpose codes
 * - 44: Legacy P2PKH (starts with 1)
 * - 49: Nested SegWit P2SH-P2WPKH (starts with 3)
 * - 84: Native SegWit P2WPKH (starts with bc1q)
 * - 86: Taproot P2TR (starts with bc1p)
 */
export type BitcoinPurpose = 44 | 49 | 84 | 86

export interface DerivedKey {
  /** 私钥 (hex) */
  privateKey: string
  /** 公钥 (hex, compressed) */
  publicKey: string
  /** 地址 */
  address: string
  /** 派生路径 */
  path: string
  /** 链类型 */
  chain: ChainType
  /** Bitcoin purpose (only for bitcoin chain) */
  purpose?: BitcoinPurpose
}

// BIP44 coin types
const COIN_TYPES: Record<ChainType, number> = {
  ethereum: 60,
  bitcoin: 0,
  tron: 195,
  bfmeta: 9999,
}

// ==================== 核心函数 ====================

/**
 * 从助记词派生 HD 密钥
 */
export function deriveHDKey(mnemonic: string, password?: string): HDKey {
  const seed = mnemonicToSeedSync(mnemonic, password)
  return HDKey.fromMasterSeed(seed)
}

/**
 * 获取 BIP44 路径
 * m / purpose' / coin_type' / account' / change / address_index
 */
export function getBIP44Path(
  chain: ChainType,
  account = 0,
  change = 0,
  index = 0
): string {
  const coinType = COIN_TYPES[chain]
  return `m/44'/${coinType}'/${account}'/${change}/${index}`
}

/**
 * 获取通用 BIP 路径（支持自定义 purpose）
 * m / purpose' / coin_type' / account' / change / address_index
 */
export function getBIPPath(
  purpose: number,
  coinType: number,
  account = 0,
  change = 0,
  index = 0
): string {
  return `m/${purpose}'/${coinType}'/${account}'/${change}/${index}`
}

/**
 * 从 HD 密钥派生子密钥
 */
export function deriveChildKey(hdKey: HDKey, path: string): HDKey {
  return hdKey.derive(path)
}

// ==================== 地址生成 ====================

/**
 * 从私钥生成以太坊地址
 */
export function privateKeyToEthereumAddress(privateKey: Uint8Array): string {
  // 从私钥生成未压缩公钥（不带前缀 04）
  const uncompressedPubKey = secp256k1.getPublicKey(privateKey, false)
  const pubKeyWithoutPrefix = uncompressedPubKey.slice(1) // 去掉 04 前缀

  // Keccak256 哈希，取后 20 字节
  const hash = keccak_256(pubKeyWithoutPrefix)
  const address = hash.slice(-20) as Uint8Array

  return '0x' + bytesToHex(address)
}

/**
 * 以太坊地址校验和 (EIP-55)
 */
export function toChecksumAddress(address: string): string {
  const addr = address.toLowerCase().replace('0x', '')
  // 将字符串转换为 Uint8Array
  const encoder = new TextEncoder()
  const hash = bytesToHex(keccak_256(encoder.encode(addr)))

  let checksumAddress = '0x'
  for (let i = 0; i < addr.length; i++) {
    if (parseInt(hash[i]!, 16) >= 8) {
      checksumAddress += addr[i]!.toUpperCase()
    } else {
      checksumAddress += addr[i]!
    }
  }

  return checksumAddress
}

/**
 * 从公钥生成比特币地址 (P2PKH, Legacy - BIP44)
 * Addresses start with '1' on mainnet
 */
export function publicKeyToBitcoinAddress(
  publicKey: Uint8Array,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  // SHA256 -> RIPEMD160
  const sha = sha256(publicKey)
  const hash160 = ripemd160(sha)

  // 添加网络前缀
  const prefix = network === 'mainnet' ? 0x00 : 0x6f
  const prefixed = new Uint8Array([prefix, ...hash160])

  // 双 SHA256 校验和
  const checksum = sha256(sha256(prefixed)).slice(0, 4)
  const full = new Uint8Array([...prefixed, ...checksum])

  // Base58 编码
  return base58Encode(full)
}

/**
 * 从公钥生成比特币 P2SH-P2WPKH 地址 (Nested SegWit - BIP49)
 * Addresses start with '3' on mainnet
 */
export function publicKeyToNestedSegwitAddress(
  publicKey: Uint8Array,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  // SHA256 -> RIPEMD160 of public key
  const sha = sha256(publicKey)
  const pubKeyHash = ripemd160(sha)

  // Create witness script: OP_0 <20-byte-pubkey-hash>
  const witnessScript = new Uint8Array([0x00, 0x14, ...pubKeyHash])

  // Hash the witness script
  const scriptSha = sha256(witnessScript)
  const scriptHash = ripemd160(scriptSha)

  // Add P2SH prefix
  const prefix = network === 'mainnet' ? 0x05 : 0xc4
  const prefixed = new Uint8Array([prefix, ...scriptHash])

  // Double SHA256 checksum
  const checksum = sha256(sha256(prefixed)).slice(0, 4)
  const full = new Uint8Array([...prefixed, ...checksum])

  return base58Encode(full)
}

/**
 * 从公钥生成比特币 P2WPKH 地址 (Native SegWit - BIP84)
 * Addresses start with 'bc1q' on mainnet
 */
export function publicKeyToNativeSegwitAddress(
  publicKey: Uint8Array,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  // SHA256 -> RIPEMD160 of public key
  const sha = sha256(publicKey)
  const pubKeyHash = ripemd160(sha)

  // Bech32 encode with witness version 0
  const hrp = network === 'mainnet' ? 'bc' : 'tb'
  return bech32Encode(hrp, 0, pubKeyHash)
}

/**
 * 从公钥生成比特币 P2TR 地址 (Taproot - BIP86)
 * Addresses start with 'bc1p' on mainnet
 * Note: This is a simplified implementation that uses key-path only
 */
export function publicKeyToTaprootAddress(
  publicKey: Uint8Array,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  // For Taproot, we need to convert to x-only public key (32 bytes)
  // and apply the taproot tweak
  const xOnlyPubKey = publicKey.length === 33 ? publicKey.slice(1) : publicKey.slice(1, 33)

  // Apply taproot tweak (BIP341)
  // tweakedPubKey = pubKey + hash_tag("TapTweak", pubKey) * G
  // For simplicity, we use the key-path-only approach without script tree
  // TODO: Full taproot implementation requires computing the tweak:
  // const tagHash = sha256(new TextEncoder().encode('TapTweak'))
  // const tweakHash = sha256(new Uint8Array([...tagHash, ...tagHash, ...xOnlyPubKey]))
  // This is a simplified version - full implementation needs secp256k1 point operations

  // Bech32m encode with witness version 1
  const hrp = network === 'mainnet' ? 'bc' : 'tb'
  return bech32mEncode(hrp, 1, xOnlyPubKey)
}

/**
 * 从私钥生成 Tron 地址
 */
export function privateKeyToTronAddress(privateKey: Uint8Array): string {
  // 与以太坊类似，但前缀是 0x41
  const uncompressedPubKey = secp256k1.getPublicKey(privateKey, false)
  const pubKeyWithoutPrefix = uncompressedPubKey.slice(1)
  
  const hash = keccak_256(pubKeyWithoutPrefix)
  const addressBytes = hash.slice(-20)
  
  // 添加 Tron 前缀 0x41
  const prefixed = new Uint8Array([0x41, ...addressBytes])
  
  // 双 SHA256 校验和
  const checksum = sha256(sha256(prefixed)).slice(0, 4)
  const full = new Uint8Array([...prefixed, ...checksum])
  
  // Base58 编码
  return base58Encode(full)
}

// ==================== Base58 编码 ====================

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58Encode(bytes: Uint8Array): string {
  const digits = [0]

  for (const byte of bytes) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i]! << 8
      digits[i] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }

  // 处理前导零
  let result = ''
  for (const byte of bytes) {
    if (byte === 0) result += BASE58_ALPHABET[0]!
    else break
  }

  // 反转并转换
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]!]
  }

  return result
}

// ==================== Bech32/Bech32m 编码 ====================

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

const BECH32_GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

function bech32Polymod(values: number[]): number {
  let chk = 1
  for (const v of values) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) {
        chk ^= BECH32_GENERATOR[i]!
      }
    }
  }
  return chk
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = []
  for (const c of hrp) {
    ret.push(c.charCodeAt(0) >> 5)
  }
  ret.push(0)
  for (const c of hrp) {
    ret.push(c.charCodeAt(0) & 31)
  }
  return ret
}

function bech32CreateChecksum(hrp: string, data: number[], isBech32m: boolean): number[] {
  const values = [...bech32HrpExpand(hrp), ...data]
  // Bech32m uses 0x2bc830a3, Bech32 uses 1
  const constant = isBech32m ? 0x2bc830a3 : 1
  const polymod = bech32Polymod([...values, 0, 0, 0, 0, 0, 0]) ^ constant
  const ret: number[] = []
  for (let i = 0; i < 6; i++) {
    ret.push((polymod >> (5 * (5 - i))) & 31)
  }
  return ret
}

function convertBits(data: Uint8Array, fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0
  let bits = 0
  const ret: number[] = []
  const maxv = (1 << toBits) - 1

  for (const value of data) {
    acc = (acc << fromBits) | value
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxv)
    }
  }

  if (pad) {
    if (bits > 0) {
      ret.push((acc << (toBits - bits)) & maxv)
    }
  }

  return ret
}

/**
 * Bech32 编码 (用于 P2WPKH - witness version 0)
 */
function bech32Encode(hrp: string, witnessVersion: number, data: Uint8Array): string {
  const converted = convertBits(data, 8, 5, true)
  const combined = [witnessVersion, ...converted]
  const checksum = bech32CreateChecksum(hrp, combined, false)
  const encoded = [...combined, ...checksum].map((d) => BECH32_CHARSET[d]).join('')
  return `${hrp}1${encoded}`
}

/**
 * Bech32m 编码 (用于 P2TR - witness version 1+)
 */
function bech32mEncode(hrp: string, witnessVersion: number, data: Uint8Array): string {
  const converted = convertBits(data, 8, 5, true)
  const combined = [witnessVersion, ...converted]
  const checksum = bech32CreateChecksum(hrp, combined, true)
  const encoded = [...combined, ...checksum].map((d) => BECH32_CHARSET[d]).join('')
  return `${hrp}1${encoded}`
}

// ==================== 主要 API ====================

/**
 * 从助记词派生指定链的密钥
 */
export function deriveKey(
  mnemonic: string,
  chain: ChainType,
  index = 0,
  account = 0
): DerivedKey {
  const hdKey = deriveHDKey(mnemonic)
  const path = getBIP44Path(chain, account, 0, index)
  const childKey = deriveChildKey(hdKey, path)

  if (!childKey.privateKey || !childKey.publicKey) {
    throw new Error('密钥派生失败')
  }

  const privateKey = bytesToHex(childKey.privateKey)
  const publicKey = bytesToHex(childKey.publicKey)

  let address: string
  switch (chain) {
    case 'ethereum':
      address = toChecksumAddress(privateKeyToEthereumAddress(childKey.privateKey))
      break
    case 'bitcoin':
      address = publicKeyToBitcoinAddress(childKey.publicKey)
      break
    case 'tron':
      address = privateKeyToTronAddress(childKey.privateKey)
      break
    case 'bfmeta':
      // BFMeta 使用与以太坊类似的地址格式
      address = toChecksumAddress(privateKeyToEthereumAddress(childKey.privateKey))
      break
    default:
      throw new Error(`不支持的链类型: ${chain}`)
  }

  return {
    privateKey,
    publicKey,
    address,
    path,
    chain,
  }
}

/**
 * 从助记词派生比特币密钥（支持多种 purpose）
 */
export function deriveBitcoinKey(
  mnemonic: string,
  purpose: BitcoinPurpose = 44,
  index = 0,
  account = 0,
  network: 'mainnet' | 'testnet' = 'mainnet'
): DerivedKey {
  const hdKey = deriveHDKey(mnemonic)
  const path = getBIPPath(purpose, COIN_TYPES.bitcoin, account, 0, index)
  const childKey = deriveChildKey(hdKey, path)

  if (!childKey.privateKey || !childKey.publicKey) {
    throw new Error('密钥派生失败')
  }

  const privateKey = bytesToHex(childKey.privateKey)
  const publicKey = bytesToHex(childKey.publicKey)

  let address: string
  switch (purpose) {
    case 44:
      address = publicKeyToBitcoinAddress(childKey.publicKey, network)
      break
    case 49:
      address = publicKeyToNestedSegwitAddress(childKey.publicKey, network)
      break
    case 84:
      address = publicKeyToNativeSegwitAddress(childKey.publicKey, network)
      break
    case 86:
      address = publicKeyToTaprootAddress(childKey.publicKey, network)
      break
    default:
      throw new Error(`不支持的 Bitcoin purpose: ${purpose}`)
  }

  return {
    privateKey,
    publicKey,
    address,
    path,
    chain: 'bitcoin',
    purpose,
  }
}

/**
 * 从助记词派生所有比特币地址（所有 purpose）
 */
export function deriveAllBitcoinKeys(
  mnemonic: string,
  index = 0,
  account = 0,
  network: 'mainnet' | 'testnet' = 'mainnet'
): DerivedKey[] {
  const purposes: BitcoinPurpose[] = [44, 49, 84, 86]
  return purposes.map((purpose) => deriveBitcoinKey(mnemonic, purpose, index, account, network))
}

/**
 * 从助记词派生多个链的密钥
 */
export function deriveMultiChainKeys(
  mnemonic: string,
  chains: ChainType[] = ['ethereum', 'bitcoin', 'tron'],
  index = 0
): DerivedKey[] {
  return chains.map((chain) => deriveKey(mnemonic, chain, index))
}

/**
 * 从助记词派生所有可能的地址（用于重复检测）
 * 包括：ETH、BFMeta、Tron、以及 Bitcoin 的所有 purpose
 */
export function deriveAllAddresses(
  mnemonic: string,
  index = 0,
  account = 0
): DerivedKey[] {
  const results: DerivedKey[] = []

  // Ethereum
  results.push(deriveKey(mnemonic, 'ethereum', index, account))

  // BFMeta
  results.push(deriveKey(mnemonic, 'bfmeta', index, account))

  // Tron
  results.push(deriveKey(mnemonic, 'tron', index, account))

  // Bitcoin (all purposes)
  results.push(...deriveAllBitcoinKeys(mnemonic, index, account))

  return results
}

/**
 * 验证地址格式
 */
export function isValidAddress(address: string, chain: ChainType): boolean {
  switch (chain) {
    case 'ethereum':
    case 'bfmeta':
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    case 'bitcoin':
      // Legacy (1...), Nested SegWit (3...), Native SegWit (bc1q...), Taproot (bc1p...)
      return (
        /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
        /^bc1q[a-z0-9]{38,}$/.test(address) ||
        /^bc1p[a-z0-9]{58}$/.test(address)
      )
    case 'tron':
      return /^T[a-zA-Z0-9]{33}$/.test(address)
    default:
      return false
  }
}
