/**
 * 权限控制模块
 * 管理小程序的权限请求和检查
 */

import { ecosystemStore, ecosystemSelectors, ecosystemActions } from '@/stores/ecosystem';
import i18n from '@/i18n';

/** 敏感方法列表（需要用户确认） */
export const SENSITIVE_METHODS = [
  'bio_requestAccounts',
  'bio_signMessage',
  'bio_signTypedData',
  'bio_signTransaction',
  'bio_sendTransaction',
] as const;

/** 所有可授权的方法 */
export const ALL_PERMISSIONS = [
  'bio_requestAccounts',
  'bio_accounts',
  'bio_selectAccount',
  'bio_pickWallet',
  'bio_chainId',
  'bio_getBalance',
  'bio_createTransaction',
  ...SENSITIVE_METHODS,
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];
export type SensitiveMethod = (typeof SENSITIVE_METHODS)[number];

/**
 * 检查方法是否为敏感方法
 */
export function isSensitiveMethod(method: string): method is SensitiveMethod {
  return SENSITIVE_METHODS.includes(method as SensitiveMethod);
}

/**
 * 检查应用是否有指定权限
 */
export function hasPermission(appId: string, permission: string): boolean {
  // 非敏感方法默认允许
  if (!isSensitiveMethod(permission)) {
    return true;
  }
  return ecosystemSelectors.hasPermission(ecosystemStore.state, appId, permission);
}

/**
 * 检查应用是否有所有指定权限
 */
export function hasAllPermissions(appId: string, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(appId, p));
}

/**
 * 获取应用已授权的权限
 */
export function getGrantedPermissions(appId: string): string[] {
  return ecosystemSelectors.getGrantedPermissions(ecosystemStore.state, appId);
}

/**
 * 获取应用缺失的权限
 */
export function getMissingPermissions(appId: string, requested: string[]): string[] {
  return requested.filter((p) => !hasPermission(appId, p));
}

/**
 * 授予权限
 */
export function grantPermissions(appId: string, permissions: string[]): void {
  ecosystemActions.grantPermissions(appId, permissions);
}

/**
 * 撤销权限
 */
export function revokePermissions(appId: string, permissions?: string[]): void {
  ecosystemActions.revokePermissions(appId, permissions);
}

/**
 * 获取权限的显示信息（已翻译）
 *
 * 直接返回当前语言的翻译文本
 *
 * @example
 * const info = getPermissionInfo('bio_requestAccounts')
 * // info.label = '请求账户' (zh-CN) / 'Request Accounts' (en)
 */
export function getPermissionInfo(permission: string): {
  label: string;
  description: string;
  sensitive: boolean;
} {
  const t = i18n.t.bind(i18n);

  // Check if this permission has i18n definition
  const knownPermissions = [
    'bio_requestAccounts',
    'bio_accounts',
    'bio_selectAccount',
    'bio_pickWallet',
    'bio_chainId',
    'bio_getBalance',
    'bio_createTransaction',
    'bio_signMessage',
    'bio_signTypedData',
    'bio_signTransaction',
    'bio_sendTransaction',
    'bio_destroyAsset',
    'bio_requestCryptoToken',
    'bio_cryptoExecute',
    'bio_getCryptoTokenInfo',
  ];

  const isKnown = knownPermissions.includes(permission);

  return {
    label: isKnown ? t(`ecosystem:permissions.${permission}.name`) : permission,
    description: isKnown
      ? t(`ecosystem:permissions.${permission}.description`)
      : t('ecosystem:permissions.defaultDescription'),
    sensitive: isSensitiveMethod(permission),
  };
}
