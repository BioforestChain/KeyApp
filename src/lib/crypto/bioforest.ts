/**
 * BioForestChain 密钥派生模块
 * 
 * 与 BIP39/BIP44 不同，BioForest 链使用:
 * - 任意字符串作为密钥种子（不限于助记词）
 * - SHA256 哈希生成 32 字节 seed
 * - Ed25519 曲线生成密钥对
 * - SHA256 → RIPEMD160 → Base58Check(hash160) → bnid 前缀字符（b/c）
 * 
 * 支持的链：BFMeta, CCChain, PMChain, BFChainV2, BTGMeta, BIWMeta, ETHMeta, Malibu
 */

import { ed25519 } from '@noble/curves/ed25519.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import type { ChainConfig } from '@/services/chain-config'

// ==================== 工具函数 ====================

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

export { bytesToHex, hexToBytes }

// ==================== 类型定义 ====================

export type BioforestChainType = 
  | 'bfmeta'
  | 'ccchain'
  | 'pmchain'
  | 'bfchainv2'
  | 'btgmeta'
  | 'biwmeta'
  | 'ethmeta'
  | 'malibu'

export interface BioforestKeypair {
  /** 私钥 (64 bytes - Ed25519 extended secret key) */
  secretKey: Uint8Array
  /** 公钥 (32 bytes) */
  publicKey: Uint8Array
}

export interface BioforestDerivedKey {
  /** 私钥 (hex) */
  privateKey: string
  /** 公钥 (hex) */
  publicKey: string
  /** 地址 */
  address: string
  /** 链类型 */
  chain: BioforestChainType
}

export interface BioforestChainConfig {
  /** 地址前缀 */
  prefix: string
  /** 精度 */
  decimals: number
  /** 代币符号 */
  symbol: string
  /** 链显示名称 */
  name: string
}

// ==================== 链配置 ====================

export const BIOFOREST_CHAINS: Record<BioforestChainType, BioforestChainConfig> = {
  bfmeta: { prefix: 'b', decimals: 8, symbol: 'BFM', name: 'BFMeta' },
  ccchain: { prefix: 'b', decimals: 8, symbol: 'CCC', name: 'CCChain' },
  pmchain: { prefix: 'b', decimals: 8, symbol: 'PMC', name: 'PMChain' },
  bfchainv2: { prefix: 'b', decimals: 8, symbol: 'BFT', name: 'BFChain V2' },
  btgmeta: { prefix: 'b', decimals: 8, symbol: 'BTGM', name: 'BTGMeta' },
  biwmeta: { prefix: 'b', decimals: 8, symbol: 'BIW', name: 'BIWMeta' },
  ethmeta: { prefix: 'b', decimals: 8, symbol: 'ETHM', name: 'ETHMeta' },
  malibu: { prefix: 'b', decimals: 8, symbol: 'MLB', name: 'Malibu' },
}

export function isBioforestChainConfig(
  config: ChainConfig,
): config is ChainConfig & { type: 'bioforest' } {
  return config.type === 'bioforest'
}

export function toBioforestChainConfig(config: ChainConfig): BioforestChainConfig {
  if (!isBioforestChainConfig(config)) {
    throw new Error(`Not a supported BioForest chain config: ${config.id}`)
  }

  const fallbackPrefix = isBioforestChain(config.id) ? BIOFOREST_CHAINS[config.id].prefix : 'b'
  return {
    prefix: config.prefix ?? fallbackPrefix,
    decimals: config.decimals,
    symbol: config.symbol,
    name: config.name,
  }
}

export type BioforestDerivedKeyFromChainConfig = Omit<BioforestDerivedKey, 'chain'> & { chain: string }

export function deriveBioforestKeyFromChainConfig(secret: string, config: ChainConfig): BioforestDerivedKeyFromChainConfig {
  if (!isBioforestChainConfig(config)) {
    throw new Error(`Unsupported BioForest chain: ${config.id}`)
  }

  const chainConfig = toBioforestChainConfig(config)
  const keypair = createBioforestKeypair(secret)
  const address = publicKeyToBioforestAddress(keypair.publicKey, chainConfig.prefix)

  return {
    privateKey: bytesToHex(keypair.secretKey),
    publicKey: bytesToHex(keypair.publicKey),
    address,
    chain: config.id,
  }
}

export function deriveBioforestAddressesFromChainConfigs(
  secret: string,
  configs: readonly ChainConfig[],
): Array<{ chainId: string; address: string; publicKey: string }> {
  const keypair = createBioforestKeypair(secret)
  const publicKeyHex = bytesToHex(keypair.publicKey)

  return configs.filter(isBioforestChainConfig).map((config) => ({
    chainId: config.id,
    address: publicKeyToBioforestAddress(keypair.publicKey, config.prefix ?? 'b'),
    publicKey: publicKeyHex,
  }))
}

