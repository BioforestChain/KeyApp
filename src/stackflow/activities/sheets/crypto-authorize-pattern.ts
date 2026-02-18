import { walletStorageService } from '@/services/wallet-storage'

export async function verifyCryptoAuthorizePattern(walletId: string | undefined, patternKey: string): Promise<boolean> {
  if (!walletId) return false
  try {
    await walletStorageService.getMnemonic(walletId, patternKey)
    return true
  } catch {
    return false
  }
}
