/**
 * 权限控制模块
 * 管理小程序的权限请求和检查
 */

import { ecosystemStore, ecosystemSelectors, ecosystemActions } from '@/stores/ecosystem'

/** 敏感方法列表（需要用户确认） */
export const SENSITIVE_METHODS = [
  'bio_signMessage',
  'bio_signTypedData',
  'bio_sendTransaction',
] as const

/** 所有可授权的方法 */
export const ALL_PERMISSIONS = [
  'bio_requestAccounts',
  'bio_accounts',
  'bio_selectAccount',
  'bio_pickWallet',
  'bio_chainId',
  'bio_getBalance',
  ...SENSITIVE_METHODS,
] as const

export type Permission = (typeof ALL_PERMISSIONS)[number]
export type SensitiveMethod = (typeof SENSITIVE_METHODS)[number]

/**
 * 检查方法是否为敏感方法
 */
export function isSensitiveMethod(method: string): method is SensitiveMethod {
  return SENSITIVE_METHODS.includes(method as SensitiveMethod)
}

/**
 * 检查应用是否有指定权限
 */
export function hasPermission(appId: string, permission: string): boolean {
  // 非敏感方法默认允许
  if (!isSensitiveMethod(permission)) {
    return true
  }
  return ecosystemSelectors.hasPermission(ecosystemStore.state, appId, permission)
}

/**
 * 检查应用是否有所有指定权限
 */
export function hasAllPermissions(appId: string, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(appId, p))
}

/**
 * 获取应用已授权的权限
 */
export function getGrantedPermissions(appId: string): string[] {
  return ecosystemSelectors.getGrantedPermissions(ecosystemStore.state, appId)
}

/**
 * 获取应用缺失的权限
 */
export function getMissingPermissions(appId: string, requested: string[]): string[] {
  return requested.filter((p) => !hasPermission(appId, p))
}

/**
 * 授予权限
 */
export function grantPermissions(appId: string, permissions: string[]): void {
  ecosystemActions.grantPermissions(appId, permissions)
}

/**
 * 撤销权限
 */
export function revokePermissions(appId: string, permissions?: string[]): void {
  ecosystemActions.revokePermissions(appId, permissions)
}

/**
 * 获取权限的显示信息
 */
export function getPermissionInfo(permission: string): {
  label: string
  description: string
  sensitive: boolean
} {
  const info: Record<string, { label: string; description: string }> = {
    bio_requestAccounts: {
      label: '查看账户',
      description: '查看您的钱包地址',
    },
    bio_accounts: {
      label: '获取账户',
      description: '获取已连接的账户列表',
    },
    bio_selectAccount: {
      label: '选择账户',
      description: '选择要使用的账户',
    },
    bio_pickWallet: {
      label: '选择钱包',
      description: '选择目标钱包地址',
    },
    bio_chainId: {
      label: '获取链 ID',
      description: '获取当前区块链网络',
    },
    bio_getBalance: {
      label: '查询余额',
      description: '查询账户余额',
    },
    bio_signMessage: {
      label: '签名消息',
      description: '请求签名消息（需要您确认）',
    },
    bio_signTypedData: {
      label: '签名数据',
      description: '请求签名结构化数据（需要您确认）',
    },
    bio_sendTransaction: {
      label: '发送交易',
      description: '请求发送转账（需要您确认）',
    },
  }

  const defaultInfo = {
    label: permission,
    description: '未知权限',
  }

  return {
    ...(info[permission] ?? defaultInfo),
    sensitive: isSensitiveMethod(permission),
  }
}