/**
 * Derive Bioforest addresses from an enabled chain-config set (preferred),
 * with a backward-compatible fallback to built-in Bioforest chain definitions.
 *
 * Note: Passing an empty array means "no enabled bioforest chains" and MUST NOT fallback.
 */
export function deriveBioforestAddresses(
  secret: string,
  chainConfigs?: readonly ChainConfig[] | null,
): Array<{ chainId: string; address: string }> {
  if (chainConfigs === undefined || chainConfigs === null) {
    return deriveBioforestMultiChainKeys(secret, getBioforestChains()).map((key) => ({
      chainId: key.chain,
      address: key.address,
    }))
  }

  return deriveBioforestAddressesFromChainConfigs(secret, chainConfigs).map(({ chainId, address }) => ({
    chainId,
    address,
  }))
}

// ==================== Base58 编码 ====================

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Base58 编码
 */
export function base58Encode(bytes: Uint8Array): string {
  const digits: number[] = [0]

  for (const byte of bytes) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i]! << 8
      digits[i] = carry % 58
      carry = Math.floor(carry / 58)
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = Math.floor(carry / 58)
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

/**
 * Base58 解码
 */
export function base58Decode(str: string): Uint8Array {
  const bytes: number[] = [0]

  for (const char of str) {
    const value = BASE58_ALPHABET.indexOf(char)
    if (value === -1) throw new Error(`Invalid Base58 character: ${char}`)

    let carry = value
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i]! * 58
      bytes[i] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }

  // 处理前导 '1'
  for (const char of str) {
    if (char === BASE58_ALPHABET[0]) bytes.push(0)
    else break
  }

  return new Uint8Array(bytes.reverse())
}

// ==================== Base58Check 编码 ====================

/**
 * Base58Check 编码：payload + 4 字节校验和（double-SHA256）
 */
export function base58CheckEncode(payload: Uint8Array): string {
  const checksum = sha256(sha256(payload)).slice(0, 4)
  const full = new Uint8Array(payload.length + checksum.length)
  full.set(payload, 0)
  full.set(checksum, payload.length)
  return base58Encode(full)
}

/**
 * Base58Check 解码（不抛错）：校验和通过则返回 payload，否则返回 undefined
 */
export function base58CheckDecodeUnsafe(str: string): Uint8Array | undefined {
  let decoded: Uint8Array
  try {
    decoded = base58Decode(str)
  } catch {
    return undefined
  }

  if (decoded.length < 5) return undefined

  const payload = decoded.slice(0, -4)
  const checksum = decoded.slice(-4)
  const expected = sha256(sha256(payload)).slice(0, 4)

  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expected[i]) return undefined
  }

  return payload
}

/**
 * Base58Check 解码（严格）：校验和失败会抛错
 */
export function base58CheckDecode(str: string): Uint8Array {
  const payload = base58CheckDecodeUnsafe(str)
  if (!payload) throw new Error('Invalid checksum')
  return payload
}

// ==================== 核心密钥派生 ====================

/**
 * 从任意字符串创建 Ed25519 密钥对
 * 
 * 算法: secret → SHA256 → 32字节 seed → Ed25519 keypair
 * 
 * @param secret 任意字符串（可以是助记词、密码、或任何文本）
 * @returns Ed25519 密钥对
 */
export function createBioforestKeypair(secret: string): BioforestKeypair {
  // 将字符串转为 UTF-8 字节
  const encoder = new TextEncoder()
  const secretBytes = encoder.encode(secret)
  
  // SHA256 哈希生成 32 字节 seed
  const seed = sha256(secretBytes)
  
  // 使用 Ed25519 从 seed 生成密钥对
  // @noble/curves ed25519 使用 32 字节私钥，自动扩展为 64 字节
  const privateKey = seed
  const publicKey = ed25519.getPublicKey(privateKey)
  
  // Ed25519 扩展私钥 = seed (32 bytes) + publicKey (32 bytes)
  const secretKey = new Uint8Array(64)
  secretKey.set(seed, 0)
  secretKey.set(publicKey, 32)
  
  return {
    secretKey,
    publicKey,
  }
}

/**
 * 从私钥（hex）重建密钥对
 */
export function keypairFromSecretKey(secretKeyHex: string): BioforestKeypair {
  const secretKey = hexToBytes(secretKeyHex)
  
  if (secretKey.length === 64) {
    // 完整的 64 字节扩展私钥
    const publicKey = secretKey.slice(32)
    return { secretKey, publicKey }
  } else if (secretKey.length === 32) {
    // 32 字节 seed，需要派生公钥
    const publicKey = ed25519.getPublicKey(secretKey)
    const fullSecretKey = new Uint8Array(64)
    fullSecretKey.set(secretKey, 0)
    fullSecretKey.set(publicKey, 32)
    return { secretKey: fullSecretKey, publicKey }
  } else {
    throw new Error(`Invalid secret key length: ${secretKey.length}`)
  }
}

