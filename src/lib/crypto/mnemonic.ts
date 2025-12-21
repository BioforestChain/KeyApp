import * as bip39 from 'bip39'

export type MnemonicStrength = 128 | 256 // 12 words | 24 words

/**
 * 生成助记词
 * @param strength 128 = 12 words, 256 = 24 words
 */
export function generateMnemonic(strength: MnemonicStrength = 128): string[] {
  const mnemonic = bip39.generateMnemonic(strength)
  return mnemonic.split(' ')
}

/**
 * 验证助记词是否有效
 */
export function validateMnemonic(words: string[]): boolean {
  const mnemonic = words.join(' ').toLowerCase().trim()
  return getAllWordLists().some((list) => bip39.validateMnemonic(mnemonic, list))
}

/**
 * 从助记词生成种子
 */
export async function mnemonicToSeed(
  words: string[],
  password?: string
): Promise<Uint8Array> {
  const mnemonic = words.join(' ').toLowerCase().trim()
  const seed = await bip39.mnemonicToSeed(mnemonic, password)
  return new Uint8Array(seed)
}

/**
 * 获取 BIP39 单词表（用于自动补全）
 */
export function getWordList(): string[] {
  return bip39.wordlists.english!
}

/**
 * 检查单词是否在 BIP39 单词表中
 */
export function isValidWord(word: string): boolean {
  const normalized = word.toLowerCase()
  return getAllWordLists().some((list) => list.includes(normalized))
}

/**
 * 根据前缀搜索匹配的单词（用于自动补全）
 */
export function searchWords(prefix: string, limit = 5): string[] {
  if (!prefix) return []
  const lowerPrefix = prefix.toLowerCase()
  return bip39.wordlists.english!
    .filter((word) => word.startsWith(lowerPrefix))
    .slice(0, limit)
}

function getAllWordLists(): string[][] {
  return Object.values(bip39.wordlists).filter(
    (list): list is string[] => Array.isArray(list),
  )
}
