import jsQR from 'jsqr'

/** QR 内容类型 */
export type QRContentType = 'address' | 'payment' | 'deeplink' | 'unknown'

/** 解析后的地址信息 */
export interface ParsedAddress {
  type: 'address'
  chain: 'ethereum' | 'bitcoin' | 'tron' | 'unknown'
  address: string
}

/** 解析后的支付请求 */
export interface ParsedPayment {
  type: 'payment'
  chain: 'ethereum' | 'bitcoin' | 'tron'
  address: string
  /** Wei/Satoshi 单位的金额 */
  amount?: string | undefined
  /** 合约调用数据 (仅 ethereum) */
  data?: string | undefined
  /** 代币合约地址 */
  token?: string | undefined
  /** Gas limit */
  gasLimit?: string | undefined
  /** Gas price */
  gasPrice?: string | undefined
  /** 链 ID */
  chainId?: number | undefined
}

/** 解析后的深度链接 */
export interface ParsedDeepLink {
  type: 'deeplink'
  /** 路由路径 */
  path: string
  /** 查询参数 */
  params: Record<string, string>
  /** 原始内容 */
  raw: string
}

/** 未知内容 */
export interface ParsedUnknown {
  type: 'unknown'
  content: string
}

export type ParsedQRContent = ParsedAddress | ParsedPayment | ParsedDeepLink | ParsedUnknown

/** 以太坊地址正则 (0x + 40 hex chars) */
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

