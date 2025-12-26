import { describe, it, expect } from 'vitest'
import {
  encodeAvatar,
  decodeAvatar,
  generateRandomAvatar,
  generateAvatarFromSeed,
  type AvatarConfig,
} from '../avatar-codec'

describe('avatar-codec', () => {
  it('should encode and decode avatar config correctly', () => {
    const config: AvatarConfig = {
      topType: 'LongHairMiaWallace',
      hairColor: 'BrownDark',
      accessoriesType: 'Prescription02',
      facialHairType: 'Blank',
      facialHairColor: 'Black',
      clotheType: 'Hoodie',
      clotheColor: 'PastelBlue',
      graphicType: 'Bat',
      eyeType: 'Happy',
      eyebrowType: 'Default',
      mouthType: 'Smile',
      skinColor: 'Light',
    }

    const encoded = encodeAvatar(config)
    expect(encoded.length).toBe(8)

    const decoded = decodeAvatar(encoded)
    expect(decoded).toEqual(config)
  })

  it('should generate 8-character base64 string', () => {
    const config = generateRandomAvatar()
    const encoded = encodeAvatar(config)

    expect(encoded.length).toBe(8)
    expect(/^[A-Za-z0-9+/=]+$/.test(encoded)).toBe(true)
  })

  it('should generate consistent avatar from same seed', () => {
    const seed = 'test-user-123'
    const avatar1 = generateAvatarFromSeed(seed)
    const avatar2 = generateAvatarFromSeed(seed)

    expect(avatar1).toEqual(avatar2)
  })

  it('should generate different avatars from different seeds', () => {
    const avatar1 = generateAvatarFromSeed('user-a')
    const avatar2 = generateAvatarFromSeed('user-b')

    expect(avatar1).not.toEqual(avatar2)
  })

  it('should handle invalid encoded string gracefully', () => {
    const decoded = decodeAvatar('invalid!')
    expect(decoded.topType).toBeDefined()
    expect(decoded.skinColor).toBeDefined()
  })

  it('should encode all possible option combinations', () => {
    for (let i = 0; i < 10; i++) {
      const config = generateRandomAvatar()
      const encoded = encodeAvatar(config)
      const decoded = decodeAvatar(encoded)

      expect(decoded).toEqual(config)
    }
  })
})
