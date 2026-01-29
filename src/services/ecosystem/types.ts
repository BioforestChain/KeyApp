/**
 * Bio Ecosystem Types
 *
 * 统一从 chain-adapter 导入交易相关类型
 */

// ===== 从 chain-adapter 导入核心类型 =====
export type {
  // 交易意图
  TransactionIntent,
  TransferIntent,
  DestroyIntent,
  SetPayPasswordIntent,
  ContractCallIntent,
  // 签名选项
  SignOptions,
  // 交易对象
  UnsignedTransaction,
  SignedTransaction,
  // 手续费
  Fee,
  FeeEstimate,
} from '@/services/chain-adapter';

// ===== Ecosystem 专用类型 =====

/** Account information */
export interface BioAccount {
  address: string;
  chain: string;
  name?: string;
  /** Public key (optional, for dweb-compat) */
  publicKey?: string;
}

/**
 * Ecosystem 转账参数（RPC 参数格式）
 *
 * 注意：这与 chain-adapter 的 TransferIntent 不同
 * - 这是 RPC 接收的参数格式（amount 是 string）
 * - TransferIntent 是内部使用的格式（amount 是 Amount）
 */
export interface EcosystemTransferParams {
  from: string;
  to: string;
  amount: string; // RPC 参数是字符串
  chain: string;
  asset?: string;
  /** 交易类型（默认 transfer） */
  type?: 'transfer' | 'destroy' | 'setPayPassword';
  /** 销毁资产接收方（资产发行者） */
  recipientId?: string;
  /** 代币合约地址（用于 EVM/TRON Token 转账） */
  tokenAddress?: string;
  /** 资产精度（用于 EVM/TRON Token 转账） */
  assetDecimals?: number;
  remark?: Record<string, string>;
}

/**
 * Ecosystem 销毁参数（RPC 参数格式）
 */
export interface EcosystemDestroyParams {
  from: string;
  amount: string;
  chain: string;
  asset: string;
}

/** Request message from miniapp */
export interface BioRequestMessage {
  type: 'bio_request';
  id: string;
  method: string;
  params?: unknown[];
}

/** Response message to miniapp */
export interface BioResponseMessage {
  type: 'bio_response';
  id: string;
  success: boolean;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

/** Event message to miniapp */
export interface BioEventMessage {
  type: 'bio_event';
  event: string;
  args: unknown[];
}

/** Miniapp category */
export type MiniappCategory =
  | 'defi' // DeFi 应用
  | 'nft' // NFT 相关
  | 'tools' // 工具类
  | 'games' // 游戏
  | 'social' // 社交
  | 'exchange' // 交易所
  | 'other'; // 其他

/** Miniapp target desktop page */
export type MiniappTargetDesktop = 'stack' | 'mine';

/** Permission definition (simplified - name/description now in i18n) */
export interface PermissionDefinition {
  risk: 'low' | 'medium' | 'high';
}

/**
 * Known permissions - risk level only
 * Name and description are now in i18n: ecosystem.json -> permissions.<id>.name/description
 */
export const KNOWN_PERMISSIONS: Record<string, { risk: 'low' | 'medium' | 'high' }> = {
  bio_requestAccounts: { risk: 'low' },
  bio_selectAccount: { risk: 'low' },
  bio_pickWallet: { risk: 'low' },
  bio_createTransaction: { risk: 'low' },
  bio_signMessage: { risk: 'medium' },
  bio_signTypedData: { risk: 'medium' },
  bio_signTransaction: { risk: 'high' },
  bio_sendTransaction: { risk: 'high' },
  bio_destroyAsset: { risk: 'high' },
  bio_requestCryptoToken: { risk: 'high' },
  bio_cryptoExecute: { risk: 'low' },
  bio_getCryptoTokenInfo: { risk: 'low' },
  // Additional permissions from permissions.ts
  bio_accounts: { risk: 'low' },
  bio_chainId: { risk: 'low' },
  bio_getBalance: { risk: 'low' },
};

/** Miniapp manifest - 完整的小程序元数据 */
export interface MiniappManifest {
  /** 唯一标识符 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 简短描述 */
  description: string;
  /** 详细介绍 (可选，支持 Markdown) */
  longDescription?: string;
  /** 应用图标 URL */
  icon: string;
  /** 应用入口 URL */
  url: string;
  /** 版本号 (semver) */
  version: string;
  /** 作者/开发者 */
  author?: string;
  /** 开发者网站 */
  website?: string;
  /** 分类 */
  category?: MiniappCategory;
  /** 标签 */
  tags?: string[];
  /** 请求的权限列表 */
  permissions?: string[];
  /** 支持的链 */
  chains?: string[];
  /** 截图 URL 列表 */
  screenshots?: string[];
  /** 最低钱包版本要求 */
  minWalletVersion?: string;
  /** 发布时间 */
  publishedAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 是否为测试版 */
  beta?: boolean;
  /** 推荐分（官方评分，0-100，可选） */
  officialScore?: number;
  /** 热门分（社区评分，0-100，可选） */
  communityScore?: number;
  /**
   * 启动屏配置
   * 如果配置了启动屏，小程序需要调用 bio.closeSplashScreen() 来关闭
   * 如果未配置，则使用 iframe load 事件自动关闭加载状态
   *
   * - 图标自动使用 manifest.icon
   * - 背景色自动使用 manifest.themeColor
   *
   * @example
   * // 简写形式
   * "splashScreen": true
   *
   * // 自定义超时
   * "splashScreen": { "timeout": 3000 }
   */
  splashScreen?:
    | true
    | {
        /** 最大等待时间 (ms)，超时后自动关闭启动屏，默认 5000 */
        timeout?: number;
      };
  /**
   * 胶囊主题（可选）
   * - 'auto': 跟随 KeyApp 主题（默认）
   * - 'dark': 强制深色胶囊
   * - 'light': 强制浅色胶囊
   */
  capsuleTheme?: 'auto' | 'dark' | 'light';