// ==================== 地址生成 ====================

/**
 * 从公钥生成 BioForest 地址
 * 
 * 算法: publicKey → SHA256 → RIPEMD160 → Base58Check(hash160) → prefix + address
 * 
 * @param publicKey 32 字节公钥
 * @param prefix 地址前缀（默认 'b'，即生产 walletapi bnid）
 * @returns BioForest 地址
 */
export function publicKeyToBioforestAddress(
  publicKey: Uint8Array,
  prefix = 'b'
): string {
  const hash160 = ripemd160(sha256(publicKey))
  return prefix + base58CheckEncode(hash160)
}

/**
 * 从私钥生成 BioForest 地址
 */
export function privateKeyToBioforestAddress(
  privateKey: Uint8Array,
  prefix = 'b'
): string {
  const publicKey = ed25519.getPublicKey(privateKey.slice(0, 32))
  return publicKeyToBioforestAddress(publicKey, prefix)
}

// ==================== 地址验证 ====================

/**
 * 验证 BioForest 地址格式
 */
export function isValidBioforestAddress(
  address: string,
  chain?: BioforestChainType
): boolean {
  if (typeof address !== 'string' || address.length < 2) {
    return false
  }
  
  // 检查前缀
  const prefix = address[0]
  if (chain) {
    const config = BIOFOREST_CHAINS[chain]
    if (prefix !== config.prefix) return false
  }

  const tail = address.slice(1)
  const payload = base58CheckDecodeUnsafe(tail)
  if (payload) {
    // hash160 payload length
    return payload.length === 20
  }

  // Legacy: `c + base58(hash160)` (no checksum) — keep display/import compatibility.
  if (prefix !== 'c') return false

  try {
    return base58Decode(tail).length === 20
  } catch {
    return false
  }
}

// ==================== 签名 ====================

/**
 * 对消息进行签名
 * 
 * @param message 消息（字符串或字节数组）
 * @param secretKey 私钥
 * @returns 签名 (64 bytes)
 */
export function signMessage(
  message: string | Uint8Array,
  secretKey: Uint8Array
): Uint8Array {
  // 消息先 SHA256 哈希
  const msgBytes = typeof message === 'string' 
    ? new TextEncoder().encode(message) 
    : message
  const hash = sha256(msgBytes)
  
  // Ed25519 签名
  const privateKey = secretKey.slice(0, 32)
  return ed25519.sign(hash, privateKey)
}

/**
 * 验证签名
 */
export function verifySignature(
  message: string | Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  const msgBytes = typeof message === 'string'
    ? new TextEncoder().encode(message)
    : message
  const hash = sha256(msgBytes)
  
  return ed25519.verify(signature, hash, publicKey)
}

// ==================== 主要 API ====================

/**
 * 从任意字符串派生指定 BioForest 链的密钥
 * 
 * @param secret 任意字符串
 * @param chain BioForest 链类型
 * @returns 派生的密钥信息
 */
export function deriveBioforestKey(
  secret: string,
  chain: BioforestChainType
): BioforestDerivedKey {
  const config = BIOFOREST_CHAINS[chain]
  if (!config) {
    throw new Error(`Unsupported BioForest chain: ${chain}`)
  }
  
  const keypair = createBioforestKeypair(secret)
  const address = publicKeyToBioforestAddress(keypair.publicKey, config.prefix)
  
  return {
    privateKey: bytesToHex(keypair.secretKey),
    publicKey: bytesToHex(keypair.publicKey),
    address,
    chain,
  }
}

/**
 * 从任意字符串派生多个 BioForest 链的密钥
 * 
 * 注意：所有 BioForest 链使用相同的密钥，只是地址前缀可能不同
 */
export function deriveBioforestMultiChainKeys(
  secret: string,
  chains: BioforestChainType[] = ['bfmeta', 'pmchain', 'ccchain']
): BioforestDerivedKey[] {
  return chains.map(chain => deriveBioforestKey(secret, chain))
}

/**
 * 判断是否为 BioForest 链
 */
export function isBioforestChain(chain: string): chain is BioforestChainType {
  return chain in BIOFOREST_CHAINS
}

/**
 * 获取所有支持的 BioForest 链列表
 */
export function getBioforestChains(): BioforestChainType[] {
  return Object.keys(BIOFOREST_CHAINS) as BioforestChainType[]
}

/**
 * 获取链配置
 */
export function getBioforestChainConfig(chain: BioforestChainType): BioforestChainConfig {
  const config = BIOFOREST_CHAINS[chain]
  if (!config) {
    throw new Error(`Unsupported BioForest chain: ${chain}`)
  }
  return config
}
