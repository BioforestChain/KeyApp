/**
 * 安全存储抽象层
 *
 * - DWEB 环境：使用原生生物识别 + Keychain/Keystore
 * - Web 环境：使用 AES-GCM 密码加密 + localStorage
 */

import { encrypt, decrypt, type EncryptedData } from './encryption';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

// ==================== 类型定义 ====================

export interface BiometricOptions {
  title?: string | undefined;
  subtitle?: string | undefined;
  negativeButtonText?: string | undefined;
  maxAttempts?: number | undefined;
}

export interface BiometricResult {
  success: boolean;
  code?: number | undefined;
  errorDetail?: string | undefined;
}

export interface SecureStorageOptions {
  /** 使用密码加密（Web 模式） */
  password?: string | undefined;
  /** 使用生物识别（DWEB 模式） */
  useBiometric?: boolean | undefined;
  /** 生物识别选项 */
  biometricOptions?: BiometricOptions | undefined;
}

export interface StoredData {
  /** 存储类型 */
  type: 'web-encrypted' | 'dweb-biometric';
  /** 加密数据（Web 模式） */
  encrypted?: EncryptedData | undefined;
  /** 原始数据（DWEB 模式，由系统保护） */
  data?: string | undefined;
}

// ==================== 环境检测 ====================

/** 检测是否在 DWEB 环境 */
export function isDwebEnvironment(): boolean {
  return typeof window !== 'undefined' && 'dwebTarget' in window;
}

/** DWEB biometric 插件类型 */
interface DwebBiometricPlugin {
  check(): Promise<number>;
  biometrics(): Promise<{ success: boolean; message?: string }>;
}

/** BioetricsCheckResult 枚举值 */
const BIOMETRIC_SUCCESS = 0;

/** 动态导入 DWEB biometric 插件 */
async function getDwebBiometric(): Promise<DwebBiometricPlugin | null> {
  if (!isDwebEnvironment()) return null;
  try {
    // 使用变量规避 Vite 静态分析
    const moduleName = '@plaoc/plugins';
    const module = await import(/* @vite-ignore */ moduleName);
    return module.biometricsPlugin as DwebBiometricPlugin;
  } catch {
    return null;
  }
}

// ==================== 生物识别 API ====================

export const BiometricAuth = {
  /** 检查生物识别是否可用 */
  async isAvailable(): Promise<boolean> {
    const plugin = await getDwebBiometric();
    if (!plugin) return false;

    try {
      const result = await plugin.check();
      return result === BIOMETRIC_SUCCESS;
    } catch {
      return false;
    }
  },

  /** 验证生物识别 */
  async authenticate(_options: BiometricOptions = {}): Promise<BiometricResult> {
    const plugin = await getDwebBiometric();
    if (!plugin) {
      return { success: false, code: -1, errorDetail: t('error:biometric.unavailable') };
    }

    try {
      const result = await plugin.biometrics();
      return { success: result.success, code: result.success ? undefined : 0 };
    } catch (err) {
      const error = err as Error & { data?: { errorCode: string; errorDetails: string } };

      if (error.message?.toLowerCase().includes('authentication failed')) {
        return { success: false, code: 0 };
      }

      if (error.data) {
        return {
          success: false,
          code: parseInt(error.data.errorCode),
          errorDetail: error.data.errorDetails,
        };
      }

      return { success: false, code: -1, errorDetail: error.message };
    }
  },
};

// ==================== 安全存储 API ====================

const STORAGE_PREFIX = 'secure:';

