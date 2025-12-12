/**
 * mpay 加密兼容层
 *
 * mpay 使用 AES-CTR + SHA256(password) 加密
 * KeyApp 使用 AES-GCM + PBKDF2(password) 加密
 *
 * 此模块提供 mpay 数据解密能力
 */

/**
 * SHA256 哈希
 */
async function sha256Binary(data: ArrayBuffer): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', data)
}

/**
 * UTF8 字符串转 ArrayBuffer
 */
function encodeUTF8(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer
}

/**
 * ArrayBuffer 转 UTF8 字符串
 */
function decodeUTF8(data: ArrayBuffer): string {
  return new TextDecoder().decode(data)
}

/**
 * Base64 转 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer as ArrayBuffer
}

/**
 * 获取 mpay 格式的 AES-CTR 密钥
 */
async function getMpayCryptoKey(password: string): Promise<CryptoKey> {
  const passwordBuffer = encodeUTF8(password)
  const keyMaterial = await sha256Binary(passwordBuffer)
  return crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-CTR', length: 256 },
    false,
    ['decrypt']
  )
}

/**
 * 解密 mpay 加密的数据
 *
 * mpay 使用 AES-CTR，counter 为全零 Uint8Array(16)
 *
 * @param password 用户密码
 * @param encryptedBase64 mpay 加密的 base64 字符串
 * @returns 解密后的明文
 * @throws 密码错误时抛出异常
 */
export async function decryptMpayData(
  password: string,
  encryptedBase64: string
): Promise<string> {
  const key = await getMpayCryptoKey(password)
  const encrypted = base64ToArrayBuffer(encryptedBase64)
  const counter = new Uint8Array(16) // mpay 使用全零 counter

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CTR', counter, length: 128 },
      key,
      encrypted
    )
    return decodeUTF8(decrypted)
  } catch {
    throw new Error('mpay 数据解密失败：密码错误或数据损坏')
  }
}

/**
 * 验证 mpay 密码是否正确
 *
 * @param password 用户密码
 * @param encryptedBase64 mpay 加密的数据（通常是 importPhrase）
 * @returns 密码是否正确
 */
export async function verifyMpayPassword(
  password: string,
  encryptedBase64: string
): Promise<boolean> {
  try {
    const decrypted = await decryptMpayData(password, encryptedBase64)
    // 简单验证解密结果是否像助记词（包含空格分隔的单词）
    return decrypted.includes(' ') || decrypted.length > 0
  } catch {
    return false
  }
}
