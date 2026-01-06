import { z } from 'zod'

/**
 * Wallet Storage Zod Schemas
 * 用于验证从 IndexedDB 读取的数据
 * 使用 passthrough() 允许多余字段，保证向前兼容
 */

/** 加密数据 schema */
const EncryptedDataSchema = z.object({
  salt: z.string(),
  iv: z.string(),
  ciphertext: z.string(),
}).passthrough()

/** 资产信息 schema */
export const AssetInfoSchema = z.object({
  assetType: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  balance: z.string().default('0'),
  contractAddress: z.string().optional(),
  logoUrl: z.string().optional(),
}).passthrough()

/** 链地址信息 schema */
export const ChainAddressInfoSchema = z.object({
  addressKey: z.string(),
  walletId: z.string(),
  chain: z.string(),
  address: z.string(),
  publicKey: z.string().optional(),
  encryptedPrivateKey: EncryptedDataSchema.optional(),
  derivationPath: z.string().optional(),
  assets: z.array(AssetInfoSchema).default([]),
  isCustomAssets: z.boolean().default(false),
  isFrozen: z.boolean().default(false),
}).passthrough()

/** 钱包信息 schema */
export const WalletInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  keyType: z.enum(['mnemonic', 'arbitrary', 'privateKey']),
  primaryChain: z.string(),
  primaryAddress: z.string(),
  encryptedMnemonic: EncryptedDataSchema.optional(),
  encryptedWalletLock: EncryptedDataSchema.optional(),
  isBackedUp: z.boolean().default(false),
  themeHue: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough()

/** 钱包用户信息 schema */
export const WalleterInfoSchema = z.object({
  name: z.string(),
  passwordTips: z.string().optional(),
  activeWalletId: z.string().nullable(),
  biometricEnabled: z.boolean().default(false),
  walletLockEnabled: z.boolean().default(true),
  agreementAccepted: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough()

/** 存储元数据 schema */
export const StorageMetadataSchema = z.object({
  version: z.number(),
  createdAt: z.number(),
  lastMigratedAt: z.number().optional(),
}).passthrough()

/** 地址簿条目 schema */
export const AddressBookEntrySchema = z.object({
  id: z.string(),
  chain: z.string(),
  address: z.string(),
  name: z.string(),
  note: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough()
