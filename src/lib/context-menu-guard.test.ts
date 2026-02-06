import { describe, expect, it } from 'vitest'
import { shouldBlockContextMenu } from './context-menu-guard'

describe('shouldBlockContextMenu', () => {
  it('should allow input element', () => {
    const input = document.createElement('input')
    expect(shouldBlockContextMenu(input)).toBe(false)
  })

  it('should allow textarea element', () => {
    const textarea = document.createElement('textarea')
    expect(shouldBlockContextMenu(textarea)).toBe(false)
  })

  it('should allow contenteditable element', () => {
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    expect(shouldBlockContextMenu(editable)).toBe(false)
  })

  it('should allow children inside contenteditable element', () => {
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    const child = document.createElement('span')
    editable.appendChild(child)

    expect(shouldBlockContextMenu(child)).toBe(false)
  })

  it('should allow nodes inside explicit allow-context-menu container', () => {
    const container = document.createElement('div')
    container.dataset.allowContextMenu = 'true'
    const child = document.createElement('button')
    container.appendChild(child)

    expect(shouldBlockContextMenu(child)).toBe(false)
  })

  it('should block context menu for regular elements', () => {
    const div = document.createElement('div')
    expect(shouldBlockContextMenu(div)).toBe(true)
  })

  it('should block when target is null', () => {
    expect(shouldBlockContextMenu(null)).toBe(true)
  })
})
