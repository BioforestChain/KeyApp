/**
 * Platform Services 统一导出
 * 
 * 架构说明：
 * - 每个服务独立文件夹 (biometric/, clipboard/, toast/, etc.)
 * - 每个文件夹包含: types.ts, web.ts, dweb.ts, mock.ts, index.ts
 * - 通过 Vite alias 在编译时选择实现
 * 
 * 构建命令：
 * - pnpm dev          → web 实现
 * - pnpm dev:mock     → mock 实现  
 * - pnpm build:web    → 只打包 web 实现
 * - pnpm build:dweb   → 只打包 dweb 实现
 */

// ==================== Biometric ====================
export type {
  BiometricType,
  BiometricAvailability,
  BiometricVerifyOptions,
  BiometricVerifyResult,
  IBiometricService,
} from './biometric'
export { biometricService } from './biometric'

// ==================== Clipboard ====================
export type { IClipboardService } from './clipboard'
export { clipboardService } from './clipboard'

// ==================== Toast ====================
export type { ToastPosition, ToastOptions, IToastService } from './toast'
export { toastService } from './toast'

// ==================== Haptics ====================
export type { HapticType, IHapticsService } from './haptics'
export { hapticsService } from './haptics'

// ==================== Storage ====================
export type { ISecureStorageService } from './storage'
export { secureStorageService } from './storage'

// ==================== Camera ====================
export type { ScanResult, ICameraService } from './camera'
export { cameraService } from './camera'

// ==================== Hooks ====================
export {
  useBiometric,
  useClipboard,
  useToast,
  useHaptics,
  useSecureStorage,
  useCamera,
} from './hooks'

// ==================== Legacy (兼容) ====================
// 保留旧的 context 导出，便于渐进式迁移
export { ServiceProvider, useServices } from './context'
export type { IServices, Platform } from './types'

// ==================== Authorize (DWEB/Plaoc) ====================
// Interface stub - implementation blocked pending DWEB runtime
export type {
  IPlaocAdapter,
  AddressAuthType,
  AddressAuthRequest,
  AddressAuthResponse,
  SignatureType,
  TransferPayload,
  MessagePayload,
  SignatureRequest,
} from './authorize'
export { createPlaocAdapter, isPlaocAvailable, plaocAdapter } from './authorize'

// ==================== Currency Exchange ====================
export type {
  ICurrencyExchangeService,
  ExchangeRateResponse,
  FrankfurterApiResponse,
} from './currency-exchange'
export { currencyExchangeService } from './currency-exchange'

// ==================== Staking ====================
export type {
  IStakingService,
  IStakingMockController,
  RechargeConfig,
  StakingTransaction,
  StakingOverviewItem,
  MintRequest,
  BurnRequest,
  LogoUrlMap,
} from './staking'
export { stakingService } from './staking'

// ==================== Transaction ====================
export type {
  ITransactionService,
  ITransactionMockController,
  TransactionRecord,
  TransactionFilter,
  TransactionType,
  TransactionStatus,
} from './transaction'
export { transactionService } from './transaction'

// ==================== Mock DevTools (仅开发模式) ====================
export { MockDevTools, clearLogs } from './mock-devtools'
