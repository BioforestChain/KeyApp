/**
 * ScannerJob validators - 扫码验证器
 */

import type { ParsedQRContent } from '@/lib/qr-parser'

/** 验证器类型 */
export type ScanValidator = (content: string, parsed: ParsedQRContent) => true | string

/** 预设验证器 */
export const scanValidators = {
  ethereumAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address' && parsed.chain === 'ethereum') return true
    if (parsed.type === 'payment' && parsed.chain === 'ethereum') return true
    if (parsed.type === 'unknown' && /^0x[a-fA-F0-9]{40}$/.test(parsed.content)) return true
    return 'invalidEthereumAddress'
  },
  
  bitcoinAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address' && parsed.chain === 'bitcoin') return true
    if (parsed.type === 'payment' && parsed.chain === 'bitcoin') return true
    return 'invalidBitcoinAddress'
  },
  
  tronAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address' && parsed.chain === 'tron') return true
    if (parsed.type === 'payment' && parsed.chain === 'tron') return true
    if (parsed.type === 'unknown' && /^T[a-zA-HJ-NP-Z1-9]{33}$/.test(parsed.content)) return true
    return 'invalidTronAddress'
  },
  
  anyAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address') return true
    if (parsed.type === 'payment') return true
    if (parsed.type === 'unknown' && parsed.content.length >= 26 && parsed.content.length <= 64) return true
    return 'invalidAddress'
  },
  
  any: (): true => true,
}

/** 根据链类型获取验证器 */
export function getValidatorForChain(chainType?: string): ScanValidator {
  switch (chainType?.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      return scanValidators.ethereumAddress
    case 'bitcoin':
    case 'btc':
      return scanValidators.bitcoinAddress
    case 'tron':
    case 'trx':
      return scanValidators.tronAddress
    default:
      return scanValidators.anyAddress
  }
}

/** 扫描结果事件 */
export interface ScannerResultEvent {
  content: string
  parsed: ParsedQRContent
}

/** 设置扫描结果回调 */
let scannerResultCallback: ((result: ScannerResultEvent) => void) | null = null

export function setScannerResultCallback(callback: ((result: ScannerResultEvent) => void) | null) {
  scannerResultCallback = callback
}

export function getScannerResultCallback() {
  return scannerResultCallback
}
