/**
 * 密码加密模块 - 使用 AES-GCM + PBKDF2
 * 
 * 安全设计：
 * 1. PBKDF2 从密码派生密钥（防止暴力破解）
 * 2. AES-256-GCM 加密数据（认证加密）
 * 3. 随机 salt 和 iv（防止彩虹表攻击）
 */

const PBKDF2_ITERATIONS = 100000
const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_LENGTH = 256

interface EncryptedData {
  /** Base64 编码的密文 */
  ciphertext: string
  /** Base64 编码的 salt */
  salt: string
  /** Base64 编码的 iv */
  iv: string
  /** 迭代次数 */
  iterations: number
}

/**
 * 从密码派生加密密钥
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // 导入密码作为原始密钥
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // 使用 PBKDF2 派生 AES 密钥
  // 注意：直接传 Uint8Array，避免 .buffer 在不同 Node.js 版本的兼容问题
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 加密数据
 * @param plaintext 明文
 * @param password 密码
 * @returns 加密后的数据对象
 */
export async function encrypt(
  plaintext: string,
  password: string
): Promise<EncryptedData> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // 生成随机 salt 和 iv
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  // 派生密钥
  const key = await deriveKey(password, salt)

  // AES-GCM 加密
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    iterations: PBKDF2_ITERATIONS,
  }
}

/**
 * 解密数据
 * @param encrypted 加密数据对象
 * @param password 密码
 * @returns 解密后的明文
 * @throws 密码错误时抛出异常
 */
export async function decrypt(
  encrypted: EncryptedData,
  password: string
): Promise<string> {
  const salt = base64ToUint8Array(encrypted.salt)
  const iv = base64ToUint8Array(encrypted.iv)
  const ciphertext = base64ToUint8Array(encrypted.ciphertext)

  // 派生密钥
  const key = await deriveKey(password, salt)

  try {
    // AES-GCM 解密
    // 注意：直接传 Uint8Array，避免 .buffer 在不同 Node.js 版本的兼容问题
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )

    const decoder = new TextDecoder()
    return decoder.decode(plaintext)
  } catch {
    throw new Error('解密失败：密码错误或数据损坏')
  }
}

/**
 * 验证密码是否正确（尝试解密）
 */
export async function verifyPassword(
  encrypted: EncryptedData,
  password: string
): Promise<boolean> {
  try {
    await decrypt(encrypted, password)
    return true
  } catch {
    return false
  }
}

// 工具函数：ArrayBuffer 转 Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

// 工具函数：Base64 转 Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// 导出类型
export type { EncryptedData }
