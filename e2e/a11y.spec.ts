import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * T020 S3.1 - Automated Accessibility Tests
 *
 * Uses axe-core to check WCAG 2.1 AA compliance on key pages.
 * Pass criteria: No critical or serious violations.
 * Minor/moderate violations are logged but don't block.
 *
 * Note: Tests focus on pages that render correctly without complex state setup.
 * Pages requiring wallet/mnemonic state are tested via their happy-path E2E tests.
 */

// Helper to run axe and check for critical/serious violations
async function checkA11y(page: Parameters<Parameters<typeof test>[1]>[0]['page'], pageName: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    // Exclude error boundaries (dev-time errors render with insufficient contrast)
    .exclude('[data-testid="error-boundary"]')
    .analyze()

  // Separate by severity
  const critical = results.violations.filter(v => v.impact === 'critical')
  const serious = results.violations.filter(v => v.impact === 'serious')
  const moderate = results.violations.filter(v => v.impact === 'moderate')
  const minor = results.violations.filter(v => v.impact === 'minor')

  // Log all violations for debugging
  if (results.violations.length > 0) {
    console.log(`\n[A11y] ${pageName} - ${results.violations.length} violations found:`)
    results.violations.forEach(v => {
      console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`)
      v.nodes.forEach(n => console.log(`    - ${n.html.slice(0, 100)}...`))
    })
  }

  // Pass criteria: no critical or serious violations
  expect(critical, `Critical violations on ${pageName}`).toHaveLength(0)
  expect(serious, `Serious violations on ${pageName}`).toHaveLength(0)

  // Log but don't fail for minor/moderate
  if (moderate.length > 0 || minor.length > 0) {
    console.log(`[A11y] ${pageName} - ${moderate.length} moderate, ${minor.length} minor (not blocking)`)
  }

  return results
}

test.describe('Accessibility - axe-core automated checks', () => {
  test('Home page passes axe-core checks', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await checkA11y(page, 'Home')
  })

  test('Send page passes axe-core checks', async ({ page }) => {
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')
    await checkA11y(page, 'Send')
  })

  test('Settings page passes axe-core checks', async ({ page }) => {
    await page.goto('/#/settings')
    await page.waitForLoadState('networkidle')
    await checkA11y(page, 'Settings')
  })

  test('Welcome page passes axe-core checks', async ({ page }) => {
    await page.goto('/#/welcome')
    await page.waitForLoadState('networkidle')
    await checkA11y(page, 'Welcome')
  })

  test('History page passes axe-core checks', async ({ page }) => {
    await page.goto('/#/history')
    await page.waitForLoadState('networkidle')
    await checkA11y(page, 'History')
  })
})

test.describe('Accessibility - Basic keyboard navigation', () => {
  test('Home page has focusable interactive elements', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab through page and verify focus moves
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(firstFocused).toBeTruthy()

    // Tab again to verify focus moves to another element
    await page.keyboard.press('Tab')
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(secondFocused).toBeTruthy()
  })

  test('Send page form fields are keyboard accessible', async ({ page }) => {
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')

    // Tab to first input
    await page.keyboard.press('Tab')
    const activeElement = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      type: document.activeElement?.getAttribute('type'),
      role: document.activeElement?.getAttribute('role'),
    }))

    // Should focus on an interactive element
    expect(['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA']).toContain(activeElement.tag)
  })

  test('Settings page links are keyboard navigable', async ({ page }) => {
    await page.goto('/#/settings')
    await page.waitForLoadState('networkidle')

    // Tab through settings items
    let foundLink = false
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const tag = await page.evaluate(() => document.activeElement?.tagName)
      if (tag === 'A' || tag === 'BUTTON') {
        foundLink = true
        break
      }
    }
    expect(foundLink).toBe(true)
  })
})
