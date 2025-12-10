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
  const address = hash.slice(-20)
  
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
    if (parseInt(hash[i], 16) >= 8) {
      checksumAddress += addr[i].toUpperCase()
    } else {
      checksumAddress += addr[i]
    }
  }
  
  return checksumAddress
}

/**
 * 从公钥生成比特币地址 (P2PKH, Legacy)
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
      carry += digits[i] << 8
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
    if (byte === 0) result += BASE58_ALPHABET[0]
    else break
  }
  
  // 反转并转换
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]]
  }
  
  return result
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
 * 验证地址格式
 */
export function isValidAddress(address: string, chain: ChainType): boolean {
  switch (chain) {
    case 'ethereum':
    case 'bfmeta':
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    case 'bitcoin':
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
    case 'tron':
      return /^T[a-zA-Z0-9]{33}$/.test(address)
    default:
      return false
  }
}
