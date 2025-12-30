import { describe, it, expect } from 'vitest'
import {
  getWindowFlipFrame,
  computeInvertTransform,
  generateKeyframes,
} from '../flip-animator'
import type { FlipFrames } from '../types'

describe('flip-animator', () => {
  describe('getWindowFlipFrame', () => {
    it('returns full screen rect without safe area', () => {
      const frame = getWindowFlipFrame()

      expect(frame.rect.x).toBe(0)
      expect(frame.rect.y).toBe(0)
      expect(frame.rect.width).toBe(window.innerWidth)
      expect(frame.rect.height).toBe(window.innerHeight)
      expect(frame.opacity).toBe(1)
      expect(frame.borderRadius).toBe(0)
    })

    it('respects safe area insets', () => {
      const insets = { top: 44, bottom: 34, left: 0, right: 0 }
      const frame = getWindowFlipFrame(insets)

      expect(frame.rect.x).toBe(0)
      expect(frame.rect.y).toBe(44)
      expect(frame.rect.width).toBe(window.innerWidth)
      expect(frame.rect.height).toBe(window.innerHeight - 44 - 34)
    })
  })

  describe('computeInvertTransform', () => {
    it('calculates correct translation and scale', () => {
      const frames: FlipFrames = {
        first: {
          rect: DOMRect.fromRect({ x: 100, y: 200, width: 60, height: 60 }),
          opacity: 1,
          borderRadius: 13,
        },
        last: {
          rect: DOMRect.fromRect({ x: 0, y: 0, width: 375, height: 812 }),
          opacity: 1,
          borderRadius: 0,
        },
        duration: 400,
        easing: 'ease',
      }

      const invert = computeInvertTransform(frames)

      expect(invert.x).toBe(100) // 100 - 0
      expect(invert.y).toBe(200) // 200 - 0
      expect(invert.scaleX).toBeCloseTo(60 / 375)
      expect(invert.scaleY).toBeCloseTo(60 / 812)
    })
  })

  describe('generateKeyframes', () => {
    it('generates correct keyframes for launch animation', () => {
      const frames: FlipFrames = {
        first: {
          rect: DOMRect.fromRect({ x: 50, y: 100, width: 60, height: 60 }),
          opacity: 1,
          borderRadius: 13,
        },
        last: {
          rect: DOMRect.fromRect({ x: 0, y: 0, width: 300, height: 600 }),
          opacity: 1,
          borderRadius: 0,
        },
        duration: 400,
        easing: 'ease',
      }

      const keyframes = generateKeyframes(frames)

      expect(keyframes).toHaveLength(2)

      // First keyframe (inverted position)
      expect(keyframes[0]).toHaveProperty('transform')
      expect(keyframes[0]?.borderRadius).toBe('13px')
      expect(keyframes[0]?.opacity).toBe(1)

      // Last keyframe (final position)
      expect(keyframes[1]?.transform).toBe('translate(0, 0) scale(1, 1)')
      expect(keyframes[1]?.borderRadius).toBe('0px')
      expect(keyframes[1]?.opacity).toBe(1)
    })
  })
})
