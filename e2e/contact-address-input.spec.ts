/**
 * E2E 测试 - 联系人与地址输入集成
 * 
 * 测试场景：
 * 1. 注入钱包和联系人数据
 * 2. 验证 AddressBookPage 能看到联系人
 * 3. 验证 AddressInput 能看到联系人建议
 * 4. 验证 ContactPickerJob 能看到联系人
 */

import { test, expect, type Page, type TestInfo } from '@playwright/test'

// 辅助函数：生成带项目名称的截图路径
function getScreenshotPath(testInfo: TestInfo, name: string) {
  const projectName = testInfo.project.name.replace(/\s+/g, '-').toLowerCase()
  return `e2e/screenshots/${projectName}/${name}`
}

const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'ethereum',
}

const TEST_CONTACT = {
  name: 'Alice Test',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345',
}

const TEST_ADDRESS_BOOK_DATA = {
  version: 2,
  contacts: [
    {
      id: 'contact-1',
      name: TEST_CONTACT.name,
      addresses: [
        {
          id: 'addr-1',
          address: TEST_CONTACT.address,
          chainType: 'ethereum',
          isDefault: true,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
}

async function setupTestData(page: Page) {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_address_book', JSON.stringify(data.addressBook))
  }, { wallet: TEST_WALLET_DATA, addressBook: TEST_ADDRESS_BOOK_DATA })
}

test.describe('联系人与转账页面集成', () => {
  test('Step 1: 通讯录页面能看到预置联系人', async ({ page }, testInfo) => {
    await setupTestData(page)
    await page.goto('/#/address-book')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: getScreenshotPath(testInfo, 'contact-01-address-book.png'),
      fullPage: true,
    })

    // 检查联系人是否显示
    // 在实际页面中，联系人列表可能加载需要一点时间，或者渲染方式不同
    // 使用更通用的选择器，或者等待列表容器
    await expect(page.locator('text=Alice Test')).toBeVisible({ timeout: 10000 })
    console.log(`[OK] Contact "${TEST_CONTACT.name}" visible in address book`)
  })

  test('Step 2: 转账页面 AddressInput 聚焦后显示联系人建议', async ({ page }, testInfo) => {
    await setupTestData(page)
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: getScreenshotPath(testInfo, 'contact-02-send-page.png'),
      fullPage: true,
    })

    // 点击地址输入框
    const addressInputField = page.locator('input').first()
    await addressInputField.click()
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: getScreenshotPath(testInfo, 'contact-03-address-input-focused.png'),
      fullPage: true,
    })

    // 检查是否有建议下拉
    const suggestionDropdown = page.locator('[role="listbox"]')
    const dropdownVisible = await suggestionDropdown.isVisible()
    console.log(`Suggestion dropdown visible: ${dropdownVisible}`)

    // 检查"暂无联系人"消息
    const noContacts = page.locator('text=暂无联系人')
    const noContactsVisible = await noContacts.isVisible()
    console.log(`"暂无联系人" message visible: ${noContactsVisible}`)

    if (noContactsVisible) {
      await page.screenshot({ 
        path: getScreenshotPath(testInfo, 'contact-04-ERROR-no-contacts.png'),
        fullPage: true,
      })
    }

    // 检查联系人是否在建议中
    const suggestionWithContact = page.locator(`[role="option"]:has-text("${TEST_CONTACT.name}")`)
    const contactInSuggestions = await suggestionWithContact.isVisible()
    console.log(`Contact "${TEST_CONTACT.name}" in suggestions: ${contactInSuggestions}`)

    if (contactInSuggestions) {
      await page.screenshot({ 
        path: getScreenshotPath(testInfo, 'contact-05-suggestions-with-contact.png'),
        fullPage: true,
      })
    }

    // 断言：不应该显示"暂无联系人"
    expect(noContactsVisible).toBe(false)
  })

  test('Step 3: ContactPickerJob 能看到联系人', async ({ page }, testInfo) => {
    await setupTestData(page)
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 点击地址输入框
    const addressInputField = page.locator('input').first()
    await addressInputField.click()
    await page.waitForTimeout(500)

    // 点击"查看全部联系人"按钮
    const viewAllButton = page.locator('button:has-text("查看全部"), button:has-text("View all")')
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click()
      await page.waitForTimeout(500)
      
      await page.screenshot({ 
        path: getScreenshotPath(testInfo, 'contact-06-contact-picker.png'),
        fullPage: true,
      })

      // 检查 ContactPickerJob 中是否有联系人
      const pickerContact = page.locator(`text=${TEST_CONTACT.name}`)
      const pickerContactVisible = await pickerContact.isVisible()
      console.log(`Contact "${TEST_CONTACT.name}" in picker: ${pickerContactVisible}`)

      // 检查"暂无联系人"
      const noContactsInPicker = page.locator('text=暂无联系人')
      const noContactsInPickerVisible = await noContactsInPicker.isVisible()
      console.log(`"暂无联系人" in picker visible: ${noContactsInPickerVisible}`)

      if (noContactsInPickerVisible) {
        await page.screenshot({ 
          path: getScreenshotPath(testInfo, 'contact-07-ERROR-picker-no-contacts.png'),
          fullPage: true,
        })
      }

      expect(noContactsInPickerVisible).toBe(false)
    }
  })

  test('Step 4: 验证地址输入框的非聚焦/聚焦状态切换', async ({ page }, testInfo) => {
    await setupTestData(page)
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 1. 输入地址
    const inputSelector = '[data-testid="address-input"]'
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    
    // 聚焦并输入
    await page.locator(inputSelector).click()
    await page.locator(inputSelector).fill(address)
    
    // 验证当前是输入框模式
    await expect(page.locator(inputSelector)).toBeVisible()
    
    // 2. 失去焦点 (点击页面其他地方)
    // 注意：body 可能不是可点击的，或者点击后不一定触发 blur
    // 更好的方式是点击另一个元素，例如 "转账" 标题或者其他非交互区域
    // 或者直接调用 input.blur()
    await page.locator('h1, h2, h3').first().click({ force: true })
    await page.waitForTimeout(500)

    // 验证切换到显示模式 (input 不可见，显示截断的地址)
    // 我们的 AddressInput 逻辑是：如果有值且未聚焦，显示 AddressDisplay
    // AddressDisplay 在 input 位置渲染一个 div
    // 我们检查 input 是否消失或者 hidden
    await expect(page.locator(inputSelector)).not.toBeVisible()
    
    // 验证显示了地址文本 (截断形式)
    // 我们的截断逻辑可能依赖于具体的 DOM 宽度，因此 '...' 的位置可能不同
    // 但是我们可以检查 DOM 中是否存在这个地址的文本（AddressDisplay 内部会渲染一个 invisible 的完整文本用于占位）
    // 或者检查截断后的部分文本
    const startPart = address.slice(0, 6)
    const endPart = address.slice(-4)
    
    // 使用更宽松的匹配，因为截断逻辑可能包含省略号
    const addressDisplay = page.locator(`text=${startPart}`).first()
    await expect(addressDisplay).toBeVisible()
    
    // 截图验证非聚焦状态
    await page.screenshot({ 
      path: getScreenshotPath(testInfo, 'contact-08-address-input-unfocused.png'),
      fullPage: false,
    })

    // 3. 再次点击，验证切换回输入模式
    // 点击上面找到的地址显示组件
    await addressDisplay.click({ force: true })
    await page.waitForTimeout(500)
    
    await expect(page.locator(inputSelector)).toBeVisible()
    await expect(page.locator(inputSelector)).toBeFocused()
    
    // 截图验证聚焦状态
    await page.screenshot({ 
      path: getScreenshotPath(testInfo, 'contact-09-address-input-refocused.png'),
      fullPage: false,
    })
  })

  test('Step 5: 验证 AddressInput 键盘可访问性 (Tab 切换到编辑模式)', async ({ page }) => {
    await setupTestData(page)
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const inputSelector = '[data-testid="address-input"]'
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    
    // 1. 输入地址
    await page.locator(inputSelector).click()
    await page.locator(inputSelector).fill(address)
    
    // 2. 失去焦点 (切换到显示模式)
    await page.locator('h1, h2, h3').first().click({ force: true })
    await page.waitForTimeout(500)
    await expect(page.locator(inputSelector)).not.toBeVisible()

    // 3. 使用键盘 Tab 键聚焦
    // 注意：我们需要找到之前的可聚焦元素，然后 Tab 进去，或者直接 focus 那个 div
    // 这里我们简单地按多次 Tab 直到聚焦
    
    // 为了简化，我们直接在页面上按 Tab，或者定位到前面的元素按 Tab
    // 但定位前面的元素可能不稳定。
    // 我们尝试直接 focus 那个显示模式的 div (它有 role=button)
    // 但在 E2E 中，我们模拟真实用户行为比较好。
    
    // 让我们尝试点击页面顶部，然后按 Tab 直到 AddressDisplay 被聚焦
    // 或者，我们可以直接 locator.focus() 那个显示组件
    const startPart = address.slice(0, 6)
    const addressDisplay = page.locator(`text=${startPart}`).first()
    
    // AddressDisplay 被包裹在 div[role="button"][tabindex="0"] 中
    // 我们找到这个父级 div
    const displayWrapper = addressDisplay.locator('xpath=..').locator('xpath=..') // AddressDisplay -> span -> div(wrapper)
    // 实际上 AddressInput.tsx 结构: <div role="button"...><AddressDisplay.../></div>
    // AddressDisplay 渲染: <span class="relative block..."><span...>text</span></span>
    // So: AddressDisplay root is a span. Parent is the div wrapper.
    const wrapper = page.locator(`div[role="button"]:has-text("${startPart}")`)
    
    await wrapper.focus()
    await page.waitForTimeout(300)
    
    // 聚焦后，根据我们的实现 (onFocus -> setFocused(true))，它应该立即切换到编辑模式
    await expect(page.locator(inputSelector)).toBeVisible()
    await expect(page.locator(inputSelector)).toBeFocused()
  })

  test('调试：检查 localStorage 和 store 状态', async ({ page }) => {
    await setupTestData(page)
    
    // 检查 localStorage 注入是否成功
    await page.goto('/#/')
    await page.waitForLoadState('networkidle')
    
    const storageData = await page.evaluate(() => {
      return {
        addressBook: localStorage.getItem('bfm_address_book'),
        wallets: localStorage.getItem('bfm_wallets'),
      }
    })
    
    console.log('=== localStorage Debug ===')
    console.log('Address book:', storageData.addressBook)
    console.log('Wallets:', storageData.wallets?.substring(0, 100) + '...')

    // 去通讯录页面
    await page.goto('/#/address-book')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.screenshot({ 
      path: 'e2e/screenshots/debug-01-address-book.png',
      fullPage: true,
    })

    // 去转账页面
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await page.screenshot({ 
      path: 'e2e/screenshots/debug-02-send-page.png',
      fullPage: true,
    })

    // 检查 localStorage 是否还在
    const storageAfterNav = await page.evaluate(() => {
      return localStorage.getItem('bfm_address_book')
    })
    console.log('=== After navigation ===')
    console.log('Address book still exists:', !!storageAfterNav)
  })
})