/** 比特币地址正则 (支持 legacy, segwit, native segwit) */
const BTC_ADDRESS_REGEX = /^(1[a-zA-HJ-NP-Z1-9]{25,34}|3[a-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$/

/** Tron 地址正则 (T + 33 base58 chars) */
const TRON_ADDRESS_REGEX = /^T[a-zA-HJ-NP-Z1-9]{33}$/

/**
 * 检测纯地址字符串的链类型
 */
export function detectAddressChain(address: string): 'ethereum' | 'bitcoin' | 'tron' | 'unknown' {
  if (ETH_ADDRESS_REGEX.test(address)) return 'ethereum'
  if (BTC_ADDRESS_REGEX.test(address)) return 'bitcoin'
  if (TRON_ADDRESS_REGEX.test(address)) return 'tron'
  return 'unknown'
}

/**
 * 解析 ethereum: URI
 * 格式: ethereum:0x...?value=...&data=...&gasLimit=...&gasPrice=...&chainId=...
 * EIP-681: https://eips.ethereum.org/EIPS/eip-681
 */
function parseEthereumURI(uri: string): ParsedAddress | ParsedPayment {
  const stripped = uri.replace('ethereum:', '')
  const queryIndex = stripped.indexOf('?')
  const path = queryIndex >= 0 ? stripped.slice(0, queryIndex) : stripped
  const query = queryIndex >= 0 ? stripped.slice(queryIndex + 1) : ''

  // 去除 chain_id 和 function_name
  const addressPart = path.split('/')[0] ?? ''
  const address = addressPart.split('@')[0] ?? ''

  if (!query) {
    return { type: 'address', chain: 'ethereum', address }
  }

  const params = new URLSearchParams(query)
  const amount = params.get('value') ?? undefined
  const data = params.get('data') ?? undefined
  const gasLimit = params.get('gasLimit') ?? params.get('gas') ?? undefined
  const gasPrice = params.get('gasPrice') ?? undefined
  const chainIdStr = params.get('chainId')
  const chainId = chainIdStr ? parseInt(chainIdStr, 10) : undefined

  // 如果有支付参数，返回 payment 类型
  if (amount || data) {
    return {
      type: 'payment',
      chain: 'ethereum',
      address,
      amount,
      data,
      gasLimit,
      gasPrice,
      chainId,
    }
  }

  return { type: 'address', chain: 'ethereum', address }
}

/**
 * 解析 bitcoin: URI
 * 格式: bitcoin:address?amount=...&label=...&message=...
 * BIP-21: https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
 */
function parseBitcoinURI(uri: string): ParsedAddress | ParsedPayment {
  const stripped = uri.replace('bitcoin:', '')
  const queryIndex = stripped.indexOf('?')
  const address = queryIndex >= 0 ? stripped.slice(0, queryIndex) : stripped
  const query = queryIndex >= 0 ? stripped.slice(queryIndex + 1) : ''

  if (!query) {
    return { type: 'address', chain: 'bitcoin', address }
  }

  const params = new URLSearchParams(query)
  const amountBTC = params.get('amount')

  if (amountBTC) {
    // 转换 BTC 到 Satoshi
    const satoshi = Math.round(parseFloat(amountBTC) * 1e8).toString()
    return {
      type: 'payment',
      chain: 'bitcoin',
      address,
      amount: satoshi,
    }
  }

  return { type: 'address', chain: 'bitcoin', address }
}

/**
 * 解析 tron: URI (非标准，但某些钱包使用)
 */
function parseTronURI(uri: string): ParsedAddress | ParsedPayment {
  const stripped = uri.replace('tron:', '')
  const queryIndex = stripped.indexOf('?')
  const address = queryIndex >= 0 ? stripped.slice(0, queryIndex) : stripped
  const query = queryIndex >= 0 ? stripped.slice(queryIndex + 1) : ''

  if (!query) {
    return { type: 'address', chain: 'tron', address }
  }

  const params = new URLSearchParams(query)
  const amount = params.get('amount') ?? params.get('value') ?? undefined

  if (amount) {
    return {
      type: 'payment',
      chain: 'tron',
      address,
      amount,
    }
  }

  return { type: 'address', chain: 'tron', address }
}

/**
 * 解析深度链接（hash 路由格式）
 * 支持格式：
 * - #/authorize/address?eventId=...&type=...
 * - #/authorize/signature?eventId=...
 * - #/send?address=...
 * - 完整 URL 带 hash: https://app.example.com/#/authorize/address?...
 */
function parseDeepLink(content: string): ParsedDeepLink | null {
  let hashPart = content
  
  // 如果是完整 URL，提取 hash 部分
  if (content.startsWith('http://') || content.startsWith('https://')) {
    const hashIndex = content.indexOf('#')
    if (hashIndex === -1) return null
    hashPart = content.slice(hashIndex)
  }
  
  // 必须以 #/ 开头
  if (!hashPart.startsWith('#/')) return null
  
  const inner = hashPart.slice(1) // 去掉 #
  const queryIndex = inner.indexOf('?')
  const path = queryIndex >= 0 ? inner.slice(0, queryIndex) : inner
  const queryString = queryIndex >= 0 ? inner.slice(queryIndex + 1) : ''
  
  // 解析查询参数
  const params: Record<string, string> = {}
  if (queryString) {
    const searchParams = new URLSearchParams(queryString)
    for (const [key, value] of searchParams) {
      params[key] = value
    }
  }
  
  return {
    type: 'deeplink',
    path,
    params,
    raw: content,
  }
}

/**
 * 解析 QR 码内容
 */
export function parseQRContent(content: string): ParsedQRContent {
  const trimmed = content.trim()

  // 带协议前缀的 URI
  if (trimmed.startsWith('ethereum:')) {
    return parseEthereumURI(trimmed)
  }

  if (trimmed.startsWith('bitcoin:')) {
    return parseBitcoinURI(trimmed)
  }

  if (trimmed.startsWith('tron:')) {
    return parseTronURI(trimmed)
  }

  // 深度链接（hash 路由格式）
  if (trimmed.startsWith('#/') || (trimmed.startsWith('http') && trimmed.includes('#/'))) {
    const deepLink = parseDeepLink(trimmed)
    if (deepLink) return deepLink
  }

  // 纯地址字符串
  const chain = detectAddressChain(trimmed)
  if (chain !== 'unknown') {
    return { type: 'address', chain, address: trimmed }
  }

  // 无法识别的内容
  return { type: 'unknown', content: trimmed }
}

/**
 * 从 ImageData 扫描 QR 码
 */
export function scanQRFromImageData(imageData: ImageData): string | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height)
  return result?.data ?? null
}

/**
 * 从 Canvas 扫描 QR 码
 */
export function scanQRFromCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return scanQRFromImageData(imageData)
}

/**
 * 从 Video 元素扫描 QR 码
 * @param video 视频元素
 * @param canvas 可选的 canvas 用于复用
 */
export function scanQRFromVideo(
  video: HTMLVideoElement,
  canvas?: HTMLCanvasElement | undefined
): string | null {
  const width = video.videoWidth
  const height = video.videoHeight

  if (width === 0 || height === 0) return null

  // 使用传入的 canvas 或创建新的
  const cvs = canvas ?? document.createElement('canvas')
  cvs.width = width
  cvs.height = height

  const ctx = cvs.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(video, 0, 0, width, height)
  return scanQRFromCanvas(cvs)
}

/**
 * 从图片文件扫描 QR 码
 */
export async function scanQRFromFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        resolve(null)
        return
      }

      ctx.drawImage(img, 0, 0)
      const result = scanQRFromCanvas(canvas)
      URL.revokeObjectURL(url)
      resolve(result)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}