  /**
   * 目标桌面页（可选，默认 'stack'）
   * - 'stack': 渲染到应用堆栈页（stack slide）
   * - 'mine': 渲染到我的页（mine slide）
   */
  targetDesktop?: MiniappTargetDesktop;
  /**
   * 主题色 - 用于卡片背景等
   * 格式: CSS 渐变类名 (Tailwind) 或 HEX 颜色
   * 例: "from-violet-500 to-purple-600" 或 "#6366f1"
   */
  themeColor?: string;
  /**
   * 主题色（起始）- HEX 格式
   */
  themeColorFrom?: string;
  /**
   * 主题色（结束）- HEX 格式
   */
  themeColorTo?: string;

  // ============================================
  // 以下字段由 registry 在加载时自动填充
  // ============================================

  /** 来源 URL（运行时填充） */
  sourceUrl?: string;
  /** 来源图标（运行时填充） */
  sourceIcon?: string;
  /** 来源名称（运行时填充） */
  sourceName?: string;
  /** 运行时容器类型（由宿主注入，默认 'iframe'） */
  runtime?: 'iframe' | 'wujie';
  /** wujie 运行时配置 (仅当 runtime: 'wujie' 时有效) */
  wujieConfig?: WujieRuntimeConfig;
}

export interface WujieRuntimeConfig {
  rewriteAbsolutePaths?: boolean;
  alive?: boolean;
  fiber?: boolean;
  sync?: boolean;
}

/** Ecosystem source - JSON 文件格式 */
export interface EcosystemSource {
  name: string;
  version: string;
  updated: string;
  /** 订阅源图标 URL */
  icon?: string;
  /** 可选：远程搜索能力（固定 GET，使用 %s 替换 query） */
  search?: {
    urlTemplate: string;
  };
  apps: MiniappManifest[];
}

/** 订阅源记录 - 从 store 重新导出 */
export type { SourceRecord, SourceStatus } from '@/stores/ecosystem';

/**
 * My Apps - Local installed app record
 */
export interface MyAppRecord {
  appId: string;
  installedAt: number;
  lastUsedAt: number;
}

/** Method handler */
export type MethodHandler = (params: unknown, context: HandlerContext) => Promise<unknown>;

/** Handler context */
export interface HandlerContext {
  appId: string;
  appName: string;
  appIcon?: string;
  origin: string;
  permissions: string[];
}

/** Error codes */
export const BioErrorCodes = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  INTERNAL_ERROR: -32603,
  INVALID_PARAMS: -32602,
  METHOD_NOT_FOUND: -32601,
} as const;

/** Create error response */
export function createErrorResponse(id: string, code: number, message: string, data?: unknown): BioResponseMessage {
  return {
    type: 'bio_response',
    id,
    success: false,
    error: { code, message, data },
  };
}

/** Create success response */
export function createSuccessResponse(id: string, result: unknown): BioResponseMessage {
  return {
    type: 'bio_response',
    id,
    success: true,
    result,
  };
}
