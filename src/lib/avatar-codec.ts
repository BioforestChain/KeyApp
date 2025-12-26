/**
 * Avataaars 编码/解码工具
 * 将 Avatar 配置压缩为 8 字符的 base64 字符串
 */

export const AVATAR_OPTIONS = {
  topType: [
    'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban',
    'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4',
    'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly',
    'LongHairCurvy', 'LongHairDreads', 'LongHairFrida', 'LongHairFro',
    'LongHairFroBand', 'LongHairNotTooLong', 'LongHairShavedSides',
    'LongHairMiaWallace', 'LongHairStraight', 'LongHairStraight2',
    'LongHairStraightStrand', 'ShortHairDreads01', 'ShortHairDreads02',
    'ShortHairFrizzle', 'ShortHairShaggyMullet', 'ShortHairShortCurly',
    'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved',
    'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart',
  ],
  hairColor: [
    'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown',
    'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray',
  ],
  accessoriesType: [
    'Blank', 'Kurt', 'Prescription01', 'Prescription02',
    'Round', 'Sunglasses', 'Wayfarers',
  ],
  facialHairType: [
    'Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic',
    'MoustacheFancy', 'MoustacheMagnum',
  ],
  facialHairColor: [
    'Auburn', 'Black', 'Blonde', 'BlondeGolden',
    'Brown', 'BrownDark', 'Platinum', 'Red',
  ],
  clotheType: [
    'BlazerShirt', 'BlazerSweater', 'CollarSweater',
    'GraphicShirt', 'Hoodie', 'Overall',
    'ShirtCrewNeck', 'ShirtScoopNeck', 'ShirtVNeck',
  ],
  clotheColor: [
    'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02',
    'Heather', 'PastelBlue', 'PastelGreen', 'PastelOrange',
    'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White',
  ],
  graphicType: [
    'Bat', 'Cumbia', 'Deer', 'Diamond', 'Hola',
    'Pizza', 'Resist', 'Selena', 'Bear', 'SkullOutline', 'Skull',
  ],
  eyeType: [
    'Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll',
    'Happy', 'Hearts', 'Side', 'Squint', 'Surprised',
    'Wink', 'WinkWacky',
  ],
  eyebrowType: [
    'Angry', 'AngryNatural', 'Default', 'DefaultNatural',
    'FlatNatural', 'RaisedExcited', 'RaisedExcitedNatural',
    'SadConcerned', 'SadConcernedNatural', 'UnibrowNatural',
    'UpDown', 'UpDownNatural',
  ],
  mouthType: [
    'Concerned', 'Default', 'Disbelief', 'Eating',
    'Grimace', 'Sad', 'ScreamOpen', 'Serious',
    'Smile', 'Tongue', 'Twinkle', 'Vomit',
  ],
  skinColor: [
    'Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black',
  ],
} as const

const BIT_WIDTHS = [6, 4, 3, 3, 3, 4, 4, 4, 4, 4, 4, 3] as const
const FIELD_ORDER = [
  'topType', 'hairColor', 'accessoriesType', 'facialHairType',
  'facialHairColor', 'clotheType', 'clotheColor', 'graphicType',
  'eyeType', 'eyebrowType', 'mouthType', 'skinColor',
] as const

export type AvatarConfig = {
  [K in keyof typeof AVATAR_OPTIONS]: (typeof AVATAR_OPTIONS)[K][number]
}

export function encodeAvatar(config: AvatarConfig): string {
  let bits = 0n
  let offset = 0

  for (let i = 0; i < FIELD_ORDER.length; i++) {
    const field = FIELD_ORDER[i]!
    const options = AVATAR_OPTIONS[field] as readonly string[]
    const value = config[field]
    const index = options.indexOf(value)
    const idx = index >= 0 ? index : 0

    bits |= BigInt(idx) << BigInt(offset)
    offset += BIT_WIDTHS[i]!
  }

  const bytes = new Uint8Array(6)
  for (let i = 0; i < 6; i++) {
    bytes[i] = Number((bits >> BigInt(i * 8)) & 0xffn)
  }

  return btoa(String.fromCharCode(...bytes))
}

export function decodeAvatar(encoded: string): AvatarConfig {
  try {
    const binary = atob(encoded)
    let bits = 0n

    for (let i = 0; i < binary.length && i < 6; i++) {
      bits |= BigInt(binary.charCodeAt(i)) << BigInt(i * 8)
    }

    const config: Record<string, string> = {}
    let offset = 0

    for (let i = 0; i < FIELD_ORDER.length; i++) {
      const field = FIELD_ORDER[i]!
      const width = BIT_WIDTHS[i]!
      const mask = (1n << BigInt(width)) - 1n
      const index = Number((bits >> BigInt(offset)) & mask)
      const options = AVATAR_OPTIONS[field] as readonly string[]

      config[field] = options[index % options.length]!
      offset += width
    }

    return config as AvatarConfig
  } catch {
    return generateRandomAvatar()
  }
}

export function generateRandomAvatar(): AvatarConfig {
  const random = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)] as T

  return {
    topType: random(AVATAR_OPTIONS.topType),
    hairColor: random(AVATAR_OPTIONS.hairColor),
    accessoriesType: random(AVATAR_OPTIONS.accessoriesType),
    facialHairType: random(AVATAR_OPTIONS.facialHairType),
    facialHairColor: random(AVATAR_OPTIONS.facialHairColor),
    clotheType: random(AVATAR_OPTIONS.clotheType),
    clotheColor: random(AVATAR_OPTIONS.clotheColor),
    graphicType: random(AVATAR_OPTIONS.graphicType),
    eyeType: random(AVATAR_OPTIONS.eyeType),
    eyebrowType: random(AVATAR_OPTIONS.eyebrowType),
    mouthType: random(AVATAR_OPTIONS.mouthType),
    skinColor: random(AVATAR_OPTIONS.skinColor),
  }
}

export function generateAvatarFromSeed(seed: string): AvatarConfig {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }

  const pick = <T>(arr: readonly T[], offset: number): T => {
    const idx = Math.abs((hash + offset * 31) % arr.length)
    return arr[idx] as T
  }

  return {
    topType: pick(AVATAR_OPTIONS.topType, 0),
    hairColor: pick(AVATAR_OPTIONS.hairColor, 1),
    accessoriesType: pick(AVATAR_OPTIONS.accessoriesType, 2),
    facialHairType: pick(AVATAR_OPTIONS.facialHairType, 3),
    facialHairColor: pick(AVATAR_OPTIONS.facialHairColor, 4),
    clotheType: pick(AVATAR_OPTIONS.clotheType, 5),
    clotheColor: pick(AVATAR_OPTIONS.clotheColor, 6),
    graphicType: pick(AVATAR_OPTIONS.graphicType, 7),
    eyeType: pick(AVATAR_OPTIONS.eyeType, 8),
    eyebrowType: pick(AVATAR_OPTIONS.eyebrowType, 9),
    mouthType: pick(AVATAR_OPTIONS.mouthType, 10),
    skinColor: pick(AVATAR_OPTIONS.skinColor, 11),
  }
}

/** 从地址生成头像 URL（用于联系人默认头像） */
export function generateAvatarFromAddress(address: string, seed: number = 0): string {
  const combinedSeed = seed === 0 ? address.toLowerCase() : `${address.toLowerCase()}:${seed}`
  const config = generateAvatarFromSeed(combinedSeed)
  return `avatar:${encodeAvatar(config)}`
}


