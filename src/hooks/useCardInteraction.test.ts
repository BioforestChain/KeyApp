import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardInteraction } from './useCardInteraction'

describe('useCardInteraction', () => {
  let element: HTMLDivElement

  beforeEach(() => {
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => useCardInteraction())

    expect(result.current.pointerX).toBe(0)
    expect(result.current.pointerY).toBe(0)
    expect(result.current.isActive).toBe(false)
    expect(result.current.style).toEqual({
      '--pointer-x': 0,
      '--pointer-y': 0,
    })
    expect(typeof result.current.bindElement).toBe('function')
  })

  it('updates pointer position on mouse move', () => {
    const { result } = renderHook(() => useCardInteraction())

    act(() => {
      result.current.bindElement(element)
    })

    // Mock getBoundingClientRect
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    // Simulate pointer enter and move
    act(() => {
      element.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
      element.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          clientX: 75, // 0.75 * 100 - 0.5 = 0.25 normalized
          clientY: 25, // 0.25 * 100 - 0.5 = -0.25 normalized
        })
      )
    })

    expect(result.current.isActive).toBe(true)
    // x = ((75 - 0) / 100 - 0.5) * 2 = 0.5
    // y = ((25 - 0) / 100 - 0.5) * 2 = -0.5
    expect(result.current.pointerX).toBeCloseTo(0.5, 1)
    expect(result.current.pointerY).toBeCloseTo(-0.5, 1)
  })

  it('resets on pointer leave', () => {
    const { result } = renderHook(() => useCardInteraction())

    act(() => {
      result.current.bindElement(element)
    })

    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    act(() => {
      element.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
      element.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 75, clientY: 25 })
      )
    })

    expect(result.current.isActive).toBe(true)

    act(() => {
      element.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
    })

    expect(result.current.isActive).toBe(false)
    expect(result.current.pointerX).toBe(0)
    expect(result.current.pointerY).toBe(0)
  })

  it('respects touchStrength option', () => {
    const { result } = renderHook(() => useCardInteraction({ touchStrength: 0.5 }))

    act(() => {
      result.current.bindElement(element)
    })

    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    act(() => {
      element.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }))
      element.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 50 })
      )
    })

    // At edge (100, 50): normalized x = ((100-0)/100 - 0.5)*2 = 1.0
    // y = ((50-0)/100 - 0.5)*2 = 0.0
    // With touchStrength 0.5: x = 1.0 * 0.5 = 0.5, y = 0 * 0.5 = 0
    expect(result.current.pointerX).toBeCloseTo(0.5, 1)
    expect(result.current.pointerY).toBeCloseTo(0, 1)
  })

  it('cleans up event listeners when rebinding to new element', () => {
    const { result } = renderHook(() => useCardInteraction())

    const addEventListenerSpy = vi.spyOn(element, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener')

    act(() => {
      result.current.bindElement(element)
    })

    expect(addEventListenerSpy).toHaveBeenCalled()

    // Bind to null should clean up
    act(() => {
      result.current.bindElement(null)
    })

    // Event listeners should be cleaned up when binding to null
    expect(removeEventListenerSpy).toHaveBeenCalled()
  })

  it('handles null element gracefully', () => {
    const { result } = renderHook(() => useCardInteraction())

    act(() => {
      result.current.bindElement(null)
    })

    expect(result.current.pointerX).toBe(0)
    expect(result.current.pointerY).toBe(0)
  })
})