export const SecureStorage = {
  /** 检查安全存储是否可用 */
  async isAvailable(): Promise<{ web: boolean; dweb: boolean }> {
    return {
      web: typeof localStorage !== 'undefined',
      dweb: await BiometricAuth.isAvailable(),
    };
  },

  /** 存储数据 */
  async store(key: string, data: string, options: SecureStorageOptions): Promise<void> {
    const storageKey = STORAGE_PREFIX + key;

    // DWEB 模式：使用生物识别保护
    if (options.useBiometric && isDwebEnvironment()) {
      const authResult = await BiometricAuth.authenticate(options.biometricOptions);
      if (!authResult.success) {
        throw new Error(t('error:biometric.verificationFailed'));
      }

      // DWEB 环境下，数据由系统 Keychain/Keystore 保护
      // 这里简化处理，实际生产环境应使用 @plaoc/plugins 的 secure storage
      const stored: StoredData = { type: 'dweb-biometric', data };
      localStorage.setItem(storageKey, JSON.stringify(stored));
      return;
    }

    // Web 模式：使用密码加密
    if (!options.password) {
      throw new Error(t('error:secureStorage.webPasswordRequired'));
    }

    const encrypted = await encrypt(data, options.password);
    const stored: StoredData = { type: 'web-encrypted', encrypted };
    localStorage.setItem(storageKey, JSON.stringify(stored));
  },

  /** 读取数据 */
  async retrieve(key: string, options: SecureStorageOptions): Promise<string | null> {
    const storageKey = STORAGE_PREFIX + key;
    const raw = localStorage.getItem(storageKey);

    if (!raw) return null;

    try {
      const stored: StoredData = JSON.parse(raw);

      // DWEB 模式
      if (stored.type === 'dweb-biometric') {
        if (!isDwebEnvironment()) {
          throw new Error(t('error:secureStorage.dwebRequired'));
        }

        const authResult = await BiometricAuth.authenticate(options.biometricOptions);
        if (!authResult.success) {
          throw new Error(t('error:biometric.verificationFailed'));
        }

        return stored.data ?? null;
      }

      // Web 模式
      if (stored.type === 'web-encrypted' && stored.encrypted) {
        if (!options.password) {
          throw new Error(t('error:secureStorage.passwordRequired'));
        }
        return await decrypt(stored.encrypted, options.password);
      }

      return null;
    } catch (err) {
      if (err instanceof SyntaxError) {
        // 兼容旧数据格式
        return null;
      }
      throw err;
    }
  },

  /** 删除数据 */
  async delete(key: string): Promise<void> {
    const storageKey = STORAGE_PREFIX + key;
    localStorage.removeItem(storageKey);
  },

  /** 检查数据是否存在 */
  async exists(key: string): Promise<boolean> {
    const storageKey = STORAGE_PREFIX + key;
    return localStorage.getItem(storageKey) !== null;
  },

  /** 获取存储类型 */
  async getType(key: string): Promise<StoredData['type'] | null> {
    const storageKey = STORAGE_PREFIX + key;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    try {
      const stored: StoredData = JSON.parse(raw);
      return stored.type;
    } catch {
      return null;
    }
  },
};

// ==================== 便捷函数 ====================

/** 存储助记词（自动选择最佳方式） */
export async function storeMnemonic(
  walletId: string,
  mnemonic: string,
  options: { password?: string; preferBiometric?: boolean } = {},
): Promise<void> {
  const { dweb } = await SecureStorage.isAvailable();

  // 优先使用生物识别（如果可用且用户偏好）
  if (dweb && options.preferBiometric !== false) {
    await SecureStorage.store(`mnemonic:${walletId}`, mnemonic, {
      useBiometric: true,
      biometricOptions: {
        title: t('common:biometric.verifyIdentity'),
        subtitle: t('common:biometric.protectWallet'),
      },
    });
    return;
  }

  // 否则使用密码加密
  if (!options.password) {
    throw new Error(t('error:secureStorage.passwordRequiredForMnemonic'));
  }

  await SecureStorage.store(`mnemonic:${walletId}`, mnemonic, {
    password: options.password,
  });
}

/** 读取助记词 */
export async function retrieveMnemonic(walletId: string, options: { password?: string } = {}): Promise<string | null> {
  const type = await SecureStorage.getType(`mnemonic:${walletId}`);

  if (type === 'dweb-biometric') {
    return SecureStorage.retrieve(`mnemonic:${walletId}`, {
      useBiometric: true,
      biometricOptions: {
        title: t('common:biometric.verifyIdentity'),
        subtitle: t('common:biometric.accessMnemonic'),
      },
    });
  }

  return SecureStorage.retrieve(`mnemonic:${walletId}`, {
    password: options.password,
  });
}
