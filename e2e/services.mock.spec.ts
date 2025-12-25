import { test, expect } from '@playwright/test';
import { UI_TEXT } from './helpers/i18n';

/**
 * Service 集成 E2E 测试
 *
 * 验证 Mock 服务的注入和控制能力
 * 
 * 注意：使用 data-testid 和多语言正则，避免硬编码文本
 */

// 测试钱包数据（匹配 store 格式）
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', tokens: [] },
        { chain: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', tokens: [] },
        { chain: 'tron', address: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
};

// 设置测试钱包
async function setupTestWallet(page: import('@playwright/test').Page, targetUrl: string = '/') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data));
  }, TEST_WALLET_DATA);

  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`;
  await page.goto(hashUrl);
  await page.waitForLoadState('networkidle');
}

test.describe('ClipboardService', () => {
  // 跳过：需要 mock 服务设置 window.__CLIPBOARD__
  test.skip('复制地址到剪贴板', async ({ page }) => {
    await setupTestWallet(page);

    // 点击复制按钮
    await page.click('button[aria-label="复制地址"]');
    await page.waitForTimeout(100);

    // 验证剪贴板内容
    const clipboardContent = await page.evaluate(() => window.__CLIPBOARD__);
    expect(clipboardContent).toBe('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  });
});

test.describe('ToastService', () => {
  // 跳过：需要 mock 服务设置 window.__TOAST_HISTORY__
  test.skip('复制后显示 Toast', async ({ page }) => {
    await setupTestWallet(page);

    // 清空 toast 历史（安全初始化）
    await page.evaluate(() => {
      window.__TOAST_HISTORY__ = [];
    });

    // 点击复制按钮
    await page.click('button[aria-label="复制地址"]');
    await page.waitForTimeout(100);

    // 验证 Toast 被调用
    const toastHistory = await page.evaluate(() => window.__TOAST_HISTORY__ || []);
    expect(toastHistory.length).toBeGreaterThan(0);
    // Toast 可能是字符串或对象，检查消息内容
    const hasMessage = toastHistory.some(
      (t: unknown) =>
        t === '地址已复制' ||
        (typeof t === 'object' && t !== null && 'message' in t && (t as { message: string }).message === '地址已复制'),
    );
    expect(hasMessage).toBe(true);
  });
});

test.describe('HapticsService', () => {
  // 跳过：需要 mock 服务设置 window.__HAPTIC_HISTORY__
  test.skip('复制后触发触觉反馈', async ({ page }) => {
    await setupTestWallet(page);

    // 清空 haptic 历史（安全初始化）
    await page.evaluate(() => {
      window.__HAPTIC_HISTORY__ = [];
    });

    // 点击复制按钮
    await page.click('button[aria-label="复制地址"]');
    await page.waitForTimeout(100);

    // 验证触觉反馈被调用
    const hapticHistory = await page.evaluate(() => window.__HAPTIC_HISTORY__ || []);
    expect(hapticHistory.length).toBeGreaterThan(0);
    expect(hapticHistory[0].type).toBe('light');
  });
});

// TODO: BiometricService 测试需要通过复杂的 UI 导航到钱包详情页
// 当前 Stackflow 的 tab 导航选择器需要调整
test.describe.skip('BiometricService', () => {
  test('验证成功 - 显示功能提示', async ({ page }) => {
    await setupTestWallet(page);
    // 通过 UI 导航到钱包详情页（使用多语言正则）
    await page.locator(`text=${UI_TEXT.wallet.source}`).first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="wallet-item"]').first().click();

    // 等待页面加载
    const exportBtn = page.locator(`[data-testid="export-mnemonic-button"], button:has-text("${UI_TEXT.exportMnemonic.source}")`);
    await exportBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 配置 Mock（使用正确的全局变量 __MOCK_BIOMETRIC__）
    await page.evaluate(() => {
      window.__MOCK_BIOMETRIC__ = { available: true, biometricType: 'fingerprint', shouldSucceed: true };
      window.__TOAST_HISTORY__ = [];
    });

    await exportBtn.click();
    await page.waitForTimeout(600);

    const toastHistory = await page.evaluate(() => window.__TOAST_HISTORY__ || []);
    const hasMessage = toastHistory.some(
      (t: unknown) =>
        t === '助记词导出功能开发中' ||
        (typeof t === 'object' && t !== null && 'message' in t && (t as { message: string }).message === '助记词导出功能开发中'),
    );
    expect(hasMessage).toBe(true);
  });

  test('验证失败 - 显示失败提示', async ({ page }) => {
    await setupTestWallet(page);
    // 通过 UI 导航到钱包详情页（使用多语言正则）
    await page.locator(`text=${UI_TEXT.wallet.source}`).first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="wallet-item"]').first().click();

    const exportBtn = page.locator(`[data-testid="export-mnemonic-button"], button:has-text("${UI_TEXT.exportMnemonic.source}")`);
    await exportBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 配置 Mock: 验证失败
    await page.evaluate(() => {
      window.__MOCK_BIOMETRIC__ = { available: true, biometricType: 'fingerprint', shouldSucceed: false };
      window.__TOAST_HISTORY__ = [];
    });

    await exportBtn.click();
    await page.waitForTimeout(600);

    const toastHistory = await page.evaluate(() => window.__TOAST_HISTORY__ || []);
    const hasFailedToast = toastHistory.some(
      (t: unknown) =>
        typeof t === 'object' && t !== null && 'message' in t && (t as { message: string }).message === '验证失败',
    );
    expect(hasFailedToast).toBe(true);
  });

  test('不可用时跳过验证', async ({ page }) => {
    await setupTestWallet(page);
    // 通过 UI 导航到钱包详情页（使用多语言正则）
    await page.locator(`text=${UI_TEXT.wallet.source}`).first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="wallet-item"]').first().click();

    const exportBtn = page.locator(`[data-testid="export-mnemonic-button"], button:has-text("${UI_TEXT.exportMnemonic.source}")`);
    await exportBtn.waitFor({ state: 'visible', timeout: 10000 });

    // 配置 Mock: 不可用
    await page.evaluate(() => {
      window.__MOCK_BIOMETRIC__ = { available: false, biometricType: 'none', shouldSucceed: false };
      window.__TOAST_HISTORY__ = [];
    });

    await exportBtn.click();
    await page.waitForTimeout(200);

    const toastHistory = await page.evaluate(() => window.__TOAST_HISTORY__ || []);
    const hasMessage = toastHistory.some(
      (t: unknown) =>
        t === '助记词导出功能开发中' ||
        (typeof t === 'object' && t !== null && 'message' in t && (t as { message: string }).message === '助记词导出功能开发中'),
    );
    expect(hasMessage).toBe(true);
  });
});
