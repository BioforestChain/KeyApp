/**
 * E2E 测试 - 联系人与地址输入集成
 * 
 * 测试场景：
 * 1. 注入钱包和联系人数据
 * 2. 验证 AddressBookPage 能看到联系人
 * 3. 验证 AddressInput 能看到联系人建议
 * 4. 验证 ContactPickerJob 能看到联系人
 */

import { test, expect, type Page } from '@playwright/test'

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
  test('Step 1: 通讯录页面能看到预置联系人', async ({ page }) => {
    await setupTestData(page)
    await page.goto('/#/address-book')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: 'e2e/screenshots/contact-01-address-book.png',
      fullPage: true,
    })

    // 检查联系人是否显示
    const contactName = page.locator(`text=${TEST_CONTACT.name}`)
    await expect(contactName).toBeVisible({ timeout: 5000 })
    console.log(`[OK] Contact "${TEST_CONTACT.name}" visible in address book`)
  })

  test('Step 2: 转账页面 AddressInput 聚焦后显示联系人建议', async ({ page }) => {
    await setupTestData(page)
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: 'e2e/screenshots/contact-02-send-page.png',
      fullPage: true,
    })

    // 点击地址输入框
    const addressInputField = page.locator('input').first()
    await addressInputField.click()
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: 'e2e/screenshots/contact-03-address-input-focused.png',
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
        path: 'e2e/screenshots/contact-04-ERROR-no-contacts.png',
        fullPage: true,
      })
    }

    // 检查联系人是否在建议中
    const suggestionWithContact = page.locator(`[role="option"]:has-text("${TEST_CONTACT.name}")`)
    const contactInSuggestions = await suggestionWithContact.isVisible()
    console.log(`Contact "${TEST_CONTACT.name}" in suggestions: ${contactInSuggestions}`)

    if (contactInSuggestions) {
      await page.screenshot({ 
        path: 'e2e/screenshots/contact-05-suggestions-with-contact.png',
        fullPage: true,
      })
    }

    // 断言：不应该显示"暂无联系人"
    expect(noContactsVisible).toBe(false)
  })

  test('Step 3: ContactPickerJob 能看到联系人', async ({ page }) => {
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
        path: 'e2e/screenshots/contact-06-contact-picker.png',
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
          path: 'e2e/screenshots/contact-07-ERROR-picker-no-contacts.png',
          fullPage: true,
        })
      }

      expect(noContactsInPickerVisible).toBe(false)
    }
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
