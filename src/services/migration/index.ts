/**
 * 迁移服务
 */

export type {
  MigrationStatus,
  MpayDetectionResult,
  MpayWalletAppSettings,
  MpayMainWallet,
  MpayMainWalletAddressInfo,
  MpayChainAddressInfo,
  MpayAddressAsset,
  MigrationProgress,
  IMigrationService,
} from './types'

export {
  detectMpayData,
  readMpayWallets,
  readMpayAddresses,
  readMpaySettings,
  MPAY_IDB_NAME,
  MPAY_SETTINGS_KEY,
} from './mpay-reader'

export {
  decryptMpayData,
  verifyMpayPassword,
} from './mpay-crypto'

export {
  transformMpayData,
  mapChainName,
  type TransformResult,
} from './mpay-transformer'

export { migrationService } from './migration-service'
