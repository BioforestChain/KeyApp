/**
 * Bio Ecosystem Types
 */

/** Account information */
export interface BioAccount {
  address: string
  chain: string
  name?: string
}

/** Transfer parameters */
export interface TransferParams {
  from: string
  to: string
  amount: string
  chain: string
  asset?: string
}

/** Request message from miniapp */
export interface BioRequestMessage {
  type: 'bio_request'
  id: string
  method: string
  params?: unknown[]
}

/** Response message to miniapp */
export interface BioResponseMessage {
  type: 'bio_response'
  id: string
  success: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** Event message to miniapp */
export interface BioEventMessage {
  type: 'bio_event'
  event: string
  args: unknown[]
}

/** Miniapp category */
export type MiniappCategory = 
  | 'defi'      // DeFi 应用
  | 'nft'       // NFT 相关
  | 'tools'     // 工具类
  | 'games'     // 游戏
  | 'social'    // 社交
  | 'exchange'  // 交易所
  | 'other'     // 其他

/** Permission definition */
export interface PermissionDefinition {
  id: string
  name: string
  description: string
  risk: 'low' | 'medium' | 'high'
}

/** Known permissions */
export const KNOWN_PERMISSIONS: Record<string, PermissionDefinition> = {
  bio_requestAccounts: {
    id: 'bio_requestAccounts',
    name: '请求账户',
    description: '获取您的钱包地址列表',
    risk: 'low',
  },
  bio_selectAccount: {
    id: 'bio_selectAccount',
    name: '选择账户',
    description: '让您选择一个账户',
    risk: 'low',
  },
  bio_pickWallet: {
    id: 'bio_pickWallet',
    name: '选择钱包',
    description: '让您选择一个钱包',
    risk: 'low',
  },
  bio_signMessage: {
    id: 'bio_signMessage',
    name: '签名消息',
    description: '使用您的私钥签名消息（需要您确认）',
    risk: 'medium',
  },
  bio_sendTransaction: {
    id: 'bio_sendTransaction',
    name: '发送交易',
    description: '请求发送转账（需要您确认）',
    risk: 'high',
  },
}

/** Miniapp manifest - 完整的小程序元数据 */
export interface MiniappManifest {
  /** 唯一标识符 */
  id: string
  /** 显示名称 */
  name: string
  /** 简短描述 */
  description: string
  /** 详细介绍 (可选，支持 Markdown) */
  longDescription?: string
  /** 应用图标 URL */
  icon: string
  /** 应用入口 URL */
  url: string
  /** 版本号 (semver) */
  version: string
  /** 作者/开发者 */
  author?: string
  /** 开发者网站 */
  website?: string
  /** 分类 */
  category?: MiniappCategory
  /** 标签 */
  tags?: string[]
  /** 请求的权限列表 */
  permissions?: string[]
  /** 支持的链 */
  chains?: string[]
  /** 截图 URL 列表 */
  screenshots?: string[]
  /** 最低钱包版本要求 */
  minWalletVersion?: string
  /** 发布时间 */
  publishedAt?: string
  /** 更新时间 */
  updatedAt?: string
  /** 是否为测试版 */
  beta?: boolean
  /**
   * 启动屏配置
   * 如果配置了启动屏，小程序需要调用 bio.closeSplashScreen() 来关闭
   * 如果未配置，则使用 iframe load 事件自动关闭加载状态
   */
  splashScreen?: {
    /** 启动屏背景色 (CSS 颜色值) */
    backgroundColor?: string
    /** 启动屏图标 URL (默认使用 app.icon) */
    icon?: string
    /** 最大等待时间 (ms)，超时后自动关闭启动屏，默认 5000 */
    timeout?: number
  }
  /** 
   * 主题色 - 用于卡片背景等 
   * 格式: CSS 渐变类名 (Tailwind) 或 HEX 颜色
   * 例: "from-violet-500 to-purple-600" 或 "#6366f1"
   */
  themeColor?: string
  /**
   * 主题色（起始）- HEX 格式
   */
  themeColorFrom?: string
  /**
   * 主题色（结束）- HEX 格式
   */
  themeColorTo?: string
  
  // ============================================
  // 以下字段由 registry 在加载时自动填充
  // ============================================
  
  /** 来源 URL（运行时填充） */
  sourceUrl?: string
  /** 来源图标（运行时填充） */
  sourceIcon?: string
  /** 来源名称（运行时填充） */
  sourceName?: string
}

/** Ecosystem source - JSON 文件格式 */
export interface EcosystemSource {
  name: string
  version: string
  updated: string
  /** 订阅源图标 URL */
  icon?: string
  apps: MiniappManifest[]
}

/** 订阅源记录 - 本地存储格式 */
export interface SourceRecord {
  url: string
  name: string
  enabled: boolean
  /** 图标 URL，默认使用 https 锁图标 */
  icon?: string
  /** 是否为内置源 */
  builtin?: boolean
}

/** Method handler */
export type MethodHandler = (
  params: unknown,
  context: HandlerContext
) => Promise<unknown>

/** Handler context */
export interface HandlerContext {
  appId: string
  origin: string
  permissions: string[]
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
} as const

/** Create error response */
export function createErrorResponse(
  id: string,
  code: number,
  message: string,
  data?: unknown
): BioResponseMessage {
  return {
    type: 'bio_response',
    id,
    success: false,
    error: { code, message, data },
  }
}

/** Create success response */
export function createSuccessResponse(id: string, result: unknown): BioResponseMessage {
  return {
    type: 'bio_response',
    id,
    success: true,
    result,
  }
}
