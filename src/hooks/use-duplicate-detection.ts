import { useState, useCallback } from 'react';
import { generateAllAddresses, getAddressSet } from './use-multi-chain-address-generation';
import type { DuplicateCheckResult, IWalletQuery } from '@/services/wallet/types';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

export interface DuplicateDetectionResult {
  /** 检测结果 */
  result: DuplicateCheckResult;
  /** 是否正在检测 */
  isChecking: boolean;
  /** 错误信息 */
  error: string | null;
  /** 执行检测 */
  check: (mnemonic: string[]) => Promise<DuplicateCheckResult>;
  /** 重置状态 */
  reset: () => void;
}

const INITIAL_RESULT: DuplicateCheckResult = {
  isDuplicate: false,
  type: 'none',
};

/**
 * 三级重复检测 Hook
 *
 * Level 1: 简单地址查找 - 检查 BFMeta 地址是否已存在
 * Level 2: 多链地址生成 - 生成所有可能的地址并检查
 * Level 3: 私钥碰撞检查 - 检查是否与私钥导入的钱包冲突
 */
export function useDuplicateDetection(walletQuery: IWalletQuery): DuplicateDetectionResult {
  const [result, setResult] = useState<DuplicateCheckResult>(INITIAL_RESULT);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(
    async (mnemonic: string[]): Promise<DuplicateCheckResult> => {
      setIsChecking(true);
      setError(null);

      try {
        // Generate all addresses from mnemonic
        const derivedKeys = generateAllAddresses(mnemonic);
        const newAddressSet = getAddressSet(derivedKeys);

        // === Level 1: Simple address lookup ===
        const existingAddresses = await walletQuery.getAllAddresses();

        for (const existing of existingAddresses) {
          if (newAddressSet.has(existing.address.toLowerCase())) {
            const result: DuplicateCheckResult = {
              isDuplicate: true,
              type: 'address',
              matchedWallet: {
                id: existing.walletId,
                name: existing.walletName,
                importType: 'mnemonic', // Default, will be refined in Level 3
                matchedAddress: existing.address,
              },
            };
            setResult(result);
            return result;
          }
        }

        // === Level 2: Multi-chain address check ===
        // Already covered by Level 1 since we generate all addresses upfront

        // === Level 3: Private key collision check ===
        const allWallets = await walletQuery.getAllMainWallets();
        const privateKeyWallets = allWallets.filter((w) => w.importType === 'privateKey');

        for (const pkWallet of privateKeyWallets) {
          for (const pkAddr of pkWallet.addresses) {
            if (newAddressSet.has(pkAddr.address.toLowerCase())) {
              const result: DuplicateCheckResult = {
                isDuplicate: true,
                type: 'privateKey',
                matchedWallet: {
                  id: pkWallet.id,
                  name: pkWallet.name,
                  importType: 'privateKey',
                  matchedAddress: pkAddr.address,
                },
              };
              setResult(result);
              return result;
            }
          }
        }

        // No duplicate found
        const noMatch: DuplicateCheckResult = {
          isDuplicate: false,
          type: 'none',
        };
        setResult(noMatch);
        return noMatch;
      } catch (err) {
        const message = err instanceof Error ? err.message : t('error:duplicate.detectionFailed');
        setError(message);
        return INITIAL_RESULT;
      } finally {
        setIsChecking(false);
      }
    },
    [walletQuery],
  );

  const reset = useCallback(() => {
    setResult(INITIAL_RESULT);
    setError(null);
  }, []);

  return {
    result,
    isChecking,
    error,
    check,
    reset,
  };
}

/**
 * 同步重复检测（用于非 React 上下文）
 */
export async function checkDuplicates(mnemonic: string[], walletQuery: IWalletQuery): Promise<DuplicateCheckResult> {
  const derivedKeys = generateAllAddresses(mnemonic);
  const newAddressSet = getAddressSet(derivedKeys);

  // Level 1 & 2: Address check
  const existingAddresses = await walletQuery.getAllAddresses();
  for (const existing of existingAddresses) {
    if (newAddressSet.has(existing.address.toLowerCase())) {
      return {
        isDuplicate: true,
        type: 'address',
        matchedWallet: {
          id: existing.walletId,
          name: existing.walletName,
          importType: 'mnemonic',
          matchedAddress: existing.address,
        },
      };
    }
  }

  // Level 3: Private key collision
  const allWallets = await walletQuery.getAllMainWallets();
  const privateKeyWallets = allWallets.filter((w) => w.importType === 'privateKey');

  for (const pkWallet of privateKeyWallets) {
    for (const pkAddr of pkWallet.addresses) {
      if (newAddressSet.has(pkAddr.address.toLowerCase())) {
        return {
          isDuplicate: true,
          type: 'privateKey',
          matchedWallet: {
            id: pkWallet.id,
            name: pkWallet.name,
            importType: 'privateKey',
            matchedAddress: pkAddr.address,
          },
        };
      }
    }
  }

  return { isDuplicate: false, type: 'none' };
}
