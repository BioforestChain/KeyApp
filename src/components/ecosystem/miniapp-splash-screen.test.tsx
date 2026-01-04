import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  MiniappSplashScreen,
  extractHue,
  generateGlowHues,
} from './miniapp-splash-screen'

describe('MiniappSplashScreen', () => {
  const defaultApp = {
    name: 'Test App',
    icon: 'https://example.com/icon.png',
    themeColor: '#ff0000',
  }

  describe('extractHue', () => {
    it('returns default hue for undefined', () => {
      expect(extractHue(undefined)).toBe(280)
    })

    it('handles number input directly', () => {
      expect(extractHue(120)).toBe(120)
      expect(extractHue(400)).toBe(40) // normalized
      expect(extractHue(-30)).toBe(330) // normalized
    })

    it('extracts hue from hex color', () => {
      // Red
      expect(extractHue('#ff0000')).toBe(0)
      // Green
      expect(extractHue('#00ff00')).toBe(120)
      // Blue
      expect(extractHue('#0000ff')).toBe(240)
    })

    it('extracts hue from rgb color', () => {
      expect(extractHue('rgb(255, 0, 0)')).toBe(0)
      expect(extractHue('rgb(0, 255, 0)')).toBe(120)
      expect(extractHue('rgb(0, 0, 255)')).toBe(240)
    })

    it('extracts hue from oklch color', () => {
      expect(extractHue('oklch(0.6 0.2 30)')).toBe(30)
      expect(extractHue('oklch(0.5 0.15 280)')).toBe(280)
    })

    it('extracts hue from hsl color', () => {
      expect(extractHue('hsl(180, 50%, 50%)')).toBe(180)
      expect(extractHue('hsl(45, 100%, 75%)')).toBe(45)
    })
  })

  describe('generateGlowHues', () => {
    it('generates three hues with correct offsets', () => {
      const [primary, secondary, tertiary] = generateGlowHues(100)
      expect(primary).toBe(100)
      expect(secondary).toBe(130) // +30
      expect(tertiary).toBe(70) // -30
    })

    it('normalizes hues correctly', () => {
      const [primary, secondary, tertiary] = generateGlowHues(350)
      expect(primary).toBe(350)
      expect(secondary).toBe(20) // 350 + 30 = 380 -> 20
      expect(tertiary).toBe(320) // 350 - 30 = 320
    })

    it('handles zero hue', () => {
      const [primary, secondary, tertiary] = generateGlowHues(0)
      expect(primary).toBe(0)
      expect(secondary).toBe(30)
      expect(tertiary).toBe(330) // 0 - 30 = -30 -> 330
    })
  })

  describe('rendering', () => {
    it('renders with correct test id', () => {
      render(<MiniappSplashScreen app={defaultApp} visible={true} />)
      expect(screen.getByTestId('miniapp-splash-screen')).toBeInTheDocument()
    })

    it('sets visible data attribute correctly', () => {
      const { rerender } = render(
        <MiniappSplashScreen app={defaultApp} visible={true} />
      )
      expect(screen.getByTestId('miniapp-splash-screen')).toHaveAttribute(
        'data-visible',
        'true'
      )

      rerender(<MiniappSplashScreen app={defaultApp} visible={false} />)
      expect(screen.getByTestId('miniapp-splash-screen')).toHaveAttribute(
        'data-visible',
        'false'
      )
    })

    it('sets animating data attribute correctly', () => {
      const { rerender } = render(
        <MiniappSplashScreen app={defaultApp} visible={true} animating={true} />
      )
      expect(screen.getByTestId('miniapp-splash-screen')).toHaveAttribute(
        'data-animating',
        'true'
      )

      rerender(
        <MiniappSplashScreen app={defaultApp} visible={true} animating={false} />
      )
      expect(screen.getByTestId('miniapp-splash-screen')).toHaveAttribute(
        'data-animating',
        'false'
      )
    })

    it('renders app icon image', () => {
      render(<MiniappSplashScreen app={defaultApp} visible={true} />)
      const img = screen.getByAltText('Test App')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/icon.png')
    })

    it('has correct accessibility attributes', () => {
      render(<MiniappSplashScreen app={defaultApp} visible={true} />)
      const element = screen.getByTestId('miniapp-splash-screen')
      expect(element).toHaveAttribute('role', 'status')
      expect(element).toHaveAttribute('aria-label', 'Test App 正在加载')
    })

    it('hides from screen readers when not visible', () => {
      render(<MiniappSplashScreen app={defaultApp} visible={false} />)
      const element = screen.getByTestId('miniapp-splash-screen')
      expect(element).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies custom className', () => {
      render(
        <MiniappSplashScreen
          app={defaultApp}
          visible={true}
          className="custom-class"
        />
      )
      expect(screen.getByTestId('miniapp-splash-screen')).toHaveClass(
        'custom-class'
      )
    })

    it('sets CSS variables for glow colors', () => {
      const app = { ...defaultApp, themeColor: 100 } // hue = 100
      render(<MiniappSplashScreen app={app} visible={true} />)

      const element = screen.getByTestId('miniapp-splash-screen')
      const style = element.style

      expect(style.getPropertyValue('--splash-hue-primary')).toBe('100')
      expect(style.getPropertyValue('--splash-hue-secondary')).toBe('130')
      expect(style.getPropertyValue('--splash-hue-tertiary')).toBe('70')
    })
  })
})
