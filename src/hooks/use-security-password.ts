/**
 * 安全密码 Hook
 *
 * 提供安全密码的查询、缓存、验证功能
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '@tanstack/react-store';
import { securityPasswordStore, securityPasswordActions, securityPasswordSelectors } from '@/stores/security-password';
import { getChainProvider } from '@/services/chain-adapter/providers';
import type { ChainConfig } from '@/services/chain-config';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

interface UseSecurityPasswordOptions {
  /** 链配置 */
  chainConfig: ChainConfig | null | undefined;
  /** 地址 */
  address: string | null | undefined;
  /** 是否自动加载 */
  autoLoad?: boolean;
}

interface UseSecurityPasswordResult {
  /** 安全密码公钥 */
  publicKey: string | null | undefined;
  /** 是否设置了安全密码 */
  hasSecurityPassword: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否已加载完成 */
  isLoaded: boolean;
  /** 错误信息 */
  error: string | null;
  /** 刷新（重新查询） */
  refresh: () => Promise<void>;
  /** 验证安全密码 */
  verify: (mainSecret: string, paySecret: string) => Promise<boolean>;
}

/**
 * 安全密码 Hook
 *
 * @example
 * ```tsx
 * const { hasSecurityPassword, verify, isLoading } = useSecurityPassword({
 *   chainConfig,
 *   address,
 * })
 *
 * // 签名前检查
 * if (hasSecurityPassword) {
 *   // 显示安全密码输入
 *   const isValid = await verify(mainSecret, paySecret)
 *   if (!isValid) {
 *     // 密码错误
 *   }
 * }
 * ```
 */
export function useSecurityPassword({
  chainConfig,
  address,
  autoLoad = true,
}: UseSecurityPasswordOptions): UseSecurityPasswordResult {
  const state = useStore(securityPasswordStore);

  const publicKey = useMemo(() => {
    if (!address) return undefined;
    return securityPasswordSelectors.getPublicKey(state, address);
  }, [state, address]);

  const hasSecurityPassword = useMemo(() => {
    if (!address) return false;
    return securityPasswordSelectors.hasSecurityPassword(state, address);
  }, [state, address]);

  const isLoading = useMemo(() => {
    if (!address) return false;
    return securityPasswordSelectors.isLoading(state, address);
  }, [state, address]);

  const isLoaded = useMemo(() => {
    if (!address) return false;
    return securityPasswordSelectors.isLoaded(state, address);
  }, [state, address]);

  const error = useMemo(() => {
    if (!address) return null;
    return securityPasswordSelectors.getError(state, address);
  }, [state, address]);

  // 查询安全密码公钥
  const refresh = useCallback(async () => {
    if (!chainConfig || !address) return;

    const provider = getChainProvider(chainConfig.id);
    if (!provider.supportsBioAccountInfo) {
      securityPasswordActions.setError(address, t('error:chain.notSupportSecurityPassword'));
      return;
    }

    securityPasswordActions.setLoading(address, true);

    try {
      const info = await provider.bioGetAccountInfo!(address);
      securityPasswordActions.setPublicKey(address, info.secondPublicKey ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error:query.failed');
      securityPasswordActions.setError(address, message);
    }
  }, [chainConfig, address]);

  // 验证安全密码
  const verify = useCallback(
    async (mainSecret: string, paySecret: string): Promise<boolean> => {
      if (!chainConfig || !publicKey) return false;

      const provider = getChainProvider(chainConfig.id);
      if (!provider.bioVerifyPayPassword) return false;

      try {
        return await provider.bioVerifyPayPassword({
          mainSecret,
          paySecret,
          publicKey,
        });
      } catch {
        return false;
      }
    },
    [chainConfig, publicKey],
  );

  // 自动加载
  useEffect(() => {
    if (autoLoad && chainConfig && address && !isLoaded && !isLoading) {
      refresh();
    }
  }, [autoLoad, chainConfig, address, isLoaded, isLoading, refresh]);

  return {
    publicKey,
    hasSecurityPassword,
    isLoading,
    isLoaded,
    error,
    refresh,
    verify,
  };
}

/**
 * 实时验证安全密码 Hook
 *
 * 用于输入时实时验证安全密码是否正确
 */
export function useSecurityPasswordValidation({
  chainConfig,
  publicKey,
  mainSecret,
  paySecret,
  debounceMs = 300,
}: {
  chainConfig: ChainConfig | null | undefined;
  publicKey: string | null | undefined;
  mainSecret: string;
  paySecret: string;
  debounceMs?: number;
}) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!chainConfig || !publicKey || !mainSecret || !paySecret) {
      setIsValid(null);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(async () => {
      try {
        const provider = getChainProvider(chainConfig.id);
        if (!provider.bioVerifyPayPassword) {
          setIsValid(false);
          return;
        }
        const result = await provider.bioVerifyPayPassword({
          mainSecret,
          paySecret,
          publicKey,
        });
        setIsValid(result);
      } catch {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [chainConfig, publicKey, mainSecret, paySecret, debounceMs]);

  return { isValid, isValidating };
}
