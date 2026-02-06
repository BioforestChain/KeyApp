const CONTEXT_MENU_ALLOW_SELECTOR = [
  '[data-allow-context-menu="true"]',
  'input',
  'textarea',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
].join(', ')

function toElement(target: EventTarget | null): Element | null {
  if (target instanceof Element) return target
  if (target instanceof Node) return target.parentElement
  return null
}

/**
 * Returns true when KeyApp should block browser context menu.
 */
export function shouldBlockContextMenu(target: EventTarget | null): boolean {
  const element = toElement(target)
  if (!element) return true
  return !element.closest(CONTEXT_MENU_ALLOW_SELECTOR)
}
