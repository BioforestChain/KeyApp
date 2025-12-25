/**
 * QR Scanner 可靠性测试
 * 
 * 这些测试需要在浏览器环境中运行（通过 Storybook/Playwright）
 * 因为需要真实的 Canvas 支持来生成和变换 QR 码
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { QRScanner, createQRScanner } from '../index'
import {
  generateQRImageData,
  generateTransformedQR,
  getCanvasImageData,
  runReliabilityTest,
  STANDARD_TEST_CASES,
} from '../test-utils'

// 跳过这些测试在 jsdom 环境中（Canvas 功能有限）
// 这些测试会在 Storybook 测试中运行
const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')

describe.skipIf(isJsdom)('QR Scanner Reliability', () => {
  let scanner: QRScanner

  beforeAll(async () => {
    scanner = createQRScanner({ useWorker: false })
    await scanner.waitReady()
  })

  afterAll(() => {
    scanner.destroy()
  })

  describe('Basic QR Detection', () => {
    it('should detect simple text QR', async () => {
      const imageData = await generateQRImageData('Hello World')
      const result = await scanner.scan(imageData)
      
      expect(result).not.toBeNull()
      expect(result!.content).toBe('Hello World')
      expect(result!.duration).toBeGreaterThan(0)
    })

    it('should detect URL QR', async () => {
      const url = 'https://example.com/path?query=value'
      const imageData = await generateQRImageData(url)
      const result = await scanner.scan(imageData)
      
      expect(result).not.toBeNull()
      expect(result!.content).toBe(url)
    })

    it('should detect Ethereum address QR', async () => {
      const address = 'ethereum:0x1234567890123456789012345678901234567890'
      const imageData = await generateQRImageData(address)
      const result = await scanner.scan(imageData)
      
      expect(result).not.toBeNull()
      expect(result!.content).toBe(address)
    })

    it('should detect Bitcoin address QR', async () => {
      const address = 'bitcoin:1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
      const imageData = await generateQRImageData(address)
      const result = await scanner.scan(imageData)
      
      expect(result).not.toBeNull()
      expect(result!.content).toBe(address)
    })
  })

  describe('Error Correction Levels', () => {
    const levels = ['L', 'M', 'Q', 'H'] as const

    for (const level of levels) {
      it(`should detect QR with ECC level ${level}`, async () => {
        const imageData = await generateQRImageData(`ECC Level ${level}`, {
          errorCorrectionLevel: level,
        })
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe(`ECC Level ${level}`)
      })
    }
  })

  describe('Different Sizes', () => {
    const sizes = [100, 150, 200, 300, 400]

    for (const size of sizes) {
      it(`should detect QR at size ${size}px`, async () => {
        const imageData = await generateQRImageData(`Size ${size}`, { width: size })
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe(`Size ${size}`)
      })
    }
  })

  describe('Transformations', () => {
    describe('Scale', () => {
      const scales = [0.5, 0.75, 1.0, 1.25, 1.5]

      for (const scale of scales) {
        it(`should detect QR at scale ${scale}`, async () => {
          const canvas = await generateTransformedQR(
            `Scale ${scale}`,
            { width: 200 },
            { scale }
          )
          const imageData = getCanvasImageData(canvas)
          const result = await scanner.scan(imageData)
          
          expect(result).not.toBeNull()
          expect(result!.content).toBe(`Scale ${scale}`)
        })
      }
    })

    describe('Rotation', () => {
      const angles = [0, 15, 30, 45, 90, 180, 270]

      for (const rotate of angles) {
        it(`should detect QR rotated ${rotate}°`, async () => {
          const canvas = await generateTransformedQR(
            `Rotate ${rotate}`,
            { width: 200, errorCorrectionLevel: 'H' },
            { rotate }
          )
          const imageData = getCanvasImageData(canvas)
          const result = await scanner.scan(imageData)
          
          expect(result).not.toBeNull()
          expect(result!.content).toBe(`Rotate ${rotate}`)
        })
      }
    })

    describe('Noise', () => {
      it('should detect QR with low noise (10)', async () => {
        const canvas = await generateTransformedQR(
          'Low Noise',
          { width: 200, errorCorrectionLevel: 'H' },
          { noise: 10 }
        )
        const imageData = getCanvasImageData(canvas)
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe('Low Noise')
      })

      it('should detect QR with medium noise (20)', async () => {
        const canvas = await generateTransformedQR(
          'Medium Noise',
          { width: 200, errorCorrectionLevel: 'H' },
          { noise: 20 }
        )
        const imageData = getCanvasImageData(canvas)
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe('Medium Noise')
      })
    })

    describe('Blur', () => {
      it('should detect QR with slight blur (1)', async () => {
        const canvas = await generateTransformedQR(
          'Slight Blur',
          { width: 300, errorCorrectionLevel: 'H' },
          { blur: 1 }
        )
        const imageData = getCanvasImageData(canvas)
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe('Slight Blur')
      })
    })

    describe('Brightness and Contrast', () => {
      it('should detect dark QR (brightness -30)', async () => {
        const canvas = await generateTransformedQR(
          'Dark Image',
          { width: 200 },
          { brightness: -30 }
        )
        const imageData = getCanvasImageData(canvas)
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe('Dark Image')
      })

      it('should detect bright QR (brightness +30)', async () => {
        const canvas = await generateTransformedQR(
          'Bright Image',
          { width: 200 },
          { brightness: 30 }
        )
        const imageData = getCanvasImageData(canvas)
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe('Bright Image')
      })

      it('should detect low contrast QR', async () => {
        const canvas = await generateTransformedQR(
          'Low Contrast',
          { width: 200, errorCorrectionLevel: 'H' },
          { contrast: 0.7 }
        )
        const imageData = getCanvasImageData(canvas)
        const result = await scanner.scan(imageData)
        
        expect(result).not.toBeNull()
        expect(result!.content).toBe('Low Contrast')
      })
    })
  })

  describe('Combined Transformations', () => {
    it('should detect QR with easy combined transforms', async () => {
      const canvas = await generateTransformedQR(
        'Easy Combined',
        { width: 200, errorCorrectionLevel: 'H' },
        { scale: 0.8, rotate: 5, noise: 5 }
      )
      const imageData = getCanvasImageData(canvas)
      const result = await scanner.scan(imageData)
      
      expect(result).not.toBeNull()
      expect(result!.content).toBe('Easy Combined')
    })

    it('should detect QR with medium combined transforms', async () => {
      const canvas = await generateTransformedQR(
        'Medium Combined',
        { width: 300, errorCorrectionLevel: 'H' },
        { scale: 0.7, rotate: 10, noise: 10 }
      )
      const imageData = getCanvasImageData(canvas)
      const result = await scanner.scan(imageData)
      
      expect(result).not.toBeNull()
      expect(result!.content).toBe('Medium Combined')
    })
  })

  describe('Full Reliability Report', () => {
    it('should pass at least 80% of standard test cases', async () => {
      const report = await runReliabilityTest(scanner, STANDARD_TEST_CASES)
      
      console.log('=== QR Scanner Reliability Report ===')
      console.log(`Pass Rate: ${(report.passRate * 100).toFixed(1)}%`)
      console.log(`Passed: ${report.passed}/${report.totalCases}`)
      console.log(`Average Scan Time: ${report.avgScanTime.toFixed(2)}ms`)
      console.log('')
      
      // 打印失败的用例
      const failed = report.results.filter(r => !r.passed)
      if (failed.length > 0) {
        console.log('Failed cases:')
        for (const f of failed) {
          console.log(`  - ${f.name}: expected "${f.expectedContent}", got "${f.actualContent}"`)
        }
      }
      
      expect(report.passRate).toBeGreaterThanOrEqual(0.8)
    })
  })
})
